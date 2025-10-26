-- User Activity Tracking Migration
-- Add this to your database to enable activity tracking

-- User Activity Tracking Tables
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT CHECK (role IN ('student', 'admin', 'superadmin')) NOT NULL,
    name TEXT NOT NULL,
    identifier TEXT,  -- roll_number or username
    ip_address TEXT,
    user_agent TEXT,
    platform TEXT,
    is_mobile BOOLEAN,
    login_time TIMESTAMP DEFAULT NOW(),
    logout_time TIMESTAMP,
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS login_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    role TEXT CHECK (role IN ('student','admin','superadmin')) NOT NULL,
    identifier TEXT NOT NULL,  -- roll_number or username
    name TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    platform TEXT,
    is_mobile BOOLEAN,
    login_time TIMESTAMP DEFAULT NOW()
);

-- Trigger Function for Activity Logging
CREATE OR REPLACE FUNCTION log_user_activity()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_activity (
      user_id, role, name, identifier, ip_address,
      user_agent, platform, is_mobile, login_time
  )
  VALUES (
      NEW.user_id, NEW.role, NEW.name, NEW.identifier, NEW.ip_address,
      NEW.user_agent, NEW.platform, NEW.is_mobile, NEW.login_time
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Activity Logging
DROP TRIGGER IF EXISTS trg_log_user_activity ON login_events;
CREATE TRIGGER trg_log_user_activity
AFTER INSERT ON login_events
FOR EACH ROW
EXECUTE FUNCTION log_user_activity();

-- Add name column to admins table if not exists
ALTER TABLE admins ADD COLUMN IF NOT EXISTS name TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_activity_login_time ON user_activity(login_time);
CREATE INDEX IF NOT EXISTS idx_user_activity_role ON user_activity(role);
CREATE INDEX IF NOT EXISTS idx_user_activity_active ON user_activity(active);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
