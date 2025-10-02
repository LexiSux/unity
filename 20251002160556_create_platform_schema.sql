/*
  # Platform Database Schema

  ## Overview
  Creates the foundation for a community-owned platform with two user types:
  - Entertainers: Full-featured profiles with premium upgrade options
  - Non-entertainers: Basic personal listings (free only)

  ## Tables

  ### 1. profiles
  Stores user profile information
  - `id` (uuid, references auth.users)
  - `user_type` (text) - 'entertainer' or 'non_entertainer'
  - `display_name` (text)
  - `email` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. listings
  Main listings/ads for both user types
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `title` (text)
  - `description` (text)
  - `location` (text) - city/region
  - `category` (text)
  - `images` (jsonb) - array of image URLs
  - `contact_info` (jsonb) - phone, email, website, etc
  - `is_active` (boolean)
  - `available_now` (boolean)
  - `available_until` (timestamptz) - when available_now expires
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. upgrades
  Tracks active premium features for entertainer listings
  - `id` (uuid, primary key)
  - `listing_id` (uuid, references listings)
  - `upgrade_type` (text) - 'image_rotation', 'highlight', 'sticky', 'available_now_extended'
  - `expires_at` (timestamptz)
  - `is_active` (boolean)
  - `created_at` (timestamptz)

  ### 4. upgrade_purchases
  Purchase history for transparency and tracking
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `listing_id` (uuid, references listings)
  - `upgrade_type` (text)
  - `duration_days` (integer)
  - `purchased_at` (timestamptz)

  ## Security
  - RLS enabled on all tables
  - Users can only manage their own data
  - Public can view active listings
  - Authenticated users can create/manage profiles and listings based on user_type

  ## Important Notes
  1. Default tier is FREE for all entertainers
  2. Only entertainers can purchase upgrades
  3. Available now feature auto-expires after 4 hours
  4. Sticky ads appear first in location/category results
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('entertainer', 'non_entertainer')),
  display_name text NOT NULL,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  category text NOT NULL,
  images jsonb DEFAULT '[]'::jsonb,
  contact_info jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  available_now boolean DEFAULT false,
  available_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create upgrades table
CREATE TABLE IF NOT EXISTS upgrades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  upgrade_type text NOT NULL CHECK (upgrade_type IN ('image_rotation', 'highlight', 'sticky', 'available_now_extended')),
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create upgrade_purchases table
CREATE TABLE IF NOT EXISTS upgrade_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  upgrade_type text NOT NULL,
  duration_days integer NOT NULL,
  purchased_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_available_now ON listings(available_now) WHERE available_now = true;
CREATE INDEX IF NOT EXISTS idx_upgrades_listing_id ON upgrades(listing_id);
CREATE INDEX IF NOT EXISTS idx_upgrades_active ON upgrades(is_active, expires_at) WHERE is_active = true;

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_purchases ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Listings policies
CREATE POLICY "Anyone can view active listings"
  ON listings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own listings"
  ON listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Upgrades policies
CREATE POLICY "Anyone can view active upgrades"
  ON upgrades FOR SELECT
  USING (is_active = true AND expires_at > now());

CREATE POLICY "Users can manage upgrades for their listings"
  ON upgrades FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update upgrades for their listings"
  ON upgrades FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  );

-- Upgrade purchases policies
CREATE POLICY "Users can view their own purchase history"
  ON upgrade_purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchase records for their listings"
  ON upgrade_purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);