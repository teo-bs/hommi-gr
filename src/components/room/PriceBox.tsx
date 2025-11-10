import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Euro } from "lucide-react";

interface PriceBoxProps {
  price?: number | null;
  deposit?: number | null;
  depositRequired?: boolean | null;
  billsIncluded?: boolean | null;
  billsNote?: string | null;
}

export const PriceBox = ({ price, deposit, depositRequired, billsIncluded, billsNote }: PriceBoxProps) => {
  const hasPrice = price != null;
  const hasDeposit = deposit != null && depositRequired !== false;
  const totalMoveIn = hasPrice && hasDeposit ? price + deposit : null;
  
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            {hasPrice ? `€${price}` : 'Δεν έχει καθοριστεί'}
          </span>
          {hasPrice && <span className="text-muted-foreground text-lg">/μήνα</span>}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Μηνιαίο ενοίκιο</span>
            <span className="font-semibold text-base">
              {hasPrice ? `€${price}` : 'Δεν έχει καθοριστεί'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-muted-foreground">Εγγύηση</span>
            <span className="font-semibold text-base">
              {depositRequired === false ? 'Δεν απαιτείται' : hasDeposit ? `€${deposit}` : 'Δεν έχει καθοριστεί'}
            </span>
          </div>
          
          <div className="flex justify-between items-start py-2">
            <span className="text-muted-foreground">Λογαριασμοί</span>
            <div className="text-right">
              <span className={`font-semibold text-base ${billsIncluded === true ? 'text-success' : billsIncluded === false ? 'text-warning' : ''}`}>
                {billsIncluded === true ? 'Συμπεριλαμβάνονται' : billsIncluded === false ? 'Δεν συμπεριλαμβάνονται' : 'Δεν έχει καθοριστεί'}
              </span>
              {billsNote && (
                <p className="text-xs text-muted-foreground mt-1">{billsNote}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-4 mt-4 bg-accent/20 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-base">Σύνολο αρχικό κόστος</span>
            <span className="text-2xl font-bold text-primary">{totalMoveIn != null ? `€${totalMoveIn}` : '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};