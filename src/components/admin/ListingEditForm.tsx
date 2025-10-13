import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ListingEditFormProps {
  listing: any;
  onSave: (updates: any) => void;
  onCancel: () => void;
}

export function ListingEditForm({ listing, onSave, onCancel }: ListingEditFormProps) {
  const [formData, setFormData] = useState({
    title: listing.title || '',
    description: listing.description || '',
    price_month: listing.price_month || 0,
    city: listing.city || '',
    neighborhood: listing.neighborhood || '',
    status: listing.status || 'draft',
    flatmates_count: listing.flatmates_count || 0,
    room_size_m2: listing.room_size_m2 || 0,
    availability_date: listing.availability_date || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Τίτλος</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Περιγραφή</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Τιμή/μήνα (€)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price_month}
            onChange={(e) => setFormData({ ...formData, price_month: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Κατάσταση</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Εκκρεμής</SelectItem>
              <SelectItem value="published">Δημοσιευμένη</SelectItem>
              <SelectItem value="archived">Αρχειοθετημένη</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Πόλη</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="neighborhood">Περιοχή</Label>
          <Input
            id="neighborhood"
            value={formData.neighborhood}
            onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="flatmates">Συγκάτοικοι</Label>
          <Input
            id="flatmates"
            type="number"
            value={formData.flatmates_count}
            onChange={(e) => setFormData({ ...formData, flatmates_count: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">Μέγεθος (m²)</Label>
          <Input
            id="size"
            type="number"
            value={formData.room_size_m2}
            onChange={(e) => setFormData({ ...formData, room_size_m2: parseInt(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">Διαθεσιμότητα</Label>
          <Input
            id="availability"
            type="date"
            value={formData.availability_date}
            onChange={(e) => setFormData({ ...formData, availability_date: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Ακύρωση
        </Button>
        <Button type="submit">
          Αποθήκευση
        </Button>
      </div>
    </form>
  );
}
