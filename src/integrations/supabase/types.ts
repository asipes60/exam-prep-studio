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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      admin_knowledge_base: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          license_types: string[] | null
          source_url: string | null
          tags: string[] | null
          title: string
          topics: string[] | null
          updated_at: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          license_types?: string[] | null
          source_url?: string | null
          tags?: string[] | null
          title: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          license_types?: string[] | null
          source_url?: string | null
          tags?: string[] | null
          title?: string
          topics?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          difficulty: string | null
          flag_reason: string | null
          flagged: boolean | null
          generation_time_ms: number | null
          id: string
          kb_entries_used: string[] | null
          license_type: string | null
          model_used: string | null
          output_text: string | null
          prompt_text: string | null
          study_format: string | null
          system_prompt: string | null
          tokens_in: number | null
          tokens_out: number | null
          topic: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          difficulty?: string | null
          flag_reason?: string | null
          flagged?: boolean | null
          generation_time_ms?: number | null
          id?: string
          kb_entries_used?: string[] | null
          license_type?: string | null
          model_used?: string | null
          output_text?: string | null
          prompt_text?: string | null
          study_format?: string | null
          system_prompt?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          topic?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          difficulty?: string | null
          flag_reason?: string | null
          flagged?: boolean | null
          generation_time_ms?: number | null
          id?: string
          kb_entries_used?: string[] | null
          license_type?: string | null
          model_used?: string | null
          output_text?: string | null
          prompt_text?: string | null
          study_format?: string | null
          system_prompt?: string | null
          tokens_in?: number | null
          tokens_out?: number | null
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_prep_assessments: {
        Row: {
          completed_weeks: number[]
          created_at: string
          id: string
          license_type: string
          ratings: Json
          strong_areas: string[]
          suggested_plan: Json | null
          user_id: string
          weak_areas: string[]
        }
        Insert: {
          completed_weeks?: number[]
          created_at?: string
          id?: string
          license_type: string
          ratings?: Json
          strong_areas?: string[]
          suggested_plan?: Json | null
          user_id: string
          weak_areas?: string[]
        }
        Update: {
          completed_weeks?: number[]
          created_at?: string
          id?: string
          license_type?: string
          ratings?: Json
          strong_areas?: string[]
          suggested_plan?: Json | null
          user_id?: string
          weak_areas?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "exam_prep_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_prep_domain_scores: {
        Row: {
          correct_answers: number
          created_at: string
          domain_id: string
          domain_name: string
          id: string
          last_quiz_at: string
          license_type: string
          total_questions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          correct_answers?: number
          created_at?: string
          domain_id: string
          domain_name: string
          id?: string
          last_quiz_at?: string
          license_type: string
          total_questions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          correct_answers?: number
          created_at?: string
          domain_id?: string
          domain_name?: string
          id?: string
          last_quiz_at?: string
          license_type?: string
          total_questions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_prep_domain_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_prep_folders: {
        Row: {
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_prep_folders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_prep_materials: {
        Row: {
          content: Json
          created_at: string
          folder_id: string | null
          id: string
          is_favorite: boolean
          license_type: string
          name: string
          study_format: string
          tags: string[]
          topic: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          is_favorite?: boolean
          license_type: string
          name: string
          study_format: string
          tags?: string[]
          topic: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          folder_id?: string | null
          id?: string
          is_favorite?: boolean
          license_type?: string
          name?: string
          study_format?: string
          tags?: string[]
          topic?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_prep_materials_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "exam_prep_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_prep_materials_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_prep_quiz_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          format: string | null
          id: string
          license_type: string
          mode: string
          questions: Json
          results: Json
          score: number | null
          started_at: string
          topic: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          format?: string | null
          id?: string
          license_type: string
          mode: string
          questions: Json
          results?: Json
          score?: number | null
          started_at?: string
          topic?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          format?: string | null
          id?: string
          license_type?: string
          mode?: string
          questions?: Json
          results?: Json
          score?: number | null
          started_at?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_prep_quiz_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_prep_usage: {
        Row: {
          created_at: string
          generation_type: string
          id: string
          license_type: string
          topic: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          generation_type: string
          id?: string
          license_type: string
          topic?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          generation_type?: string
          id?: string
          license_type?: string
          topic?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_prep_usage_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          daily_generations: number
          daily_generations_reset_at: string
          email: string | null
          id: string
          is_admin: boolean | null
          name: string | null
          onboarding_completed_at: string | null
          preferred_license: string | null
          selected_exams: string[] | null
          stripe_customer_id: string | null
          subscription_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_generations?: number
          daily_generations_reset_at?: string
          email?: string | null
          id: string
          is_admin?: boolean | null
          name?: string | null
          onboarding_completed_at?: string | null
          preferred_license?: string | null
          selected_exams?: string[] | null
          stripe_customer_id?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_generations?: number
          daily_generations_reset_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          name?: string | null
          onboarding_completed_at?: string | null
          preferred_license?: string | null
          selected_exams?: string[] | null
          stripe_customer_id?: string | null
          subscription_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      upsert_domain_score: {
        Args: {
          p_correct: number
          p_domain_id: string
          p_domain_name: string
          p_license_type: string
          p_total: number
          p_user_id: string
        }
        Returns: undefined
      }
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
