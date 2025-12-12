export interface OrganizationContact {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  title: string | null;
  email: string;
  phone: {
    full: string | null;
  };
  is_primary: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: 'parent' | 'subsidiary' | 'branch';
  path: string;
  depth: number;
  industry: Industry | null;
  size: string | null;
  website: string | null;
  email: string | null;
  phone: {
    country_code: string | null;
    number: string | null;
    full: string | null;
  };
  address: AddressData | null;
  formatted_address: string | null;
  logo_url: string | null;
  status: 'prospect' | 'client' | 'inactive';
  notes: string | null;
  parent?: Organization | null;
  children?: Organization[];
  children_count?: number;
  contacts_count?: number;
  contacts?: OrganizationContact[];
  projects_count?: number;
  created_at: string;
  updated_at: string;
}

export interface AddressData {
  street?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface Industry {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
}

export interface OrganizationFilters {
  type?: string;
  status?: string;
  industry_id?: number;
  parent_id?: string | null;
  search?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateOrganizationDto {
  name: string;
  parent_id?: string | null;
  industry_id?: number | null;
  size?: string | null;
  website?: string | null;
  email?: string | null;
  phone_country_code?: string | null;
  phone_number?: string | null;
  address_data?: AddressData | null;
  status?: string;
  notes?: string | null;
}

