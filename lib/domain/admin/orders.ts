"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePermission } from "@/lib/auth/session";
import { recordAuditLog } from "@/lib/domain/admin/audit-logs";
import {
  UpdateOrderStatusSchema,
  type UpdateOrderStatusInput,
  type OrderStatus,
} from "@/lib/validation/order-schema";
import type { Order, OrderActionResult } from "@/types/orders";

export interface GetAdminOrdersParams {
  status?: string;
  paymentStatus?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface GetAdminOrdersResult {
  orders: Order[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  error?: string;
}

/**
 * Fetch paginated list of orders for back-office admin management.
 */
export async function getAdminOrders(
  params: GetAdminOrdersParams = {}
): Promise<GetAdminOrdersResult> {
  await requirePermission("orders_sales", "read");
  const supabase = await createClient();

  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 10));
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("orders")
    .select(`
      id,
      reference,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      customer_notes,
      status,
      payment_status,
      payment_method,
      subtotal,
      total,
      currency,
      created_at,
      updated_at
    `, { count: "exact" });

  if (params.status && params.status !== "ALL") {
    query = query.eq("status", params.status);
  }

  if (params.paymentStatus && params.paymentStatus !== "ALL") {
    query = query.eq("payment_status", params.paymentStatus);
  }

  if (params.search) {
    // Escape characters with special meaning in PostgREST's .or() filter
    // grammar (comma separates conditions; *, %, and the wildcard escape
    // character itself can corrupt the ilike pattern) so a search term
    // containing them can't produce a malformed filter that silently
    // returns zero results.
    const s = params.search.trim().replace(/[,*%\\]/g, "\\$&");
    query = query.or(`reference.ilike.%${s}%,customer_name.ilike.%${s}%,customer_email.ilike.%${s}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error || !data) {
    console.error("[getAdminOrders] Error fetching orders:", error);
    return {
      orders: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
      error: error?.message || "Gagal memuat daftar pesanan.",
    };
  }

  const totalCount = count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const orders: Order[] = data.map((row) => ({
    id: row.id,
    reference: row.reference,
    user_id: row.user_id,
    customer_name: row.customer_name,
    customer_email: row.customer_email,
    customer_phone: row.customer_phone,
    shipping_address: row.shipping_address,
    customer_notes: row.customer_notes,
    status: row.status as OrderStatus,
    payment_status: row.payment_status,
    payment_method: row.payment_method,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    currency: row.currency,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    orders,
    totalCount,
    page,
    pageSize,
    totalPages,
  };
}

/**
 * Fetch full order detail with line items by order ID for admin back-office.
 */
export async function getAdminOrderById(orderId: string): Promise<Order | null> {
  await requirePermission("orders_sales", "read");
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      reference,
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      customer_notes,
      status,
      payment_status,
      payment_method,
      subtotal,
      total,
      currency,
      created_at,
      updated_at,
      order_items (
        id,
        order_id,
        product_id,
        product_name_snapshot,
        product_price_snapshot,
        quantity,
        subtotal,
        created_at
      )
    `)
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return null;
  }

  type RawItem = {
    id: string;
    order_id: string;
    product_id: string;
    product_name_snapshot: string;
    product_price_snapshot: number | string;
    quantity: number;
    subtotal: number | string;
    created_at: string;
  };

  const rawItems = (order.order_items as unknown as RawItem[]) || [];

  return {
    id: order.id,
    reference: order.reference,
    user_id: order.user_id,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    shipping_address: order.shipping_address,
    customer_notes: order.customer_notes,
    status: order.status as OrderStatus,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    subtotal: Number(order.subtotal),
    total: Number(order.total),
    currency: order.currency,
    created_at: order.created_at,
    updated_at: order.updated_at,
    items: rawItems.map((item) => ({
      id: item.id,
      order_id: item.order_id,
      product_id: item.product_id,
      product_name_snapshot: item.product_name_snapshot,
      product_price_snapshot: Number(item.product_price_snapshot),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
      created_at: item.created_at,
    })),
  };
}

export interface ConfirmPaymentInput {
  order_id: string;
  notes?: string;
}

/**
 * Confirm manual bank transfer payment for an order.
 *
 * Requirements:
 * 1. orders_sales write permission on the server.
 * 2. Order must not already be PAID or CANCELLED.
 * 3. Decrement inventory stock in `products` (ADR-020) and flip status to
 *    PAID atomically — delegated to the `execute_order_payment_confirmation`
 *    Postgres RPC (013_order_payment_fixes.sql), which row-locks the order
 *    and every affected product within a single transaction. This closes a
 *    TOCTOU race that existed in the previous application-level
 *    read-then-write loop: two concurrent confirmations touching the same
 *    product could both pass the stock check before either decremented it.
 * 4. The revenue ledger is recorded automatically by the existing
 *    trg_record_revenue_on_paid trigger, which fires within the same
 *    transaction as the RPC's order UPDATE.
 */
