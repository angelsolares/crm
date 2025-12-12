import { Organization } from './organization.model';
import { Contact } from './contact.model';
import { Proposal } from './proposal.model';
import { Meeting } from './meeting.model';

export interface Project {
  id: string;
  organization_id: string;
  organization?: Organization;
  primary_contact_id: string | null;
  primary_contact?: Contact | null;
  assigned_user_id: string | null;
  assigned_user?: {
    id: string;
    name: string;
  } | null;
  name: string;
  description: string | null;
  status: ProjectStatus;
  interest_level: number;
  interest_label: 'Low' | 'Medium' | 'High';
  budget: number | null;
  currency: string;
  formatted_budget: string | null;
  start_date: string | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  stage: ProjectStage;
  stage_label: string;
  custom_fields: Record<string, any> | null;
  is_closed: boolean;
  proposals?: Proposal[];
  meetings?: Meeting[];
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'active' | 'on_hold' | 'completed' | 'cancelled';

export type ProjectStage = 
  | 'qualification' 
  | 'needs_analysis' 
  | 'proposal' 
  | 'negotiation' 
  | 'closed_won' 
  | 'closed_lost';

export const PROJECT_STAGES = [
  { value: 'qualification', label: 'Qualification', color: 'bg-blue-500' },
  { value: 'needs_analysis', label: 'Needs Analysis', color: 'bg-purple-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-yellow-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { value: 'closed_won', label: 'Closed Won', color: 'bg-green-500' },
  { value: 'closed_lost', label: 'Closed Lost', color: 'bg-red-500' },
] as const;

export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const;

export interface ProjectFilters {
  organization_id?: string;
  status?: string;
  stage?: string;
  assigned_user_id?: string;
  min_interest?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateProjectDto {
  organization_id: string;
  primary_contact_id?: string | null;
  assigned_user_id?: string | null;
  name: string;
  description?: string | null;
  status?: ProjectStatus;
  interest_level?: number;
  budget?: number | null;
  currency?: string;
  start_date?: string | null;
  expected_close_date?: string | null;
  stage?: ProjectStage;
}

export interface PipelineData {
  [stage: string]: {
    count: number;
    total_value: number | null;
  };
}

