import styles from "./LeafLoader.module.css";

const FLIGHT_PATH = "M 38 132 C 80 136 106 118 131 80 C 164 22 218 40 217 77 C 217 125 146 143 137 104 C 128 66 177 41 211 78 C 240 109 251 132 284 107";

function Leaf() {
  return (
    <g transform="scale(0.6)" strokeLinecap="round" strokeLinejoin="round">
      <path className={styles.stem} d="M-38 15 Q-26 18-18 9" />
      <path className={styles.blade} d="M-24 12 C-20-16 5-21 32-19 C24-10 22 10 4 17 C-6 21-17 17-24 12Z" />
      <path className={styles.fold} d="M-24 12 Q6 4 32-19 C22 11 6 23-24 12Z" />
      <path className={styles.veins} d="M-25 13 Q6 3 30-18 M-15 9 L-12-7 M-4 5 L1-13 M7-2 L14-16 M-15 10 L-3 15 M-3 5 L10 10 M8-3 L20 1" />
    </g>
  );
}

export function LeafLoader() {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <svg className={styles.scene} viewBox="0 0 320 190" fill="none" aria-hidden="true">
        <ellipse className={styles.shadow} cx="162" cy="168" rx="22" ry="2" />
        <path className={styles.trail} d={FLIGHT_PATH} pathLength="100" />
        <path className={styles.breeze} d="M45 113q24 3 38-7 M243 145q20 1 31-6" />
        <g className={styles.flyingLeaf} data-leaf-cycle>
          <g className={styles.tumblingLeaf}>
            <Leaf />
          </g>
        </g>
        <g className={styles.stillLeaf} transform="translate(160 95) rotate(-15)"><Leaf /></g>
      </svg>
      <p className={styles.brand}>KITA TUMBUH</p>
      <p className={styles.tagline}>Dari limbah, tumbuh manfaat.</p>
      <p className={styles.caption}>Sedang menyiapkan halaman<span className={styles.dots} aria-hidden="true">…</span></p>
    </div>
  );
}
