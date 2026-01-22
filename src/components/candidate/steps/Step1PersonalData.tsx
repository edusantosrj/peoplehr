import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPhone, formatDate, calculateAge } from "@/utils/cpfValidation";
import { MARITAL_STATUS_OPTIONS, BRAZIL_STATES } from "@/types/candidate";

interface Step1Props {
  data: {
    fullName: string;
    birthDate: string;
    maritalStatus: string;
    motherName: string;
    fatherName: string;
    whatsapp: string;
    address: string;
    addressNumber: string;
    neighborhood: string;
    city: string;
    state: string;
    instagram: string;
    facebook: string;
  };
  onChange: (field: string, value: string) => void;
  errors: Record<string, string>;
}

export function Step1PersonalData({ data, onChange, errors }: Step1Props) {
  const age = data.birthDate ? calculateAge(data.birthDate) : null;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Dados Pessoais</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="fullName">Nome Completo *</Label>
            <Input
              id="fullName"
              value={data.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
              placeholder="Digite seu nome completo"
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Data de Nascimento *</Label>
            <Input
              id="birthDate"
              value={data.birthDate}
              onChange={(e) => onChange("birthDate", formatDate(e.target.value))}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />
            {age !== null && age > 0 && (
              <p className="text-sm text-muted-foreground">{age} anos</p>
            )}
            {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Estado Civil *</Label>
            <Select value={data.maritalStatus} onValueChange={(v) => onChange("maritalStatus", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {MARITAL_STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>{status}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.maritalStatus && <p className="text-sm text-destructive">{errors.maritalStatus}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="motherName">Nome da Mãe *</Label>
            <Input
              id="motherName"
              value={data.motherName}
              onChange={(e) => onChange("motherName", e.target.value)}
              placeholder="Nome completo da mãe"
            />
            {errors.motherName && <p className="text-sm text-destructive">{errors.motherName}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fatherName">Nome do Pai</Label>
            <Input
              id="fatherName"
              value={data.fatherName}
              onChange={(e) => onChange("fatherName", e.target.value)}
              placeholder="Nome completo do pai (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp *</Label>
            <Input
              id="whatsapp"
              value={data.whatsapp}
              onChange={(e) => onChange("whatsapp", formatPhone(e.target.value))}
              placeholder="(00) 0 0000-0000"
              maxLength={16}
            />
            {errors.whatsapp && <p className="text-sm text-destructive">{errors.whatsapp}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Endereço</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="address">Endereço *</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => onChange("address", e.target.value)}
              placeholder="Rua, Avenida..."
            />
            {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressNumber">Número *</Label>
            <Input
              id="addressNumber"
              value={data.addressNumber}
              onChange={(e) => onChange("addressNumber", e.target.value)}
              placeholder="Número"
            />
            {errors.addressNumber && <p className="text-sm text-destructive">{errors.addressNumber}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              value={data.neighborhood}
              onChange={(e) => onChange("neighborhood", e.target.value)}
              placeholder="Bairro"
            />
            {errors.neighborhood && <p className="text-sm text-destructive">{errors.neighborhood}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => onChange("city", e.target.value)}
              placeholder="Cidade"
            />
            {errors.city && <p className="text-sm text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Select value={data.state} onValueChange={(v) => onChange("state", v)}>
              <SelectTrigger>
                <SelectValue placeholder="UF" />
              </SelectTrigger>
              <SelectContent>
                {BRAZIL_STATES.map((uf) => (
                  <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-sm text-destructive">{errors.state}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Redes Sociais</h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input
              id="instagram"
              value={data.instagram}
              onChange={(e) => onChange("instagram", e.target.value)}
              placeholder="@seu_usuario"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input
              id="facebook"
              value={data.facebook}
              onChange={(e) => onChange("facebook", e.target.value)}
              placeholder="URL do perfil"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
