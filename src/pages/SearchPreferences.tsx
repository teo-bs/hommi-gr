import { Helmet } from "react-helmet-async";
import { Search, MapPin, Home, Users, Heart, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";

const SearchPreferences = () => {
  return (
    <>
      <Helmet>
        <title>Προτιμήσεις Αναζήτησης - Hommi</title>
        <meta 
          name="description" 
          content="Καθορίστε τις προτιμήσεις αναζήτησής σας στο Hommi για να βρείτε πιο εύκολα τον ιδανικό χώρο και συγκάτοικο." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Προτιμήσεις Αναζήτησης
              </h1>
              <p className="text-muted-foreground">
                Καθορίστε τις προτιμήσεις σας για να βρίσκετε πιο εύκολα ό,τι ψάχνετε
              </p>
            </div>

            <div className="space-y-6">
              {/* Location Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Περιοχή & Τοποθεσία
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preferred-city">Προτιμώμενη Πόλη</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Επιλέξτε πόλη" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="athens">Αθήνα</SelectItem>
                        <SelectItem value="thessaloniki">Θεσσαλονίκη</SelectItem>
                        <SelectItem value="patras">Πάτρα</SelectItem>
                        <SelectItem value="heraklion">Ηράκλειο</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Προτιμώμενες Περιοχές</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Κέντρο</Badge>
                      <Badge variant="secondary">Κολωνάκι</Badge>
                      <Badge variant="secondary">Εξάρχεια</Badge>
                      <Button variant="outline" size="sm">
                        + Προσθήκη Περιοχής
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Budget */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Προϋπολογισμός & Χώρος
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Μηνιαίος Προϋπολογισμός (€)</Label>
                    <div className="px-3">
                      <Slider
                        defaultValue={[400]}
                        max={1000}
                        min={200}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground mt-1">
                        <span>200€</span>
                        <span className="font-medium">400€</span>
                        <span>1000€+</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Τύπος Χώρου</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Επιλέξτε τύπο" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private-room">Ιδιωτικό Δωμάτιο</SelectItem>
                          <SelectItem value="shared-room">Κοινό Δωμάτιο</SelectItem>
                          <SelectItem value="entire-place">Ολόκληρο Διαμέρισμα</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ημερομηνία Μετακόμισης</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Πότε;" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asap">Άμεσα</SelectItem>
                          <SelectItem value="next-month">Επόμενο Μήνα</SelectItem>
                          <SelectItem value="flexible">Ευέλικτα</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flatmate Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Προτιμήσεις Συγκατοίκησης
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Αριθμός Συγκατοίκων</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Πόσοι;" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 άτομο</SelectItem>
                          <SelectItem value="2">2 άτομα</SelectItem>
                          <SelectItem value="3">3+ άτομα</SelectItem>
                          <SelectItem value="flexible">Ευέλικτα</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ηλικιακή Ομάδα</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Ηλικία" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="18-25">18-25 ετών</SelectItem>
                          <SelectItem value="25-35">25-35 ετών</SelectItem>
                          <SelectItem value="35+">35+ ετών</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Άλλες Προτιμήσεις</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pets" />
                        <Label htmlFor="pets">Επιτρέπονται κατοικίδια</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="smoking" />
                        <Label htmlFor="smoking">Μη καπνιστές</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="students" />
                        <Label htmlFor="students">Φοιτητικό περιβάλλον</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="professionals" />
                        <Label htmlFor="professionals">Εργαζόμενοι</Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Ειδοποιήσεις
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="email-alerts" defaultChecked />
                      <Label htmlFor="email-alerts">Email ειδοποιήσεις για νέες αγγελίες</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="daily-digest" />
                      <Label htmlFor="daily-digest">Ημερήσια σύνοψη αγγελιών</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="price-drops" defaultChecked />
                      <Label htmlFor="price-drops">Ειδοποιήσεις για μειώσεις τιμών</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4">
                <Button variant="hero" className="flex-1">
                  Αποθήκευση Προτιμήσεων
                </Button>
                <Button variant="outline">
                  Επαναφορά
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SearchPreferences;