import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { useTourRequests } from "@/hooks/useTourRequests";
import { el } from "date-fns/locale";

interface TourSchedulerProps {
  threadId: string;
  listingId: string;
  disabled?: boolean;
}

export const TourScheduler = ({ threadId, listingId, disabled }: TourSchedulerProps) => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [notes, setNotes] = useState('');
  const { createTourRequest } = useTourRequests(threadId);

  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  const handleSchedule = async () => {
    if (!selectedDate) return;

    const [hours, minutes] = selectedTime.split(':');
    const requestedTime = new Date(selectedDate);
    requestedTime.setHours(parseInt(hours), parseInt(minutes));

    await createTourRequest(listingId, requestedTime, notes);
    setOpen(false);
    setSelectedDate(undefined);
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="rounded-full"
        >
          <CalendarIcon className="h-4 w-4 mr-2" />
          Κλείσε επίσκεψη
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Κλείσε Επίσκεψη</DialogTitle>
          <DialogDescription>
            Διάλεξε ημερομηνία και ώρα για να επισκεφτείς το ακίνητο
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Calendar */}
          <div>
            <Label>Ημερομηνία</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < new Date()}
              locale={el}
              className="rounded-md border w-full"
            />
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <Label>Ώρα</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label>Σημειώσεις (προαιρετικό)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="π.χ. Θα φέρω τον/την σύντροφό μου"
              className="mt-2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Ακύρωση
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!selectedDate}
          >
            Αποστολή αιτήματος
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
