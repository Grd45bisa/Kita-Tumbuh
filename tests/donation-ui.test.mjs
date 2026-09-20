import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

// Render the real components/routes. Mock only framework routing, CSS modules,
// and the server action boundary; this does not execute Next's RSC transport.
const require = createRequire(import.meta.url);
const projectRoot = fileURLToPath(new URL("../", import.meta.url));

function uiLoader(actions = {}) {
  const cache = new Map();
  function load(path) {
    const filename = [path, `${path}.tsx`, `${path}.ts`].find(existsSync);
    assert.ok(filename, `TypeScript module is missing: ${path}`);
    if (cache.has(filename)) return cache.get(filename).exports;
    const loaded = { exports: {} };
    cache.set(filename, loaded);
    const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    });
    const resolveImport = (name) => {
      if (name.endsWith(".module.css")) return {};
      if (name === "next/link") {
        return function Link({ children, ...props }) {
          return React.createElement("a", props, children);
        };
      }
      if (name === "next/navigation") {
        return { redirect: (url) => { throw new Error(`redirect:${url}`); } };
      }
      if (name === "@/lib/domain/donations") return actions;
      if (name === "@/lib/env") return { env: { siteUrl: "https://example.test" } };
      if (name.startsWith("@/")) return load(resolve(projectRoot, name.slice(2)));
      if (name.startsWith(".")) return load(resolve(dirname(filename), name));
      return require(name);
    };
    new Function("require", "module", "exports", outputText)(resolveImport, loaded, loaded.exports);
    return loaded.exports;
  }
  return (path) => load(resolve(projectRoot, path));
}

const receipt = {
  reference: "DON-2026-100000",
  waste_type_name: "Material fixture",
  estimated_quantity: 2.5,
  verified_quantity: null,
  unit: "L",
  status: "SUBMITTED",
};

const privateFields = {
  donor_name: "PRIVATE_DONOR_NAME",
  donor_email: "PRIVATE_EMAIL@example.test",
  donor_phone: "PRIVATE_PHONE",
  donor_notes: "PRIVATE_DONOR_NOTE",
  user_id: "PRIVATE_OWNER",
  verification_notes: "PRIVATE_VERIFICATION_NOTE",
  pickup_address_line1: "PRIVATE_PICKUP_ADDRESS",
  pickup_requests: { address_line1: "PRIVATE_NESTED_ADDRESS" },
};

function assertPublicReceipt(html) {
  assert.match(html, /DON-2026-100000/);
  assert.match(html, /Material fixture/);
  assert.match(html, /2,5 L/);
  assert.doesNotMatch(html, /PRIVATE_/);
  assert.doesNotMatch(html, /Ringkasan Dampak|Impact Summary|Coming Soon|segera hadir|Rp\s?\d|penerima manfaat/i);
}

test("ImpactReceipt omits unavailable verified quantity and any unsupported impact summary", () => {
  const { ImpactReceipt } = uiLoader()("components/donation/ImpactReceipt.tsx");
  const html = renderToStaticMarkup(React.createElement(ImpactReceipt, {
    donation: { ...receipt, ...privateFields },
  }));
  assertPublicReceipt(html);
  assert.doesNotMatch(html, /<dt>Jumlah Terverifikasi<\/dt>/);
  assert.match(html, /Jumlah di atas adalah perkiraan donor/);
  assert.match(html, /<dd>Donasi Didaftarkan<\/dd>/);
});

test("ImpactReceipt preserves a real verified quantity of zero", () => {
  const { ImpactReceipt } = uiLoader()("components/donation/ImpactReceipt.tsx");
  const html = renderToStaticMarkup(React.createElement(ImpactReceipt, {
    donation: { ...receipt, verified_quantity: 0, status: "VERIFIED" },
  }));
  assert.match(html, /<dt>Jumlah Terverifikasi<\/dt><dd>0 L<\/dd>/);
  assert.doesNotMatch(html, /Jumlah di atas adalah perkiraan donor/);
});

test("ImpactReceipt renders IMPACTED without inventing an impact summary", () => {
  const { ImpactReceipt } = uiLoader()("components/donation/ImpactReceipt.tsx");
  const html = renderToStaticMarkup(React.createElement(ImpactReceipt, {
    donation: { ...receipt, verified_quantity: 2, status: "IMPACTED", ...privateFields },
  }));
  assertPublicReceipt(html);
  assert.match(html, /<dd>Dampak Tercatat<\/dd>/);
});

