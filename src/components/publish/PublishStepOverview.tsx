import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, MapPin, Image, FileText, CheckCircle, Calendar, Euro } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface PublishStepOverviewProps {
  onNext: () => void;
  hasDraft: boolean;
}

const STEPS_PREVIEW = [
  { icon: MapPin, title: "Τοποθεσία", description: "Επιλέξτε που βρίσκεται το ακίνητο" },
  { icon: Home, title: "Ακίνητο", description: "Βασικά στοιχεία και ανέσεις" },
  { icon: Home, title: "Δωμάτιο", description: "Λεπτομέρειες δωματίου" },
  { icon: Image, title: "Φωτογραφίες", description: "Προσθέστε φωτογραφίες" },
  { icon: FileText, title: "Τίτλος & Περιγραφή", description: "Περιγράψτε το χώρο σας" },
  { icon: CheckCircle, title: "Επαληθεύσεις", description: "Τι απαιτείτε από ενοικιαστές" },
  { icon: Calendar, title: "Διαθεσιμότητα", description: "Πότε είναι διαθέσιμο" },
  { icon: Euro, title: "Τιμή", description: "Ορίστε την τιμή" },
  { icon: CheckCircle, title: "Έλεγχος", description: "Ελέγξτε και δημοσιεύστε" }
];

export default function PublishStepOverview({ onNext, hasDraft }: PublishStepOverviewProps) {
  const { profile } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">
          Καλώς ήρθατε{profile?.first_name ? `, ${profile.first_name}` : ''}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          {hasDraft 
            ? "Συνεχίστε εκεί που σταματήσατε ή ξεκινήστε νέα καταχώρηση" 
            : "Ας δημιουργήσουμε μαζί την καταχώρησή σας"}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Τι θα κάνουμε μαζί;</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {STEPS_PREVIEW.map((step, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">{step.title}</h4>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Η πρόοδός σας αποθηκεύεται αυτόματα</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Μπορείτε να σταματήσετε οποιαδήποτε στιγμή και να επιστρέψετε αργότερα. 
                Η καταχώρησή σας θα είναι εδώ σας περιμένοντας!
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>⏱️ Χρόνος: ~10-15 λεπτά</span>
                <span>•</span>
                <span>📱 Συμβατό με κινητά</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={onNext} className="min-w-[200px]">
          {hasDraft ? "Συνέχεια καταχώρησης" : "Ξεκινάμε!"}
        </Button>
      </div>
    </div>
  );
}
