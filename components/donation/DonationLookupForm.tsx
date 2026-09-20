import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";
import styles from "./DonationPage.module.css";

export function DonationLookupForm({ reference = "" }: { reference?: string }) {
  async function lookup(formData: FormData) {
    "use server";
    const value = String(formData.get("reference") ?? "").trim().toUpperCase();
    redirect(`/donasi/${encodeURIComponent(value || "invalid")}`);
  }

  return (
    <form action={lookup} className={styles.lookup}>
      <label htmlFor="donation-reference">Nomor Referensi Donasi</label>
      <p id="reference-hint" className={styles.note}>
        Masukkan kode dari konfirmasi donasi, misalnya DON-2026-00001.
      </p>
      <input
        id="donation-reference"
        name="reference"
        type="text"
        required
        defaultValue={reference}
        placeholder="DON-2026-00001"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={40}
        aria-describedby="reference-hint"
        className={styles.referenceInput}
      />
      <Button type="submit">Cek Ulang Referensi</Button>
    </form>
  );
}
