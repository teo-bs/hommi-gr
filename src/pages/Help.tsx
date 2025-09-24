import { Helmet } from "react-helmet-async";
import { MessageSquare, Phone, Mail, BookOpen, Users, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const Help = () => {
  return (
    <>
      <Helmet>
        <title>Βοήθεια - Hommi</title>
        <meta 
          name="description" 
          content="Βρείτε απαντήσεις σε συχνές ερωτήσεις, οδηγούς χρήσης και τρόπους επικοινωνίας με την ομάδα υποστήριξης του Hommi." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Κέντρο Βοήθειας
              </h1>
              <p className="text-lg text-muted-foreground">
                Βρείτε απαντήσεις και υποστήριξη για το Hommi
              </p>
            </div>

            {/* Contact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Live Chat</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Μιλήστε με την ομάδα μας άμεσα
                  </p>
                  <Button variant="outline" size="sm">
                    Ξεκίνημα Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Email</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Στείλτε μας email για υποστήριξη
                  </p>
                  <Button variant="outline" size="sm">
                    support@hommi.gr
                  </Button>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Τηλέφωνο</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Καλέστε μας κατά τις εργάσιμες ώρες
                  </p>
                  <Button variant="outline" size="sm">
                    210 1234567
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Οδηγοί Χρήσης
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    Πώς να δημιουργήσω αγγελία
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Πώς να βρω συγκάτοικο
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Διαχείριση προφίλ
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Πληρωμές και κρατήσεις
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Ασφάλεια
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    Συμβουλές ασφάλειας
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Αναφορά προβλήματος
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Προστασία δεδομένων
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    Όροι και προϋποθέσεις
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle>Συχνές Ερωτήσεις</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Πώς λειτουργεί το Hommi;</AccordionTrigger>
                    <AccordionContent>
                      Το Hommi συνδέει ανθρώπους που αναζητούν συγκάτοικο με ιδιοκτήτες που έχουν διαθέσιμους χώρους. 
                      Δημιουργείτε προφίλ, αναζητάτε ή δημοσιεύετε αγγελίες, και επικοινωνείτε με ασφάλεια μέσω της πλατφόρμας.
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="item-2">
                    <AccordionTrigger>Είναι δωρεάν η χρήση του Hommi;</AccordionTrigger>
                    <AccordionContent>
                      Η εγγραφή και η αναζήτηση είναι εντελώς δωρεάν. Χρεώσεις ισχύουν μόνο για επιπλέον υπηρεσίες 
                      όπως η προβολή αγγελιών και η διευκόλυνση κρατήσεων.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-3">
                    <AccordionTrigger>Πώς επαληθεύονται οι χρήστες;</AccordionTrigger>
                    <AccordionContent>
                      Όλοι οι χρήστες επαληθεύονται μέσω των στοιχείων τους. Επιπλέον, ενθαρρύνουμε την προσθήκη 
                      συστάσεων από εργασία ή σπουδές για μεγαλύτερη εμπιστοσύνη.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-4">
                    <AccordionTrigger>Τι γίνεται αν έχω πρόβλημα με έναν χρήστη;</AccordionTrigger>
                    <AccordionContent>
                      Μπορείτε να αναφέρετε οποιοδήποτε πρόβλημα μέσω της πλατφόρμας. Η ομάδα μας διερευνά όλες τις 
                      αναφορές και λαμβάνει μέτρα για τη διασφάλιση της ασφάλειας όλων.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                    <AccordionTrigger>Μπορώ να αλλάξω το προφίλ μου;</AccordionTrigger>
                    <AccordionContent>
                      Ναι, μπορείτε να επεξεργαστείτε το προφίλ σας ανά πάσα στιγμή από τις ρυθμίσεις. Ενημερώστε τις 
                      προτιμήσεις, φωτογραφίες και πληροφορίες σας όποτε θέλετε.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Help;