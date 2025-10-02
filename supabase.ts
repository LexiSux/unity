import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'entertainer' | 'non_entertainer';

export interface Profile {
  id: string;
  user_type: UserType;
  display_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  images: string[];
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  is_active: boolean;
  available_now: boolean;
  available_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface Upgrade {
  id: string;
  listing_id: string;
  upgrade_type: 'image_rotation' | 'highlight' | 'sticky' | 'available_now_extended';
  expires_at: string;
  is_active: boolean;
  created_at: string;
}
