"use client";

import React, { useState, useCallback, useRef } from "react";
import styles from "./DonationWizard.module.css";
import { DonationProgress } from "./DonationProgress";
import { StepMaterial } from "./StepMaterial";
import { StepQuantity, getTierOptions } from "./StepQuantity";
import { StepMethod } from "./StepMethod";
import { StepReview } from "./StepReview";
import { DonationSuccess } from "./DonationSuccess";
import { Button } from "@/components/ui/Button";
import { createDonation } from "@/lib/domain/donations";
import {
  clearPendingDonationSubmission,
  prepareDonationSubmission,
  type PendingDonationSubmission,
} from "@/lib/donation-submission";
import type { WasteType, CollectionPoint, PublicDonationReceipt } from "@/types/donation";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  PlantLeafIcon,
  CheckCircleIcon,
  ShieldLockIcon,
  ScaleIcon,
} from "./DonationIcons";

const TOTAL_STEPS = 4;

const STEP_ITEMS = [
  {
    number: 1,
    title: "Pilih Jenis Limbah",
    desc: "Minyak, organik, atau wadah",
  },
  {
    number: 2,
    title: "Perkiraan Jumlah",
    desc: "Tentukan estimasi berat/volume",
  },
  {
    number: 3,
    title: "Metode Penyerahan",
    desc: "Antar titik kumpul atau jemput",
  },
  {
    number: 4,
    title: "Konfirmasi Donasi",
    desc: "Periksa kembali & salurkan",
  },
];

interface FormState {
  // Step 1 — Material
  waste_type_id: string;
  waste_type_slug: string;
  waste_type_name: string;
  unit: string;
  min_quantity: number;
  max_quantity: number | null;
  // Step 2 — Quantity
  estimated_quantity: number;
  // Step 3 — Method
  method: "DROP_OFF" | "PICKUP";
  collection_point_id: string;
  pickup_address_line1: string;
  pickup_address_line2: string;
  pickup_district: string;
  pickup_city: string;
  pickup_requested_date: string;
  pickup_requested_slot: string;
  pickup_notes: string;
  donor_notes: string;
}

const initialFormState: FormState = {
  waste_type_id: "",
  waste_type_slug: "",
  waste_type_name: "",
  unit: "kg",
  min_quantity: 0.5,
  max_quantity: null,
  estimated_quantity: 1,
  method: "DROP_OFF",
  collection_point_id: "",
  pickup_address_line1: "",
  pickup_address_line2: "",
  pickup_district: "",
  pickup_city: "",
  pickup_requested_date: "",
  pickup_requested_slot: "",
  pickup_notes: "",
  donor_notes: "",
};

interface SuccessState {
  donation: PublicDonationReceipt;
  method: "DROP_OFF" | "PICKUP";
  wasAlreadySubmitted: boolean;
}

interface DonationWizardProps {
  wasteTypes: WasteType[];
  collectionPoints: CollectionPoint[];
}

