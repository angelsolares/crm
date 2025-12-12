import { Organization } from './organization.model';

export interface Contact {
  id: string;
  organization_id: string;
  organization?: Organization;
  first_name: string;
  last_name: string;
  full_name: string;
  title: string | null;
  department: string | null;
  category: ContactCategory;
  source: string | null;
  email: string;
  phone: {
    country_code: string | null;
    number: string | null;
    extension: string | null;
    full: string | null;
  };
  notes: string | null;
  photo_url: string | null;
  status: 'active' | 'inactive';
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export type ContactCategory = 'general' | 'decision_maker' | 'technical' | 'procurement';

export const CONTACT_SOURCES = [
  { value: 'referral', label: 'Referral' },
  { value: 'website', label: 'Website' },
  { value: 'event', label: 'Event' },
  { value: 'cold_call', label: 'Cold Call' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'email_campaign', label: 'Email Campaign' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
] as const;

export const CONTACT_CATEGORIES = [
  { value: 'general', label: 'General Contact' },
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'technical', label: 'Technical Contact' },
  { value: 'procurement', label: 'Procurement' },
] as const;

export interface ContactFilters {
  organization_id?: string;
  status?: string;
  category?: string;
  primary_only?: boolean;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateContactDto {
  organization_id: string;
  first_name: string;
  last_name: string;
  title?: string | null;
  department?: string | null;
  category?: ContactCategory;
  source?: string | null;
  email: string;
  phone_country_code?: string | null;
  phone_number?: string | null;
  extension?: string | null;
  notes?: string | null;
  is_primary?: boolean;
}

