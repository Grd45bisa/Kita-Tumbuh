import type { Metadata } from "next";
import { getAuditLogs } from "@/lib/domain/admin/audit-logs";
import styles from "@/components/admin/AuditLog.module.css";

export const metadata: Metadata = { title: "Audit Log | Admin KITA TUMBUH", robots: { index: false, follow: false } };

interface Props { searchParams: Promise<{ actor?: string; action?: string; entity?: string; from?: string; to?: string }> }

export default async function AuditLogPage({ searchParams }: Props) {
  const filters = await searchParams;
  const logs = await getAuditLogs(filters);
  return <div>
    <header className={styles.header}>
      <h1>Audit Log</h1>
      <p>Riwayat perubahan penting. Data ini hanya dapat dibaca dan tidak dapat diubah dari aplikasi.</p>
    </header>
    <form className={styles.filters}>
      <label>Actor ID<input name="actor" defaultValue={filters.actor} placeholder="UUID pengguna" /></label>
      <label>Aksi<input name="action" defaultValue={filters.action} placeholder="ORDER_PAID" /></label>
      <label>Entitas<input name="entity" defaultValue={filters.entity} placeholder="order" /></label>
      <label>Dari<input type="date" name="from" defaultValue={filters.from} /></label>
      <label>Sampai<input type="date" name="to" defaultValue={filters.to} /></label>
      <button type="submit">Terapkan Filter</button>
    </form>
    <div className={styles.tableWrap}>
      <table><thead><tr><th>Waktu</th><th>Aksi</th><th>Entitas</th><th>Actor</th><th>Perubahan</th><th>Alasan</th></tr></thead>
      <tbody>{logs.length === 0 ? <tr><td colSpan={6}>Belum ada audit event yang cocok.</td></tr> : logs.map((log) => <tr key={log.id}>
        <td>{new Date(log.created_at).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}</td>
        <td><code>{log.action}</code></td><td>{log.entity_type}<br /><code>{log.entity_id}</code></td>
        <td><code>{log.actor_id ?? "system"}</code></td>
        <td>{log.new_value ? <code>{JSON.stringify(log.new_value)}</code> : "—"}</td><td>{log.reason ?? "—"}</td>
      </tr>)}</tbody></table>
    </div>
  </div>;
}
