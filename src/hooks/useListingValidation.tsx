import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ValidationWarning {
  type: 'price_outlier' | 'age_outlier' | 'missing_field' | 'mandatory_field';
  field: string;
  message: string;
  value?: any;
  severity: 'warning' | 'error';
}

interface ValidationResult {
  warnings: ValidationWarning[];
  canPublish: boolean;
}

export const useListingValidation = () => {
  const { profile } = useAuth();
  const [isValidating, setIsValidating] = useState(false);

  const validateListing = useCallback(async (listing: any): Promise<ValidationResult> => {
    setIsValidating(true);
    const warnings: ValidationWarning[] = [];

    try {
      // Price outlier detection
      if (listing.price_month && listing.property_size_m2) {
        const pricePerM2 = listing.price_month / listing.property_size_m2;
        
        // Stub baseline: flag < €5/m² or > €50/m²
        if (pricePerM2 < 5) {
          warnings.push({
            type: 'price_outlier',
            field: 'price_month',
            message: `Η τιμή ανά τ.μ. (€${pricePerM2.toFixed(2)}) είναι πολύ χαμηλή. Ελέγξτε εάν είναι σωστή.`,
            value: pricePerM2,
            severity: 'warning'
          });
        } else if (pricePerM2 > 50) {
          warnings.push({
            type: 'price_outlier',
            field: 'price_month',
            message: `Η τιμή ανά τ.μ. (€${pricePerM2.toFixed(2)}) είναι πολύ υψηλή. Ελέγξτε εάν είναι σωστή.`,
            value: pricePerM2,
            severity: 'warning'
          });
        }
      }

      // Age outlier detection (if profile has age)
      if (profile?.date_of_birth) {
        const today = new Date();
        const birthDate = new Date(profile.date_of_birth);
        const age = today.getFullYear() - birthDate.getFullYear();
        
        if (age < 18 || age > 80) {
          warnings.push({
            type: 'age_outlier',
            field: 'date_of_birth',
            message: `Η ηλικία σας (${age} ετών) φαίνεται ασυνήθιστη. Ελέγξτε την ημερομηνία γέννησης.`,
            value: age,
            severity: 'warning'
          });
        }
      }

      // Missing mandatory fields validation
      const mandatoryFields = [
        { field: 'title', message: 'Ο τίτλος είναι υποχρεωτικός' },
        { field: 'city', message: 'Η πόλη είναι υποχρεωτική' },
        { field: 'price_month', message: 'Η μηνιαία τιμή είναι υποχρεωτική' },
        { field: 'photos', message: 'Τουλάχιστον μία φωτογραφία είναι υποχρεωτική' }
      ];

      for (const { field, message } of mandatoryFields) {
        const value = listing[field];
        if (!value || (Array.isArray(value) && value.length === 0)) {
          warnings.push({
            type: 'mandatory_field',
            field,
            message,
            severity: 'error'
          });
        }
      }

      // Save warnings to database
      if (listing.id && warnings.length > 0) {
        const warningsJson = warnings.reduce((acc, warning) => {
          acc[warning.field] = {
            type: warning.type,
            message: warning.message,
            severity: warning.severity,
            value: warning.value
          };
          return acc;
        }, {} as Record<string, any>);

        await supabase
          .from('listings')
          .update({ publish_warnings: warningsJson })
          .eq('id', listing.id);
      }

      const hasErrors = warnings.some(w => w.severity === 'error');
      return {
        warnings,
        canPublish: !hasErrors
      };
    } catch (error) {
      console.error('Validation error:', error);
      return {
        warnings: [{
          type: 'mandatory_field',
          field: 'general',
          message: 'Σφάλμα κατά την επαλήθευση. Δοκιμάστε ξανά.',
          severity: 'error'
        }],
        canPublish: false
      };
    } finally {
      setIsValidating(false);
    }
  }, [profile]);

  return {
    validateListing,
    isValidating
  };
};