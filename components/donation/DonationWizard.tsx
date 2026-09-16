"use client";

import React, { useState, useCallback } from "react";
import { randomUUID } from "crypto";
import styles from "./DonationWizard.module.css";
import { DonationProgress } from "./DonationProgress";
import { StepMaterial } from "./StepMaterial";
import { StepQuantity } from "./StepQuantity";
import { StepMethod } from "./StepMethod";
import { StepReview } from "./StepReview";
import { DonationSuccess } from "./DonationSuccess";
import { Button } from "@/components/ui/Button";
import { createDonation } from "@/lib/domain/donations";
import type { WasteType, CollectionPoint } from "@/types/donation";

const TOTAL_STEPS = 4;

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
  reference: string;
  wasteTypeName: string;
  estimatedQuantity: number;
  unit: string;
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
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setServerError(undefined);

    try {
      const idempotencyKey = randomUUID();
      const result = await createDonation({
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
        idempotency_key: idempotencyKey,
      });

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      setSuccess({
        reference: result.data.reference,
        wasteTypeName: form.waste_type_name,
        estimatedQuantity: form.estimated_quantity,
        unit: form.unit,
        method: form.method,
        wasAlreadySubmitted: result.data.wasAlreadySubmitted,
      });
    } catch (err) {
      console.error("[donation-wizard] unexpected error:", err);
      setServerError("Terjadi kesalahan tak terduga. Coba lagi dalam beberapa saat.");
    } finally {
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
          reference={success.reference}
          wasteTypeName={success.wasteTypeName}
          estimatedQuantity={success.estimatedQuantity}
          unit={success.unit}
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

  return (
    <div className={styles.wizardContainer}>
      <DonationProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      <form onSubmit={handleSubmit} noValidate>
        {step === 1 && (
          <StepMaterial
            wasteTypes={wasteTypes}
            selectedId={form.waste_type_id}
            onSelect={(wt) =>
              updateForm({
                waste_type_id: wt.id,
                waste_type_slug: wt.slug,
                waste_type_name: wt.name,
                unit: wt.unit,
                min_quantity: wt.min_quantity,
                max_quantity: wt.max_quantity,
                // Reset quantity when waste type changes
                estimated_quantity: Math.max(1, wt.min_quantity),
              })
            }
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

        {/* Navigation */}
        <div className={styles.wizardNav}>
          {step > 1 && (
            <div className={styles.wizardNavBack}>
              <Button
                type="button"
                variant="tertiary"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                ← Kembali
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
                disabled={step === 1 && !form.waste_type_id}
              >
                Lanjut →
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
              >
                Konfirmasi Donasi
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
