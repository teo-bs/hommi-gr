import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";

interface HouseRulesProps {
  houseRules: string[];
}

export const HouseRules = ({ houseRules }: HouseRulesProps) => {
  if (!houseRules || houseRules.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Κανόνες Σπιτιού
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {houseRules.map((rule, idx) => (
            <Badge key={idx} variant="secondary">
              {rule}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
