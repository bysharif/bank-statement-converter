/**
 * Support Request Types
 * For handling unsupported bank parser requests
 */

export type SupportRequestStatus = 'pending' | 'in_progress' | 'completed' | 'rejected';
export type SupportRequestUrgency = 'low' | 'medium' | 'high';

export interface SupportRequest {
  id: string;
  user_id: string;
  email: string;
  bank_name: string;
  pdf_url: string;
  pdf_storage_path: string;
  status: SupportRequestStatus;
  urgency?: SupportRequestUrgency;
  notes?: string;
  admin_notes?: string;
  confidence_score?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateSupportRequestInput {
  email: string;
  bank_name: string;
  pdf_url: string;
  pdf_storage_path: string;
  urgency?: SupportRequestUrgency;
  notes?: string;
}

export interface SupportRequestFormData {
  bank_name: string;
  urgency: SupportRequestUrgency;
  notes: string;
}
