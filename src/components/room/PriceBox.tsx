import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Euro } from "lucide-react";

interface PriceBoxProps {
  price: number;
  deposit: number;
  billsIncluded?: boolean;
}

export const PriceBox = ({ price, deposit, billsIncluded = true }: PriceBoxProps) => {
  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-baseline space-x-1">
          <span className="text-3xl font-bold">€{price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monthly rent</span>
            <span className="font-medium">€{price}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deposit</span>
            <span className="font-medium">€{deposit}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Bills</span>
            <span className={`font-medium ${billsIncluded ? 'text-success' : 'text-warning'}`}>
              {billsIncluded ? 'Included' : 'Not included'}
            </span>
          </div>
        </div>
        
        <div className="border-t pt-3">
          <div className="flex justify-between font-semibold">
            <span>Total move-in cost</span>
            <span>€{price + deposit}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};