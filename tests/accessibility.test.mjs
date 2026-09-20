import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

// =============================================================================
// Regression guards for Phase 12 accessibility fixes.
// =============================================================================

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

function readSource(relativePath) {
  return readFileSync(resolve(repoRoot, relativePath), "utf8");
}

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(hexToRgb(hex1));
  const l2 = luminance(hexToRgb(hex2));
  const [lighter, darker] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (lighter + 0.05) / (darker + 0.05);
}

function extractHexToken(source, tokenName) {
  const match = source.match(new RegExp(`--${tokenName}:\\s*(#[0-9A-Fa-f]{6})`));
  assert.ok(match, `Expected to find --${tokenName} as a literal hex value in tokens.css`);
  return match[1];
}

// P0-1203 — found during Phase 12 audit: --color-ink-500 (the base value
// behind --color-text-muted, used at caption/12px and body-s/14px sizes —
// both "normal text" under WCAG, not "large text") was #7E8780, a 3.71:1
// ratio against white — below the 4.5:1 AA minimum for normal text.
test("--color-ink-500 (backing --color-text-muted) meets WCAG AA (4.5:1) against paper backgrounds", () => {
  const tokens = readSource("styles/tokens.css");
  const inkMuted = extractHexToken(tokens, "color-ink-500");
  const paperWhite = extractHexToken(tokens, "color-paper-0");
  const paperCanvas = extractHexToken(tokens, "color-paper-50");

  const ratioOnWhite = contrastRatio(inkMuted, paperWhite);
  const ratioOnCanvas = contrastRatio(inkMuted, paperCanvas);

  assert.ok(
    ratioOnWhite >= 4.5,
    `--color-ink-500 (${inkMuted}) on --color-paper-0 (${paperWhite}) is ${ratioOnWhite.toFixed(2)}:1, below the WCAG AA 4.5:1 minimum for normal-weight text.`
  );
  assert.ok(
    ratioOnCanvas >= 4.5,
    `--color-ink-500 (${inkMuted}) on --color-paper-50 (${paperCanvas}) is ${ratioOnCanvas.toFixed(2)}:1, below the WCAG AA 4.5:1 minimum for normal-weight text.`
  );
});

test("semantic status color pairs (success/warning/danger/info fg-on-bg) meet WCAG AA", () => {
  const tokens = readSource("styles/tokens.css");
  const pairs = ["success", "warning", "danger", "info"];

  for (const status of pairs) {
    const fg = extractHexToken(tokens, `color-${status}-fg`);
    const bg = extractHexToken(tokens, `color-${status}-bg`);
    const ratio = contrastRatio(fg, bg);
    assert.ok(
      ratio >= 4.5,
      `--color-${status}-fg (${fg}) on --color-${status}-bg (${bg}) is ${ratio.toFixed(2)}:1, below WCAG AA 4.5:1.`
    );
  }
});

// P0-1202 — found during Phase 12 audit: Select and Textarea destructured
// `required` out of props (to render the visual "*" mark) but never passed
// it back to the underlying <select>/<textarea> element, so screen readers
// were never told the field was required even though it visually looked
// required. Input.tsx had the same class of gap via its separate
// `isRequired` prop, which no form in the codebase actually used.
test("Select, Textarea, and Input forward the required attribute to the real form control", () => {
  const selectSource = readSource("components/ui/Select.tsx");
  const textareaSource = readSource("components/ui/Textarea.tsx");
  const inputSource = readSource("components/ui/Input.tsx");

  assert.match(
    selectSource,
    /<select[\s\S]*?required=\{required\}/,
    "Select.tsx: <select> must receive required={required}, not just render a visual '*' mark"
  );
  assert.match(
    textareaSource,
    /<textarea[\s\S]*?required=\{required\}/,
    "Textarea.tsx: <textarea> must receive required={required}, not just render a visual '*' mark"
  );
  assert.match(
    inputSource,
    /<input[\s\S]*?required=\{required\}/,
    "Input.tsx: <input> must receive required={required}, not just render a visual '*' mark"
  );
});

// P0-1201 — found during Phase 12 audit: the one modal dialog in the app
// (InventoryAdjustmentModal) had role="dialog" + aria-modal="true" but no
// Escape handling, no focus trap, and no initial/restored focus management.
test("InventoryAdjustmentModal implements Escape-to-close and focus management", () => {
  const source = readSource("components/admin/InventoryAdjustmentModal.tsx");
  assert.match(source, /role="dialog"/);
  assert.match(source, /aria-modal="true"/);
  assert.match(source, /e\.key === "Escape"/, "Expected an Escape key handler that closes the dialog");
  assert.match(source, /e\.key === "Tab"/, "Expected a Tab key handler implementing a focus trap");
  assert.match(source, /\.focus\(\)/, "Expected explicit .focus() calls for initial focus and focus restoration");
});

// P0-1202 / WCAG 2.2.2 — found during Phase 12 audit: a continuously
// looping "in progress" indicator animation had no prefers-reduced-motion
// guard, unlike short (<1s) loading spinners elsewhere in the app.
test("DonationTimeline's continuous pulse animation respects prefers-reduced-motion", () => {
  const source = readSource("components/donation/DonationTimeline.module.css");
  assert.match(source, /animation:\s*pulse[\s\S]*?infinite/);
  assert.match(
    source,
    /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.dotPulse\s*\{[\s\S]*?animation:\s*none/,
    "Expected a prefers-reduced-motion block that disables .dotPulse's animation"
  );
});
