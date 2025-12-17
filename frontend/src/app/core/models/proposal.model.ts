import { Project } from './project.model';

export interface Proposal {
  id: string;
  project_id: string;
  project?: Project;
  created_by: string | null;
  creator?: {
    id: string;
    name: string;
  } | null;
  title: string;
  reference_number: string;
  description: string | null;
  status: ProposalStatus;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  formatted_total: string;
  valid_until: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  file_url: string | null;
  terms_conditions: string | null;
  notes: string | null;
  is_expired: boolean;
  is_editable: boolean;
  items?: ProposalItem[];
  created_at: string;
  updated_at: string;
}

export interface ProposalItem {
  id: string;
  proposal_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total_line: number;
  sort_order: number;
}

export type ProposalStatus = 
  | 'draft' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected' 
  | 'expired';

export const PROPOSAL_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-500', textColor: 'text-slate-700', bgLight: 'bg-slate-100' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-100' },
  { value: 'viewed', label: 'Viewed', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-100' },
  { value: 'accepted', label: 'Accepted', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-100' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-100' },
  { value: 'expired', label: 'Expired', color: 'bg-amber-500', textColor: 'text-amber-700', bgLight: 'bg-amber-100' },
] as const;

export interface ProposalFilters {
  project_id?: string;
  status?: string;
  created_by?: string;
  from_date?: string;
  to_date?: string;
  expired?: boolean;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateProposalDto {
  project_id: string;
  title: string;
  description?: string | null;
  discount_amount?: number;
  currency?: string;
  valid_until?: string | null;
  terms_conditions?: string | null;
  notes?: string | null;
  items: CreateProposalItemDto[];
}

export interface CreateProposalItemDto {
  id?: string; // For updates
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  tax_rate?: number;
  sort_order?: number;
}

export interface UpdateProposalDto {
  title?: string;
  description?: string | null;
  discount_amount?: number;
  currency?: string;
  valid_until?: string | null;
  terms_conditions?: string | null;
  notes?: string | null;
  items?: CreateProposalItemDto[];
}

export interface ProposalStatistics {
  total: number;
  draft: number;
  sent: number;
  viewed: number;
  accepted: number;
  rejected: number;
  expired: number;
  total_value_accepted: number;
  total_value_pending: number;
  acceptance_rate: number;
}

export function getProposalStatusConfig(status: ProposalStatus) {
  return PROPOSAL_STATUSES.find(s => s.value === status) ?? PROPOSAL_STATUSES[0];
}