export async function confirmOrderPaymentAction(
  input: ConfirmPaymentInput
): Promise<OrderActionResult<{ orderId: string; reference: string }>> {
  const admin = await requirePermission("orders_sales", "write");
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("execute_order_payment_confirmation", {
    p_order_id: input.order_id,
    p_notes: input.notes
      ? `oleh ${admin.profile?.full_name || admin.email}: ${input.notes}`
      : null,
    p_confirmed_by: admin.id,
  });

  if (error) {
    console.error("[confirmOrderPaymentAction] RPC error:", error);

    // Surface the RPC's RAISE EXCEPTION message directly — it already
    // contains a specific, user-facing reason (not found / cancelled /
    // already paid / insufficient stock).
    if (error.code === "PGRST202" || error.message?.includes("does not exist")) {
      return {
        success: false,
        error: "Fungsi konfirmasi pembayaran belum tersedia di database. Jalankan migration 013 terlebih dahulu.",
      };
    }

    return {
      success: false,
      error: error.message || "Gagal mengonfirmasi pembayaran pesanan.",
      code: error.message?.includes("mencukupi") ? "INSUFFICIENT_STOCK" : undefined,
    };
  }

  const updatedOrder = data as { id: string; reference: string } | null;

  if (!updatedOrder) {
    return {
      success: false,
      error: "Gagal mengonfirmasi pembayaran pesanan.",
    };
  }

  await recordAuditLog({
    actorId: admin.id,
    action: "ORDER_PAID",
    entityType: "order",
    entityId: updatedOrder.id,
    newValue: { status: "PAID", payment_status: "PAID" },
    reason: input.notes || null,
  });
  await recordAuditLog({
    actorId: admin.id,
    action: "REVENUE_RECORDED",
    entityType: "order",
    entityId: updatedOrder.id,
    newValue: { source: "PAID_ORDER" },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${updatedOrder.id}`);
  revalidatePath(`/pesanan/${updatedOrder.reference}`);
  revalidatePath("/produk");

  return {
    success: true,
    data: {
      orderId: updatedOrder.id,
      reference: updatedOrder.reference,
    },
  };
}

/**
 * Update general order lifecycle status (PROCESSING, SHIPPED, COMPLETED, CANCELLED).
 */
export async function updateOrderStatusAction(
  rawInput: UpdateOrderStatusInput
): Promise<OrderActionResult<{ orderId: string; newStatus: OrderStatus }>> {
  await requirePermission("orders_sales", "write");

  const parseResult = UpdateOrderStatusSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Data status pesanan tidak valid.",
      code: "VALIDATION_ERROR",
    };
  }

  const { order_id, status } = parseResult.data;

  // "PAID" must only be reached via confirmOrderPaymentAction, which
  // atomically decrements stock and flips status+payment_status together
  // (see execute_order_payment_confirmation, 013_order_payment_fixes.sql).
  // Allowing it here would let an order reach status=PAID — and trigger the
  // automatic revenue ledger insert — without stock ever being decremented
  // and without payment_status being updated, leaving inconsistent state.
  if (status === "PAID") {
    return {
      success: false,
      error: 'Gunakan tombol "Tandai Pembayaran Lunas" untuk mengubah status menjadi PAID, bukan form status umum ini.',
      code: "VALIDATION_ERROR",
    };
  }

  const supabase = await createClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("id, reference, status, payment_status, order_items(product_id, quantity)")
    .eq("id", order_id)
    .single();

  if (fetchError || !order) {
    return {
      success: false,
      error: "Pesanan tidak ditemukan.",
      code: "NOT_FOUND",
    };
  }

  // If order was PAID and now CANCELLED, restore product stock
  if (status === "CANCELLED" && order.payment_status === "PAID") {
    type ItemType = { product_id: string; quantity: number };
    const items = (order.order_items as unknown as ItemType[]) || [];

    for (const item of items) {
      const { data: prod } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", item.product_id)
        .single();

      if (prod) {
        await supabase
          .from("products")
          .update({
            stock_quantity: Number(prod.stock_quantity) + item.quantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", item.product_id);
      }
    }
  }

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order_id);

  if (updateError) {
    console.error("[updateOrderStatusAction] Update error:", updateError);
    return {
      success: false,
      error: "Gagal memperbarui status pesanan.",
    };
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order_id}`);
  revalidatePath(`/pesanan/${order.reference}`);

  return {
    success: true,
    data: {
      orderId: order_id,
      newStatus: status,
    },
  };
}
