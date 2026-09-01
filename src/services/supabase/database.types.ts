export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          clinic_fee_percentage: number
          clinic_fee_value: number
          created_at: string
          description: string | null
          id: string
          notes: string | null
          patient_id: string
          professional_gain_value: number
          professional_id: string
          service_id: string
          status: string
          updated_at: string
          user_id: string
          value: number
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          clinic_fee_percentage?: number
          clinic_fee_value?: number
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          patient_id: string
          professional_gain_value?: number
          professional_id: string
          service_id: string
          status?: string
          updated_at?: string
          user_id: string
          value?: number
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          clinic_fee_percentage?: number
          clinic_fee_value?: number
          created_at?: string
          description?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
          professional_gain_value?: number
          professional_id?: string
          service_id?: string
          status?: string
          updated_at?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: 'appointments_patient_id_fkey'
            columns: ['patient_id']
            isOneToOne: false
            referencedRelation: 'patients'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_professional_id_fkey'
            columns: ['professional_id']
            isOneToOne: false
            referencedRelation: 'professionals'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'appointments_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
        ]
      }
      patients: {
        Row: {
          active: boolean
          birth_date: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          birth_date?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          average_cost: number | null
          category: string | null
          created_at: string
          current_stock: number
          id: string
          image_url: string | null
          internal_code: string | null
          minimum_stock: number
          name: string
          notes: string | null
          sale_price: number | null
          sale_price_open: boolean
          size: string
          status: string
          unit: string
          updated_at: string
          user_id: string
        }
        Insert: {
          average_cost?: number | null
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: string
          image_url?: string | null
          internal_code?: string | null
          minimum_stock?: number
          name: string
          notes?: string | null
          sale_price?: number | null
          sale_price_open?: boolean
          size: string
          status?: string
          unit?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          average_cost?: number | null
          category?: string | null
          created_at?: string
          current_stock?: number
          id?: string
          image_url?: string | null
          internal_code?: string | null
          minimum_stock?: number
          name?: string
          notes?: string | null
          sale_price?: number | null
          sale_price_open?: boolean
          size?: string
          status?: string
          unit?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          active: boolean
          created_at: string
          default_clinic_fee_percentage: number
          id: string
          name: string
          phone: string | null
          pix_key: string | null
          specialty: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          default_clinic_fee_percentage?: number
          id?: string
          name: string
          phone?: string | null
          pix_key?: string | null
          specialty?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          default_clinic_fee_percentage?: number
          id?: string
          name?: string
          phone?: string | null
          pix_key?: string | null
          specialty?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          amount_received: number
          cost_value: number
          created_at: string
          gross_profit_value: number
          id: string
          notes: string | null
          occurred_at: string
          payment_method: string | null
          product_id: string
          quantity: number
          receipt_status: string | null
          revenue_value: number
          stock_delta: number
          type: string
          unit_cost: number | null
          unit_sale_price: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_received?: number
          cost_value?: number
          created_at?: string
          gross_profit_value?: number
          id?: string
          notes?: string | null
          occurred_at?: string
          payment_method?: string | null
          product_id: string
          quantity: number
          receipt_status?: string | null
          revenue_value?: number
          stock_delta: number
          type: string
          unit_cost?: number | null
          unit_sale_price?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_received?: number
          cost_value?: number
          created_at?: string
          gross_profit_value?: number
          id?: string
          notes?: string | null
          occurred_at?: string
          payment_method?: string | null
          product_id?: string
          quantity?: number
          receipt_status?: string | null
          revenue_value?: number
          stock_delta?: number
          type?: string
          unit_cost?: number | null
          unit_sale_price?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'stock_movements_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      services: {
        Row: {
          active: boolean
          clinic_fee_percentage: number
          created_at: string
          default_value: number
          duration_minutes: number
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          clinic_fee_percentage?: number
          created_at?: string
          default_value?: number
          duration_minutes?: number
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          clinic_fee_percentage?: number
          created_at?: string
          default_value?: number
          duration_minutes?: number
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_stock_movement: {
        Args: {
          input_adjustment_delta?: number | null
          input_amount_received?: number
          input_notes?: string | null
          input_occurred_at?: string | null
          input_payment_method?: string | null
          input_product_id: string
          input_quantity: number
          input_receipt_status?: string | null
          input_type: string
          input_unit_cost?: number | null
          input_unit_sale_price?: number | null
        }
        Returns: Database['public']['Tables']['stock_movements']['Row']
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

export type Tables<TableName extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TableName]['Row']

export type TablesInsert<TableName extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TableName]['Insert']

export type TablesUpdate<TableName extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][TableName]['Update']
