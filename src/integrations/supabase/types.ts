export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      candidates: {
        Row: {
          address: string
          address_number: string
          available_holidays: boolean
          available_weekends: boolean
          birth_date: string
          city: string
          completed_courses: string[] | null
          course: string | null
          cpf: string
          created_at: string
          desired_position_1: string
          desired_position_2: string | null
          desired_position_3: string | null
          education: string
          facebook: string | null
          father_name: string | null
          full_name: string
          has_criminal_record: boolean
          has_technical_course: boolean
          hr_data: Json | null
          id: string
          immediate_start: boolean
          instagram: string | null
          lgpd_consent: boolean
          lgpd_consent_date: string | null
          marital_status: string
          mother_name: string
          neighborhood: string
          other_courses: string | null
          other_files_urls: string[] | null
          period: string | null
          resume_url: string | null
          salary_expectation: string
          selfie_url: string | null
          state: string
          whatsapp: string
          work_experiences: Json | null
        }
        Insert: {
          address: string
          address_number: string
          available_holidays?: boolean
          available_weekends?: boolean
          birth_date: string
          city: string
          completed_courses?: string[] | null
          course?: string | null
          cpf: string
          created_at?: string
          desired_position_1: string
          desired_position_2?: string | null
          desired_position_3?: string | null
          education: string
          facebook?: string | null
          father_name?: string | null
          full_name: string
          has_criminal_record?: boolean
          has_technical_course?: boolean
          hr_data?: Json | null
          id?: string
          immediate_start?: boolean
          instagram?: string | null
          lgpd_consent?: boolean
          lgpd_consent_date?: string | null
          marital_status: string
          mother_name: string
          neighborhood: string
          other_courses?: string | null
          other_files_urls?: string[] | null
          period?: string | null
          resume_url?: string | null
          salary_expectation: string
          selfie_url?: string | null
          state: string
          whatsapp: string
          work_experiences?: Json | null
        }
        Update: {
          address?: string
          address_number?: string
          available_holidays?: boolean
          available_weekends?: boolean
          birth_date?: string
          city?: string
          completed_courses?: string[] | null
          course?: string | null
          cpf?: string
          created_at?: string
          desired_position_1?: string
          desired_position_2?: string | null
          desired_position_3?: string | null
          education?: string
          facebook?: string | null
          father_name?: string | null
          full_name?: string
          has_criminal_record?: boolean
          has_technical_course?: boolean
          hr_data?: Json | null
          id?: string
          immediate_start?: boolean
          instagram?: string | null
          lgpd_consent?: boolean
          lgpd_consent_date?: string | null
          marital_status?: string
          mother_name?: string
          neighborhood?: string
          other_courses?: string | null
          other_files_urls?: string[] | null
          period?: string | null
          resume_url?: string | null
          salary_expectation?: string
          selfie_url?: string | null
          state?: string
          whatsapp?: string
          work_experiences?: Json | null
        }
        Relationships: []
      }
      hr_admissions: {
        Row: {
          admission_status: string | null
          candidate_id: string
          created_at: string
          defined_salary: string | null
          expected_start_date: string | null
          id: string
          observations: string | null
          store_unit: string | null
          updated_at: string
          vacancy_display: string | null
          vacancy_id: string | null
          work_hours: string | null
        }
        Insert: {
          admission_status?: string | null
          candidate_id: string
          created_at?: string
          defined_salary?: string | null
          expected_start_date?: string | null
          id?: string
          observations?: string | null
          store_unit?: string | null
          updated_at?: string
          vacancy_display?: string | null
          vacancy_id?: string | null
          work_hours?: string | null
        }
        Update: {
          admission_status?: string | null
          candidate_id?: string
          created_at?: string
          defined_salary?: string | null
          expected_start_date?: string | null
          id?: string
          observations?: string | null
          store_unit?: string | null
          updated_at?: string
          vacancy_display?: string | null
          vacancy_id?: string | null
          work_hours?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_admissions_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_annotations: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_annotations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_documentation: {
        Row: {
          basic_doc_checked: boolean
          basic_doc_completed: boolean | null
          basic_doc_expiration_date: string | null
          candidate_id: string
          created_at: string
          experience_contract_checked: boolean
          experience_contract_completed: boolean | null
          experience_contract_expiration_date: string | null
          experience_extension_checked: boolean
          experience_extension_completed: boolean | null
          experience_extension_expiration_date: string | null
          id: string
          prior_notice_checked: boolean
          prior_notice_completed: boolean | null
          prior_notice_expiration_date: string | null
          termination_contract_checked: boolean
          termination_contract_completed: boolean | null
          termination_contract_expiration_date: string | null
          updated_at: string
        }
        Insert: {
          basic_doc_checked?: boolean
          basic_doc_completed?: boolean | null
          basic_doc_expiration_date?: string | null
          candidate_id: string
          created_at?: string
          experience_contract_checked?: boolean
          experience_contract_completed?: boolean | null
          experience_contract_expiration_date?: string | null
          experience_extension_checked?: boolean
          experience_extension_completed?: boolean | null
          experience_extension_expiration_date?: string | null
          id?: string
          prior_notice_checked?: boolean
          prior_notice_completed?: boolean | null
          prior_notice_expiration_date?: string | null
          termination_contract_checked?: boolean
          termination_contract_completed?: boolean | null
          termination_contract_expiration_date?: string | null
          updated_at?: string
        }
        Update: {
          basic_doc_checked?: boolean
          basic_doc_completed?: boolean | null
          basic_doc_expiration_date?: string | null
          candidate_id?: string
          created_at?: string
          experience_contract_checked?: boolean
          experience_contract_completed?: boolean | null
          experience_contract_expiration_date?: string | null
          experience_extension_checked?: boolean
          experience_extension_completed?: boolean | null
          experience_extension_expiration_date?: string | null
          id?: string
          prior_notice_checked?: boolean
          prior_notice_completed?: boolean | null
          prior_notice_expiration_date?: string | null
          termination_contract_checked?: boolean
          termination_contract_completed?: boolean | null
          termination_contract_expiration_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_documentation_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_emergency_contacts: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          name: string
          phone: string
          relationship: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          name: string
          phone: string
          relationship: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          name?: string
          phone?: string
          relationship?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_emergency_contacts_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_evaluations: {
        Row: {
          candidate_hired: string
          candidate_id: string
          created_at: string
          director_validation: string
          documentation_delivered: string
          ficha_validation: string
          id: string
          interview_attended: string | null
          interview_date: string | null
          interview_status: string
          management_validation: string
          ns: boolean
          proposal_accepted: string
          proposal_presented: string
          talent_bank: boolean
          updated_at: string
        }
        Insert: {
          candidate_hired?: string
          candidate_id: string
          created_at?: string
          director_validation?: string
          documentation_delivered?: string
          ficha_validation?: string
          id?: string
          interview_attended?: string | null
          interview_date?: string | null
          interview_status?: string
          management_validation?: string
          ns?: boolean
          proposal_accepted?: string
          proposal_presented?: string
          talent_bank?: boolean
          updated_at?: string
        }
        Update: {
          candidate_hired?: string
          candidate_id?: string
          created_at?: string
          director_validation?: string
          documentation_delivered?: string
          ficha_validation?: string
          id?: string
          interview_attended?: string | null
          interview_date?: string | null
          interview_status?: string
          management_validation?: string
          ns?: boolean
          proposal_accepted?: string
          proposal_presented?: string
          talent_bank?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_evaluations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_terminations: {
        Row: {
          can_be_rehired: boolean | null
          candidate_id: string
          confirmed: boolean | null
          created_at: string
          id: string
          last_work_day: string | null
          notice_days: number | null
          request_date: string | null
          termination_reason: string | null
          updated_at: string
          voluntary_termination: boolean | null
          will_serve_notice: boolean | null
        }
        Insert: {
          can_be_rehired?: boolean | null
          candidate_id: string
          confirmed?: boolean | null
          created_at?: string
          id?: string
          last_work_day?: string | null
          notice_days?: number | null
          request_date?: string | null
          termination_reason?: string | null
          updated_at?: string
          voluntary_termination?: boolean | null
          will_serve_notice?: boolean | null
        }
        Update: {
          can_be_rehired?: boolean | null
          candidate_id?: string
          confirmed?: boolean | null
          created_at?: string
          id?: string
          last_work_day?: string | null
          notice_days?: number | null
          request_date?: string | null
          termination_reason?: string | null
          updated_at?: string
          voluntary_termination?: boolean | null
          will_serve_notice?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_terminations_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: true
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      vacancies: {
        Row: {
          created_at: string
          gross_salary: number
          id: string
          name: string
          quantity: number
          sector: string
          shift: string
          status: string
          type: string
          unit: string
          updated_at: string
          work_hours_end: string
          work_hours_start: string
        }
        Insert: {
          created_at?: string
          gross_salary?: number
          id?: string
          name: string
          quantity?: number
          sector: string
          shift: string
          status?: string
          type: string
          unit: string
          updated_at?: string
          work_hours_end: string
          work_hours_start: string
        }
        Update: {
          created_at?: string
          gross_salary?: number
          id?: string
          name?: string
          quantity?: number
          sector?: string
          shift?: string
          status?: string
          type?: string
          unit?: string
          updated_at?: string
          work_hours_end?: string
          work_hours_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
