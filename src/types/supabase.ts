/**
 * Supabase Database Types
 * Generated from the worldbuilding schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          display_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          display_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          is_public: boolean
          local_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
          local_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          is_public?: boolean
          local_id?: string | null
        }
      }
      world_elements: {
        Row: {
          id: string
          project_id: string
          category: ElementCategory
          name: string
          created_at: string
          updated_at: string
          local_id: string | null
        }
        Insert: {
          id?: string
          project_id: string
          category: ElementCategory
          name: string
          created_at?: string
          updated_at?: string
          local_id?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          category?: ElementCategory
          name?: string
          created_at?: string
          updated_at?: string
          local_id?: string | null
        }
      }
      answers: {
        Row: {
          id: string
          element_id: string
          question_id: string
          value: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          element_id: string
          question_id: string
          value: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          element_id?: string
          question_id?: string
          value?: Json
          created_at?: string
          updated_at?: string
        }
      }
      relationships: {
        Row: {
          id: string
          project_id: string
          from_element_id: string
          to_element_id: string
          relationship_type: string
          bidirectional: boolean
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          from_element_id: string
          to_element_id: string
          relationship_type: string
          bidirectional?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          from_element_id?: string
          to_element_id?: string
          relationship_type?: string
          bidirectional?: boolean
          created_at?: string
        }
      }
      questionnaire_templates: {
        Row: {
          id: string
          user_id: string | null
          category: string
          name: string
          description: string | null
          questions: Json
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          category: string
          name: string
          description?: string | null
          questions?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          category?: string
          name?: string
          description?: string | null
          questions?: Json
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
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

// Element categories enum to match the database constraint
export type ElementCategory = 
  | 'character'
  | 'location'
  | 'magic_system'
  | 'culture'
  | 'creature'
  | 'organization'
  | 'religion'
  | 'technology'
  | 'historical_event'
  | 'language'
  | 'item'
  | 'custom'

// Helper types for easier usage
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type WorldElement = Database['public']['Tables']['world_elements']['Row']
export type Answer = Database['public']['Tables']['answers']['Row']
export type Relationship = Database['public']['Tables']['relationships']['Row']
export type QuestionnaireTemplate = Database['public']['Tables']['questionnaire_templates']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type WorldElementInsert = Database['public']['Tables']['world_elements']['Insert']
export type AnswerInsert = Database['public']['Tables']['answers']['Insert']
export type RelationshipInsert = Database['public']['Tables']['relationships']['Insert']
export type QuestionnaireTemplateInsert = Database['public']['Tables']['questionnaire_templates']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']
export type WorldElementUpdate = Database['public']['Tables']['world_elements']['Update']
export type AnswerUpdate = Database['public']['Tables']['answers']['Update']
export type RelationshipUpdate = Database['public']['Tables']['relationships']['Update']
export type QuestionnaireTemplateUpdate = Database['public']['Tables']['questionnaire_templates']['Update']