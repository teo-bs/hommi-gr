import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Euro } from "lucide-react";
import { format } from "date-fns";
import { el } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface ListingDraft {
  availability_date?: Date;
  availability_to?: Date;
  min_stay_months?: number;
  max_stay_months?: number;
  price_month?: number;
  deposit_required: boolean;
  bills_note?: string;
  bills_included_any?: boolean;
  bills_included?: string[];
  services: string[];
  property_size_m2?: number;
  room_size_m2?: number;
  property_type?: 'room' | 'apartment';
  [key: string]: any;
}

interface PublishStepThreeProps {
  draft: ListingDraft;
  onUpdate: (updates: Partial<ListingDraft>) => void;
  onNext: () => void;
  onPrev: () => void;
}

const SERVICES = [
  'Σύνταξη συμβολαίου', 
  'Καθαρισμός'
];

const BILL_TYPES = [
  { key: 'electricity', label: 'Ρεύμα' },
  { key: 'water', label: 'Νερό' },
  { key: 'internet', label: 'Internet' },
  { key: 'heating', label: 'Θέρμανση' },
  { key: 'municipal_fees', label: 'Δημοτικά τέλη' }
];

export default function PublishStepThree({ 
  draft, 
  onUpdate, 
  onNext, 
  onPrev 
}: PublishStepThreeProps) {
  
  const toggleService = (service: string) => {
    const current = draft.services || [];
    const updated = current.includes(service)
      ? current.filter(s => s !== service)
      : [...current, service];
    onUpdate({ services: updated });
  };

  // Use room_size_m2 for room type, property_size_m2 for apartment type
  const sizeToUse = draft.property_type === 'room' 
    ? draft.room_size_m2 
    : draft.property_size_m2;

  const pricePerM2 = draft.price_month && sizeToUse 
    ? (draft.price_month / sizeToUse).toFixed(1)
    : null;

  const isValid = draft.availability_date && draft.price_month && 
    draft.min_stay_months;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Όροι ενοικίασης</h2>
        <p className="text-muted-foreground">
          Καθορίστε τους οικονομικούς όρους και τη διαθεσιμότητα
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Availability & Stay */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Διαθεσιμότητα</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Διαθέσιμο από *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !draft.availability_date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {draft.availability_date ? (
                        format(draft.availability_date, "PPP", { locale: el })
                      ) : (
                        <span>Επιλέξτε ημερομηνία</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={draft.availability_date}
                      onSelect={(date) => onUpdate({ availability_date: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Διαθέσιμο έως (προαιρετικό)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !draft.availability_to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {draft.availability_to ? (
                        format(draft.availability_to, "PPP", { locale: el })
                      ) : (
                        <span>Άνευ ορίου</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={draft.availability_to}
                      onSelect={(date) => onUpdate({ availability_to: date })}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="min_stay">Ελάχιστη διαμονή (μήνες) *</Label>
                  <Input
                    id="min_stay"
                    type="number"
                    min="1"
                    placeholder="3"
                    defaultValue={draft.min_stay_months || ''}
                    onBlur={(e) => onUpdate({ min_stay_months: parseInt(e.target.value) || undefined })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_stay">Μέγιστη διαμονή (μήνες)</Label>
                  <Input
                    id="max_stay"
                    type="number"
                    min="1"
                    placeholder="12"
                    defaultValue={draft.max_stay_months || ''}
                    onBlur={(e) => onUpdate({ max_stay_months: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Υπηρεσίες</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {SERVICES.map((service) => (
                  <Badge
                    key={service}
                    variant={(draft.services || []).includes(service) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleService(service)}
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Pricing */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Τιμές
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rent">Μηνιαίο ενοίκιο (€) *</Label>
                <Input
                  id="rent"
                  type="number"
                  placeholder="400"
                  defaultValue={draft.price_month || ''}
                  onBlur={(e) => onUpdate({ price_month: parseInt(e.target.value) || undefined })}
                />
                {pricePerM2 && (
                  <p className="text-sm text-muted-foreground">
                    {pricePerM2}€/m² το μήνα
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Περιλαμβάνονται λογαριασμοί στο ενοίκιο;</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={draft.bills_included_any ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onUpdate({ bills_included_any: true })}
                    >
                      Ναι
                    </Button>
                    <Button
                      type="button"
                      variant={!draft.bills_included_any ? 'default' : 'outline'}
                      size="sm"
                      className="flex-1"
                      onClick={() => onUpdate({ bills_included_any: false, bills_included: [] })}
                    >
                      Όχι
                    </Button>
                  </div>
                </div>

                {draft.bills_included_any && (
                  <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                    <Label className="text-sm text-muted-foreground">
                      💡 Επιλέξτε τι περιλαμβάνεται
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {BILL_TYPES.map((bill) => (
                        <div key={bill.key} className="flex items-center space-x-2">
                          <Checkbox
                            id={bill.key}
                            checked={(draft.bills_included || []).includes(bill.key)}
                            onCheckedChange={(checked) => {
                              const current = draft.bills_included || [];
                              const updated = checked
                                ? [...current, bill.key]
                                : current.filter(b => b !== bill.key);
                              onUpdate({ bills_included: updated });
                            }}
                          />
                          <Label htmlFor={bill.key} className="text-sm font-normal cursor-pointer">
                            {bill.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="bills_note" className="text-sm">
                    Επιπλέον λεπτομέρειες (προαιρετικό)
                  </Label>
                  <Textarea
                    id="bills_note"
                    placeholder="π.χ. Θέρμανση μέχρι 50€/μήνα"
                    defaultValue={draft.bills_note || ''}
                    onBlur={(e) => onUpdate({ bills_note: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="deposit_required"
                    checked={draft.deposit_required}
                    onCheckedChange={(checked) => onUpdate({ deposit_required: !!checked })}
                  />
                  <Label htmlFor="deposit_required">Απαιτείται εγγύηση</Label>
                </div>

                {!draft.deposit_required && (
                  <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      🎉 Χωρίς εγγύηση! Αυτό κάνει την αγγελία σας πιο ελκυστική.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Σύνοψη κόστους</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Μηνιαίο ενοίκιο:</span>
                  <span className="font-semibold">
                    {draft.price_month ? `${draft.price_month}€` : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Εγγύηση:</span>
                  <span className="font-semibold">
                    {draft.deposit_required 
                      ? (draft.price_month ? `${draft.price_month}€` : '-')
                      : 'Χωρίς εγγύηση'
                    }
                  </span>
                </div>
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Σύνολο αρχικό κόστος:</span>
                  <span>
                    {draft.price_month 
                      ? `${draft.deposit_required ? draft.price_month * 2 : draft.price_month}€`
                      : '-'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>
          Πίσω
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Συνέχεια
        </Button>
      </div>
    </div>
  );
}