test("DonationSuccess uses the server receipt and links Bagikan Dampak to the public version", () => {
  const { DonationSuccess } = uiLoader()("components/donation/DonationSuccess.tsx");
  const html = renderToStaticMarkup(React.createElement(DonationSuccess, {
    donation: receipt,
    method: "DROP_OFF",
  }));
  assertPublicReceipt(html);
  assert.match(html, /Donasi Berhasil Didaftarkan!/);
  assert.match(html, /href="\/donasi\/DON-2026-100000\/receipt"[^>]*>Bagikan Dampak<\/a>/);
  assert.match(html, /<dd>Donasi Didaftarkan<\/dd>/);
});

test("duplicate confirmation preserves the recorded status and verified amount without new-donation instructions", () => {
  const { DonationSuccess } = uiLoader()("components/donation/DonationSuccess.tsx");
  const html = renderToStaticMarkup(React.createElement(DonationSuccess, {
    donation: { ...receipt, status: "IMPACTED", verified_quantity: 1.75 },
    method: "PICKUP",
    wasAlreadySubmitted: true,
  }));
  assert.match(html, /Donasi Sudah Terdaftar/);
  assert.match(html, /<dd>Dampak Tercatat<\/dd>/);
  assert.match(html, /<dt>Jumlah Terverifikasi<\/dt><dd>1,75 L<\/dd>/);
  assert.doesNotMatch(html, /Langkah Selanjutnya|Siapkan limbahmu|Jumlah di atas adalah perkiraan donor/);
});

test("tracking uses contextual missing/invalid and unavailable fallbacks with clear recovery actions", async () => {
  for (const code of ["INVALID_REFERENCE", "NOT_FOUND", "UNAVAILABLE"]) {
    const { default: Page } = uiLoader({
      getDonationByReference: async () => ({ success: false, code, error: "fixture" }),
    })("app/donasi/[reference]/page.tsx");
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ reference: "DON-2026-100000" }) }));
    assert.match(html, /Lacak Donasi/);
    assert.match(html, /<label for="donation-reference">Nomor Referensi Donasi<\/label>/);
    assert.match(html, /Cek Ulang Referensi/);
    if (code === "UNAVAILABLE") {
      assert.match(html, /role="alert"/);
      assert.match(html, /Status donasi belum dapat dimuat/);
      assert.match(html, /Coba Muat Ulang/);
      assert.doesNotMatch(html, /Donasi dengan referensi ini tidak ditemukan/);
    } else {
      assert.match(html, /role="status"/);
      assert.match(html, /Donasi dengan referensi ini tidak ditemukan/);
      assert.match(html, /Periksa kembali kodenya/);
      assert.match(html, /href="\/donasikan"/);
      assert.match(html, /Mulai Donasi Baru/);
    }
  }
});

test("tracking and receipt routes render the canonical receipt without sensitive donor/history data", async () => {
  const donation = {
    ...receipt,
    ...privateFields,
    status: "IMPACTED",
    verified_quantity: 2,
    method: "PICKUP",
    created_at: "2026-09-20T01:00:00Z",
    collection_point: null,
    status_history: [{ to_status: "IMPACTED", created_at: "2026-09-20T02:00:00Z", notes: "PRIVATE_HISTORY_NOTE" }],
  };
  const load = uiLoader({
    getDonationByReference: async () => ({ success: true, data: donation }),
    getPublicDonationReceipt: async () => ({ success: true, data: donation }),
  });
  for (const route of ["app/donasi/[reference]/page.tsx", "app/donasi/[reference]/receipt/page.tsx"]) {
    const { default: Page } = load(route);
    const html = renderToStaticMarkup(await Page({ params: Promise.resolve({ reference: receipt.reference }) }));
    assertPublicReceipt(html);
    assert.match(html, /Dampak Tercatat/);
    assert.match(html, /<dt>Jumlah Terverifikasi<\/dt><dd>2 L<\/dd>/);
  }
});

test("shareable receipt metadata supplies canonical text previews without search indexing", async () => {
  const { generateMetadata } = uiLoader()("app/donasi/[reference]/receipt/page.tsx");
  const metadata = await generateMetadata({ params: Promise.resolve({ reference: receipt.reference }) });
  assert.deepEqual(metadata.robots, { index: false, follow: false });
  assert.equal(metadata.openGraph.url, "https://example.test/donasi/DON-2026-100000/receipt");
  assert.equal(metadata.alternates.canonical, metadata.openGraph.url);
  assert.match(metadata.openGraph.title, /DON-2026-100000/);
  assert.equal(metadata.twitter.card, "summary");
});
