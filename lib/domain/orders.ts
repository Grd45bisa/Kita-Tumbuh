"use server";

import { createClient } from "@/lib/supabase/server";
import { CreateOrderSchema, type CreateOrderInput } from "@/lib/validation/order-schema";
import type { OrderActionResult, PublicOrderTracking } from "@/types/orders";

/**
 * Generate human-readable order reference like ORD-2026-84920
 */
function generateOrderReference(): string {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(10000 + Math.random() * 90000);
  return `ORD-${year}-${randomPart}`;
}

export interface CreateOrderResult {
  reference: string;
  orderId: string;
  total: number;
}

/**
 * Create a new order with line items.
 *
 * Rules:
 * 1. Price is retrieved strictly server-side from public.products table.
 * 2. Available stock is validated server-side.
 * 3. Inventory is NOT decremented here (it occurs upon PAID payment confirmation).
 * 4. Anonymous checkout is permitted while capturing user_id if logged in.
 */
export async function createOrderAction(
  rawInput: CreateOrderInput
): Promise<OrderActionResult<CreateOrderResult>> {
  const parseResult = CreateOrderSchema.safeParse(rawInput);
  if (!parseResult.success) {
    const fieldErrors: Record<string, string[]> = {};
    parseResult.error.issues.forEach((issue) => {
      const field = issue.path.join(".");
      fieldErrors[field] = fieldErrors[field] ?? [];
      fieldErrors[field].push(issue.message);
    });
    return {
      success: false,
      error: "Validasi pesanan gagal. Periksa data yang kamu masukkan.",
      fieldErrors,
      code: "VALIDATION_ERROR",
    };
  }

  const input = parseResult.data;
  const supabase = await createClient();

  // 1. Fetch live products server-side
  const productIds = input.items.map((i) => i.product_id);
  const { data: products, error: productError } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity, is_public")
    .in("id", productIds);

  if (productError || !products || products.length === 0) {
    return {
      success: false,
      error: "Produk tidak ditemukan atau tidak tersedia.",
      code: "NOT_FOUND",
    };
  }

  const productMap = new Map(products.map((p) => [p.id, p]));

  // 2. Validate availability, active public status, and stock
  let subtotal = 0;
  const verifiedItems: Array<{
    product_id: string;
    product_name_snapshot: string;
    product_price_snapshot: number;
    quantity: number;
    subtotal: number;
  }> = [];

  for (const item of input.items) {
    const product = productMap.get(item.product_id);
    if (!product || !product.is_public) {
      return {
        success: false,
        error: `Produk "${item.product_id}" saat ini tidak tersedia untuk dibeli.`,
        code: "NOT_FOUND",
      };
    }

    if (Number(product.stock_quantity) < item.quantity) {
      return {
        success: false,
        error: `Stok produk "${product.name}" tidak mencukupi (tersedia: ${product.stock_quantity}, dipesan: ${item.quantity}).`,
        code: "INSUFFICIENT_STOCK",
      };
    }

    const price = Number(product.price);
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;

    verifiedItems.push({
      product_id: product.id,
      product_name_snapshot: product.name,
      product_price_snapshot: price,
      quantity: item.quantity,
      subtotal: itemSubtotal,
    });
  }

  const total = subtotal; // For MVP without shipping cost additions

  // 3. Capture authenticated user if exists (supports anonymous/guest)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Generate reference with retry for uniqueness
  let orderReference = "";
  let orderId = "";

  for (let attempt = 0; attempt < 3; attempt++) {
    const candidateRef = generateOrderReference();

    const { data: orderData, error: orderInsertError } = await supabase
      .from("orders")
      .insert({
        reference: candidateRef,
        user_id: user?.id ?? null,
        customer_name: input.customer_name,
        customer_email: input.customer_email,
        customer_phone: input.customer_phone,
        shipping_address: input.shipping_address,
        customer_notes: input.customer_notes || null,
        status: "PENDING_PAYMENT",
        payment_status: "UNPAID",
        payment_method: "MANUAL_TRANSFER",
        subtotal,
        total,
        currency: "IDR",
      })
      .select("id, reference")
      .single();

    if (orderInsertError) {
      // If collision on reference, retry
      if (orderInsertError.code === "23505") {
        continue;
      }
      console.error("[createOrderAction] Order insert failed:", orderInsertError);
      return {
        success: false,
        error: "Gagal membuat pesanan. Silakan coba kembali sesaat lagi.",
      };
    }

    orderId = orderData.id;
    orderReference = orderData.reference;
    break;
  }

  if (!orderId) {
    return {
      success: false,
      error: "Gagal mengalokasikan nomor pesanan. Coba lagi dalam beberapa saat.",
    };
  }

  // 5. Insert order items snapshot
  const itemInserts = verifiedItems.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    product_price_snapshot: item.product_price_snapshot,
    quantity: item.quantity,
    subtotal: item.subtotal,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemInserts);

  if (itemsError) {
    console.error("[createOrderAction] Order items insert failed:", itemsError);
    // Cleanup order to prevent orphan header
    await supabase.from("orders").delete().eq("id", orderId);
    return {
      success: false,
      error: "Gagal menyimpan rincian item pesanan.",
    };
  }

  return {
    success: true,
    data: {
      reference: orderReference,
      orderId,
      total,
    },
  };
}

/**
 * Fetch an order by reference for public tracking.
 * Only returns safe projection (no passwords, tokens, or other users' private accounts).
 */
export async function getOrderByReference(
  reference: string
): Promise<PublicOrderTracking | null> {
  if (!reference || typeof reference !== "string") {
    return null;
  }

  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      reference,
      customer_name,
      shipping_address,
      status,
      payment_status,
      payment_method,
      total,
      currency,
      created_at,
      order_items (
        product_name_snapshot,
        product_price_snapshot,
        quantity,
        subtotal
      )
    `)
    .eq("reference", reference.toUpperCase().trim())
    .maybeSingle();

  if (error || !order) {
    return null;
  }

  type OrderItemRow = {
    product_name_snapshot: string;
    product_price_snapshot: number | string;
    quantity: number;
    subtotal: number | string;
  };

  const rawItems = (order.order_items as unknown as OrderItemRow[]) || [];

  return {
    reference: order.reference,
    customer_name: order.customer_name,
    shipping_address: order.shipping_address,
    status: order.status,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    total: Number(order.total),
    currency: order.currency,
    created_at: order.created_at,
    items: rawItems.map((item) => ({
      product_name_snapshot: item.product_name_snapshot,
      product_price_snapshot: Number(item.product_price_snapshot),
      quantity: item.quantity,
      subtotal: Number(item.subtotal),
    })),
  };
}
