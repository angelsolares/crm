import { Organization } from './organization.model';
import { Project } from './project.model';
import { Contact } from './contact.model';

export interface Meeting {
  id: string;
  project_id: string | null;
  project?: Project | null;
  organization_id: string | null;
  organization?: Organization | null;
  created_by: string | null;
  creator?: {
    id: string;
    name: string;
  } | null;
  title: string;
  description: string | null;
  type: MeetingType;
  location: string | null;
  scheduled_at: string;
  end_time: string;
  duration_minutes: number;
  outcome: string | null;
  action_items: string | null;
  follow_up_date: string | null;
  status: MeetingStatus;
  attendees?: Contact[];
  created_at: string;
  updated_at: string;
}

export type MeetingType = 'virtual' | 'in_person' | 'phone';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export const MEETING_TYPES = [
  { value: 'virtual', label: 'Virtual', icon: 'video' },
  { value: 'in_person', label: 'In-Person', icon: 'users' },
  { value: 'phone', label: 'Phone', icon: 'phone' },
] as const;

export const MEETING_STATUSES = [
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { value: 'completed', label: 'Completed', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
  { value: 'rescheduled', label: 'Rescheduled', color: 'bg-yellow-500' },
] as const;

export interface MeetingFilters {
  organization_id?: string;
  project_id?: string;
  status?: string;
  type?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface CreateMeetingDto {
  project_id?: string | null;
  organization_id?: string | null;
  title: string;
  description?: string | null;
  type?: MeetingType;
  location?: string | null;
  scheduled_at: string;
  duration_minutes?: number;
  follow_up_date?: string | null;
  attendee_ids?: string[];
}

