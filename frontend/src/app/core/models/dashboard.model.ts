export interface DashboardStats {
  organizations: {
    total: number;
    clients: number;
    prospects: number;
    new_this_month: number;
  };
  contacts: {
    total: number;
    active: number;
    new_this_month: number;
  };
  projects: {
    total: number;
    active: number;
    total_value: number;
    won_this_month: number;
    pipeline: Record<string, { count: number; total_value: number | null }>;
  };
  meetings: {
    scheduled: number;
    upcoming_week: number;
    completed_this_month: number;
  };
  proposals: {
    total: number;
    draft: number;
    sent: number;
    accepted: number;
    total_value_pending: number;
  };
}

export interface ActivityItem {
  type: 'organization' | 'contact' | 'project';
  id: string;
  title: string;
  created_at: string;
}

