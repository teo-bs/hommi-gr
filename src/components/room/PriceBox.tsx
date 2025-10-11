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
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold">
            {hasPrice ? `€${price}` : 'Δεν έχει καθοριστεί'}
          </span>
          {hasPrice && <span className="text-muted-foreground">/μήνα</span>}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Μηνιαίο ενοίκιο</span>
            <span className="font-medium">
              {hasPrice ? `€${price}` : 'Δεν έχει καθοριστεί'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Εγγύηση</span>
            <span className="font-medium">
              {depositRequired === false ? 'Δεν απαιτείται' : hasDeposit ? `€${deposit}` : 'Δεν έχει καθοριστεί'}
            </span>
          </div>
          
          <div className="flex justify-between items-start">
            <span className="text-muted-foreground">Λογαριασμοί</span>
            <div className="text-right">
              <span className={`font-medium ${billsIncluded === true ? 'text-success' : billsIncluded === false ? 'text-warning' : ''}`}>
                {billsIncluded === true ? 'Συμπεριλαμβάνονται' : billsIncluded === false ? 'Δεν συμπεριλαμβάνονται' : 'Δεν έχει καθοριστεί'}
              </span>
              {billsNote && (
                <p className="text-xs text-muted-foreground mt-1">{billsNote}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Σύνολο αρχικό κόστος</span>
            <span>{totalMoveIn != null ? `€${totalMoveIn}` : '-'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};