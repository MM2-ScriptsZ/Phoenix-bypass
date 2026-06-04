-- Admin settings table for system-wide configuration
CREATE TABLE IF NOT EXISTS admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  is_locked BOOLEAN DEFAULT FALSE,
  is_paused BOOLEAN DEFAULT FALSE,
  maintenance_message TEXT DEFAULT 'System is currently under maintenance',
  lock_message TEXT DEFAULT 'Bypasser is currently locked by administrators',
  admin_passcode TEXT NOT NULL,
  max_daily_bypasses INTEGER DEFAULT 1000,
  rate_limit_per_hour INTEGER DEFAULT 100,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Admin activity log
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id SERIAL PRIMARY KEY,
  action TEXT NOT NULL,
  admin_identifier TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- System statistics table
CREATE TABLE IF NOT EXISTS system_statistics (
  id SERIAL PRIMARY KEY,
  total_bypasses INTEGER DEFAULT 0,
  successful_bypasses INTEGER DEFAULT 0,
  failed_bypasses INTEGER DEFAULT 0,
  total_users INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date)
);

-- Insert default admin settings (change the passcode!)
INSERT INTO admin_settings (id, admin_passcode)
VALUES (1, 'admin123')
ON CONFLICT (id) DO NOTHING;

-- Insert initial statistics
INSERT INTO system_statistics (date, total_bypasses, successful_bypasses, failed_bypasses, total_users)
VALUES (CURRENT_DATE, 0, 0, 0, 0)
ON CONFLICT (date) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_activity_created ON admin_activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_stats_date ON system_statistics(date DESC);
CREATE INDEX IF NOT EXISTS idx_recent_bypasses_created ON recent_bypasses(created_at DESC);