export function DonationWizard({ wasteTypes, collectionPoints }: DonationWizardProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const submittingRef = useRef(false);
  const pendingSubmissionRef = useRef<PendingDonationSubmission | null>(null);

  const updateForm = useCallback((patch: Partial<FormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    // Clear errors for updated fields
    setStepErrors((prev) => {
      const next = { ...prev };
      Object.keys(patch).forEach((k) => delete next[k]);
      return next;
    });
  }, []);

  // ------------------------------------------------------------
  // Step validation
  // ------------------------------------------------------------
  function validateCurrentStep(): boolean {
    const errors: Record<string, string> = {};

    if (step === 1) {
      if (!form.waste_type_id) {
        errors.waste_type_id = "Pilih jenis limbah terlebih dahulu.";
      }
    }

    if (step === 2) {
      if (!form.estimated_quantity || form.estimated_quantity <= 0) {
        errors.estimated_quantity = "Masukkan jumlah yang valid (lebih dari 0).";
      } else if (form.estimated_quantity < form.min_quantity) {
        errors.estimated_quantity = `Minimum ${form.min_quantity} ${form.unit}.`;
      } else if (form.max_quantity && form.estimated_quantity > form.max_quantity) {
        errors.estimated_quantity = `Maksimum ${form.max_quantity} ${form.unit}.`;
      }
    }

    if (step === 3) {
      if (form.method === "DROP_OFF" && !form.collection_point_id) {
        errors.collection_point_id = "Pilih lokasi collection point.";
      }
      if (form.method === "PICKUP") {
        if (!form.pickup_address_line1 || form.pickup_address_line1.trim().length < 5) {
          errors.pickup_address_line1 = "Masukkan alamat lengkap (minimal 5 karakter).";
        }
        if (!form.pickup_requested_date) {
          errors.pickup_requested_date = "Pilih tanggal pickup.";
        } else {
          const d = new Date(form.pickup_requested_date);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0);
          if (d < tomorrow) {
            errors.pickup_requested_date = "Tanggal pickup minimal besok.";
          }
        }
      }
    }

    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleNext() {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleBack() {
    setStepErrors({});
    setServerError(undefined);
    setStep((s) => Math.max(s - 1, 1));
  }

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submittingRef.current) return;
    if (step < TOTAL_STEPS) {
      handleNext();
      return;
    }
    if (!validateCurrentStep()) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setServerError(undefined);

    try {
      const payload = {
        waste_type_id: form.waste_type_id,
        waste_type_slug: form.waste_type_slug,
        waste_type_name: form.waste_type_name,
        unit: form.unit,
        estimated_quantity: form.estimated_quantity,
        method: form.method,
        // DROP_OFF fields
        collection_point_id: form.method === "DROP_OFF" ? form.collection_point_id : undefined,
        // PICKUP fields
        pickup_address_line1: form.method === "PICKUP" ? form.pickup_address_line1 : undefined,
        pickup_address_line2: form.method === "PICKUP" ? form.pickup_address_line2 : undefined,
        pickup_district: form.method === "PICKUP" ? form.pickup_district : undefined,
        pickup_city: form.method === "PICKUP" ? form.pickup_city : undefined,
        pickup_requested_date: form.method === "PICKUP" ? form.pickup_requested_date : undefined,
        pickup_requested_slot: form.method === "PICKUP" ? form.pickup_requested_slot : undefined,
        pickup_notes: form.method === "PICKUP" ? form.pickup_notes : undefined,
        donor_notes: form.donor_notes,
      };
      const pending = await prepareDonationSubmission(payload, pendingSubmissionRef.current);
      pendingSubmissionRef.current = pending;
      const result = await createDonation({
        ...payload,
        idempotency_key: pending.key,
      });

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      setSuccess({
        donation: result.data.receipt,
        method: form.method,
        wasAlreadySubmitted: result.data.wasAlreadySubmitted,
      });
      clearPendingDonationSubmission();
      pendingSubmissionRef.current = null;
    } catch (err) {
      console.error("[donation-wizard] unexpected error:", err);
      setServerError("Terjadi kesalahan tak terduga. Coba lagi dalam beberapa saat.");
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  // ------------------------------------------------------------
  // Success screen
  // ------------------------------------------------------------
  if (success) {
    return (
      <div className={styles.wizardContainer}>
        <DonationSuccess
          donation={success.donation}
          method={success.method}
          wasAlreadySubmitted={success.wasAlreadySubmitted}
        />
      </div>
    );
  }

  // Find selected collection point for review
  const selectedCollectionPoint =
    form.method === "DROP_OFF"
      ? collectionPoints.find((cp) => cp.id === form.collection_point_id) ?? null
      : null;

  // Find selected waste type for quantity bounds
  const selectedWasteType = wasteTypes.find((wt) => wt.id === form.waste_type_id);

  // Minimal "required field present" check per step, so the Next button
  // reflects real step completeness instead of only ever checking step 1
  // (that was the bug: the button looked permanently disabled once past
  // step 1 whenever a field was empty/invalid, with no visible feedback).
  // Full validation (including quantity bounds, date rules, etc.) still
  // runs in validateCurrentStep() when the button is actually clicked.
  const isNextDisabled = (() => {
    if (step === 1) return !form.waste_type_id;
    if (step === 2) return !form.estimated_quantity || form.estimated_quantity <= 0;
    if (step === 3) {
      if (form.method === "DROP_OFF") return !form.collection_point_id;
      return !form.pickup_address_line1 || !form.pickup_requested_date;
    }
    return false;
  })();

  return (
    <div className={styles.wizardShell}>
      {/* Left Context & Progress Sidebar (Desktop & Tablet Landscape) */}
      <aside className={styles.sidebarPanel}>
        <div className={styles.sidebarHeader}>
          <div className={styles.brandBadge}>
            <PlantLeafIcon size={14} className={styles.badgeIcon} />
            <span>KITA TUMBUH · KAMPUNG SMART FARMING</span>
          </div>

          <h1 className={styles.sidebarTitle}>Donasikan Limbah Rumah Tangga</h1>

          <p className={styles.sidebarSubtitle}>
            <strong>SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.</strong> Salurkan
            minyak jelantah, limbah organik, atau plastik dapurmu untuk diolah
            menjadi produk berdaya guna dan dana sosial nyata.
          </p>
        </div>

        {/* Vertical Step Timeline for Desktop */}
        <div className={styles.desktopStepper}>
          <div className={styles.verticalSteps}>
            {STEP_ITEMS.map((item) => {
              const isDone = item.number < step;
              const isCurrent = item.number === step;
              return (
                <div
                  key={item.number}
                  className={`${styles.verticalStep} ${
                    isDone ? styles.vStepDone : ""
                  } ${isCurrent ? styles.vStepCurrent : ""}`}
                >
                  <div className={styles.vStepDot}>
                    {isDone ? (
                      <CheckIcon size={12} className={styles.vCheckIcon} />
                    ) : (
                      <span>{item.number}</span>
                    )}
                  </div>
                  <div className={styles.vStepInfo}>
                    <span className={styles.vStepTitle}>{item.title}</span>
                    <span className={styles.vStepDesc}>{item.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Selection Summary Pill */}
        {form.waste_type_name && (
          <div className={styles.liveSummaryBox}>
            <div className={styles.liveSummaryHeader}>
              <ScaleIcon size={14} />
              <span>Ringkasan Pilihanmu</span>
            </div>
            <div className={styles.liveSummaryRow}>
              <span>Kategori:</span>
              <strong>{form.waste_type_name}</strong>
            </div>
            {step >= 2 && form.estimated_quantity > 0 && (
              <div className={styles.liveSummaryRow}>
                <span>Estimasi:</span>
                <strong>
                  {new Intl.NumberFormat("id-ID", {
                    maximumFractionDigits: 1,
                  }).format(form.estimated_quantity)}{" "}
                  {form.unit === "pcs" ? "wadah" : form.unit}
                </strong>
              </div>
            )}
            {step >= 3 && (
              <div className={styles.liveSummaryRow}>
                <span>Metode:</span>
                <strong>
                  {form.method === "DROP_OFF"
                    ? "Antar ke Drop Point"
                    : "Dijemput Armada"}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* Trust Badges */}
        <div className={styles.sidebarTrust}>
          <div className={styles.trustItem}>
            <CheckCircleIcon size={14} className={styles.trustIcon} />
            <span>100% Terlacak & Transparan</span>
          </div>
          <div className={styles.trustItem}>
            <ShieldLockIcon size={14} className={styles.trustIcon} />
            <span>Gratis & Tanpa Perlu Akun</span>
          </div>
        </div>
      </aside>

      {/* Right Main Interactive Form Area */}
      <section className={styles.mainPanel}>
        {/* Mobile Header (Hidden on Desktop) */}
        <div className={styles.mobileHeaderArea}>
          <div className={styles.mobileBrandBadge}>
            <PlantLeafIcon size={12} />
            <span>KITA TUMBUH</span>
          </div>
          <h1 className={styles.mobileTitle}>Donasikan Limbah</h1>
          <p className={styles.mobileSubtitle}>
            <strong>SAMPAH KALIAN SANGAT BERARTI BAGI KAMI.</strong>
          </p>
        </div>

        {/* Mobile Horizontal Progress Bar (Hidden on Desktop) */}
        <div className={styles.mobileProgressArea}>
          <DonationProgress currentStep={step} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Active Form Card */}
        <div className={styles.formCardContainer}>
          <form
            onSubmit={handleSubmit}
            noValidate
            className={styles.stepFormWrapper}
          >
            <div className={styles.stepFormBody}>
              {step === 1 && (
                <StepMaterial
                  wasteTypes={wasteTypes}
                  selectedId={form.waste_type_id}
                  onSelect={(wt) => {
                    const defaultTier = getTierOptions(
                      wt.unit,
                      wt.min_quantity,
                      wt.max_quantity
                    )[0];
                    updateForm({
                      waste_type_id: wt.id,
                      waste_type_slug: wt.slug,
                      waste_type_name: wt.name,
                      unit: wt.unit,
                      min_quantity: wt.min_quantity,
                      max_quantity: wt.max_quantity,
                      // Reset quantity to the "Sedikit" tier value so it is clean,
                      // rounded (genap), and pre-selected in StepQuantity.
                      estimated_quantity: defaultTier ? defaultTier.value : wt.min_quantity,
                    });
                  }}
                  error={stepErrors.waste_type_id}
                />
              )}

              {step === 2 && (
                <StepQuantity
                  unit={form.unit}
                  wasteTypeName={form.waste_type_name}
                  value={form.estimated_quantity}
                  onChange={(val) => updateForm({ estimated_quantity: val })}
                  minQuantity={selectedWasteType?.min_quantity ?? 0.5}
                  maxQuantity={selectedWasteType?.max_quantity ?? null}
                  error={stepErrors.estimated_quantity}
                />
              )}

              {step === 3 && (
                <StepMethod
                  value={{
                    method: form.method,
                    collection_point_id: form.collection_point_id,
                    pickup_address_line1: form.pickup_address_line1,
                    pickup_address_line2: form.pickup_address_line2,
                    pickup_district: form.pickup_district,
                    pickup_city: form.pickup_city,
                    pickup_requested_date: form.pickup_requested_date,
                    pickup_requested_slot: form.pickup_requested_slot,
                    pickup_notes: form.pickup_notes,
                    donor_notes: form.donor_notes,
                  }}
                  onChange={(patch) => updateForm(patch as Partial<FormState>)}
                  collectionPoints={collectionPoints}
                  wasteTypeSlug={form.waste_type_slug}
                  errors={stepErrors as Record<string, string>}
                />
              )}

              {step === 4 && (
                <StepReview
                  data={{
                    wasteTypeName: form.waste_type_name,
                    unit: form.unit,
                    estimated_quantity: form.estimated_quantity,
                    method: form.method,
                    collection_point: selectedCollectionPoint,
                    pickup_requested_date: form.pickup_requested_date,
                    pickup_requested_slot: form.pickup_requested_slot,
                    donor_notes: form.donor_notes,
                  }}
                  serverError={serverError}
                  isSubmitting={isSubmitting}
                />
              )}
            </div>

            {/* Pinned Bottom Navigation */}
            <div className={styles.wizardNav}>
              {step > 1 && (
                <div className={styles.wizardNavBack}>
                  <Button
                    type="button"
                    variant="tertiary"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className={styles.navBackBtn}
                  >
                    <ArrowLeftIcon size={16} />
                    Kembali
                  </Button>
                </div>
              )}

              {step < TOTAL_STEPS ? (
                <div className={styles.wizardNavNext}>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleNext}
                    disabled={isNextDisabled}
                    className={styles.navNextBtn}
                  >
                    Lanjut
                    <ArrowRightIcon size={16} />
                  </Button>
                </div>
              ) : (
                <div className={styles.wizardNavNext}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    disabled={isSubmitting}
                    className={styles.navSubmitBtn}
                  >
                    <CheckIcon size={18} />
                    Konfirmasi Donasi
                  </Button>
                </div>
              )}
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
