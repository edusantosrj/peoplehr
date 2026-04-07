import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { EDUCATION_LEVELS, AVAILABLE_COURSES } from "@/types/candidate";
import { capitalizeProperName } from "@/utils/textFormatting";

interface Step2Props {
  data: {
    education: string;
    course: string;
    period: string;
    hasTechnicalCourse: boolean;
    completedCourses: string[];
    otherCourses: string;
  };
  onChange: (field: string, value: string | boolean | string[]) => void;
  errors: Record<string, string>;
}

export function Step2Education({ data, onChange, errors }: Step2Props) {
  const needsCourse = ['Superior Completo', 'Pós-Graduação Completa'].includes(data.education);
  const needsCourseAndPeriod = ['Superior Incompleto', 'Pós-Graduação Incompleta'].includes(data.education);

  const handleCourseToggle = (course: string, checked: boolean) => {
    const newCourses = checked
      ? [...data.completedCourses, course]
      : data.completedCourses.filter(c => c !== course);
    onChange("completedCourses", newCourses);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Escolaridade</h3>
        
        <div className="space-y-2">
          <Label htmlFor="education">Escolaridade *</Label>
          <Select value={data.education} onValueChange={(v) => onChange("education", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione sua escolaridade" />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level} value={level}>{level}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.education && <p className="text-sm text-destructive">{errors.education}</p>}
        </div>

        {(needsCourse || needsCourseAndPeriod) && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="course">Curso *</Label>
              <Input
                id="course"
                value={data.course}
                onChange={(e) => onChange("course", e.target.value)}
                onBlur={(e) => onChange("course", capitalizeProperName(e.target.value))}
                placeholder="Nome do curso"
              />
              {errors.course && <p className="text-sm text-destructive">{errors.course}</p>}
            </div>

            {needsCourseAndPeriod && (
              <div className="space-y-2">
                <Label htmlFor="period">Período *</Label>
                <Input
                  id="period"
                  value={data.period}
                  onChange={(e) => onChange("period", e.target.value)}
                  placeholder="Ex: 3º período"
                />
                {errors.period && <p className="text-sm text-destructive">{errors.period}</p>}
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Label>Possui Curso Técnico?</Label>
          <RadioGroup
            value={data.hasTechnicalCourse ? "yes" : "no"}
            onValueChange={(v) => onChange("hasTechnicalCourse", v === "yes")}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id="tech-yes" />
              <Label htmlFor="tech-yes" className="font-normal cursor-pointer">Sim</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id="tech-no" />
              <Label htmlFor="tech-no" className="font-normal cursor-pointer">Não</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary border-b pb-2">Cursos Realizados</h3>
        
        <div className="grid gap-3 sm:grid-cols-2">
          {AVAILABLE_COURSES.map((course) => (
            <div key={course} className="flex items-center space-x-2">
              <Checkbox
                id={`course-${course}`}
                checked={data.completedCourses.includes(course)}
                onCheckedChange={(checked) => handleCourseToggle(course, checked as boolean)}
              />
              <Label htmlFor={`course-${course}`} className="font-normal cursor-pointer">
                {course}
              </Label>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label htmlFor="otherCourses">Outros Cursos</Label>
          <Textarea
            id="otherCourses"
            value={data.otherCourses}
            onChange={(e) => onChange("otherCourses", e.target.value)}
            placeholder="Descreva outros cursos que você realizou..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
