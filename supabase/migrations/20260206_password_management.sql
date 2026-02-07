-- Add password management columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_force_password_change ON profiles(force_password_change) WHERE force_password_change = true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.force_password_change IS 'Flag to force user to change password on next login';
COMMENT ON COLUMN profiles.last_password_change IS 'Timestamp of last password change';
