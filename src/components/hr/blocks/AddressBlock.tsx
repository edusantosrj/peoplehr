import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import type { Candidate } from "@/types/candidate";

interface AddressBlockProps {
  candidate: Candidate;
}

export const AddressBlock = ({ candidate }: AddressBlockProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="h-5 w-5 text-primary" />
          Endereço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <p className="text-sm text-muted-foreground">Endereço</p>
            <p className="font-medium">
              {candidate.address}, {candidate.addressNumber}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bairro</p>
            <p className="font-medium">{candidate.neighborhood}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Cidade/UF</p>
            <p className="font-medium">
              {candidate.city} - {candidate.state}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
