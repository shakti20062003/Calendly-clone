-- Database Schema for Calendly Clone

-- Users table (simplified - assuming one default user)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  timezone VARCHAR(100) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Types table
CREATE TABLE event_types (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration INTEGER NOT NULL, -- in minutes
  slug VARCHAR(255) UNIQUE NOT NULL,
  color VARCHAR(7) DEFAULT '#4F46E5',
  is_active BOOLEAN DEFAULT true,
  buffer_before INTEGER DEFAULT 0, -- in minutes
  buffer_after INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability Schedules table
CREATE TABLE availability_schedules (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) DEFAULT 'Default Schedule',
  timezone VARCHAR(100) DEFAULT 'UTC',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability Rules table (recurring weekly availability)
CREATE TABLE availability_rules (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES availability_schedules(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Date Overrides table (specific date availability overrides)
CREATE TABLE date_overrides (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES availability_schedules(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event Type Schedules (many-to-many relationship)
CREATE TABLE event_type_schedules (
  event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
  schedule_id INTEGER REFERENCES availability_schedules(id) ON DELETE CASCADE,
  PRIMARY KEY (event_type_id, schedule_id)
);

-- Bookings/Meetings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
  invitee_name VARCHAR(255) NOT NULL,
  invitee_email VARCHAR(255) NOT NULL,
  invitee_timezone VARCHAR(100) DEFAULT 'UTC',
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, cancelled, rescheduled
  cancellation_reason TEXT,
  additional_info JSONB, -- store custom question answers
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom Questions table (for event types)
CREATE TABLE custom_questions (
  id SERIAL PRIMARY KEY,
  event_type_id INTEGER REFERENCES event_types(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_required BOOLEAN DEFAULT false,
  question_type VARCHAR(50) DEFAULT 'text', -- text, textarea, select, radio
  options JSONB, -- for select/radio types
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX idx_event_types_slug ON event_types(slug);
CREATE INDEX idx_event_types_user ON event_types(user_id);
CREATE INDEX idx_bookings_event_type ON bookings(event_type_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_availability_rules_schedule ON availability_rules(schedule_id);
CREATE INDEX idx_date_overrides_schedule_date ON date_overrides(schedule_id, date);

-- Sample Data
INSERT INTO users (name, email, timezone) VALUES 
  ('John Doe', 'john.doe@example.com', 'America/New_York');

INSERT INTO availability_schedules (user_id, name, timezone, is_default) VALUES 
  (1, 'Default Working Hours', 'America/New_York', true);

-- Monday to Friday, 9 AM to 5 PM
INSERT INTO availability_rules (schedule_id, day_of_week, start_time, end_time) VALUES
  (1, 1, '09:00:00', '17:00:00'), -- Monday
  (1, 2, '09:00:00', '17:00:00'), -- Tuesday
  (1, 3, '09:00:00', '17:00:00'), -- Wednesday
  (1, 4, '09:00:00', '17:00:00'), -- Thursday
  (1, 5, '09:00:00', '17:00:00'); -- Friday

INSERT INTO event_types (user_id, name, description, duration, slug, color) VALUES
  (1, '15 Minute Meeting', 'Quick 15-minute consultation', 15, '15min', '#4F46E5'),
  (1, '30 Minute Meeting', 'Standard 30-minute meeting', 30, '30min', '#10B981'),
  (1, '1 Hour Meeting', 'Extended 1-hour discussion', 60, '1hour', '#F59E0B');

INSERT INTO event_type_schedules (event_type_id, schedule_id) VALUES
  (1, 1), (2, 1), (3, 1);

-- Sample bookings
INSERT INTO bookings (event_type_id, invitee_name, invitee_email, start_time, end_time, status) VALUES
  (2, 'Jane Smith', 'jane.smith@example.com', '2026-01-08 10:00:00', '2026-01-08 10:30:00', 'confirmed'),
  (2, 'Bob Johnson', 'bob.j@example.com', '2026-01-09 14:00:00', '2026-01-09 14:30:00', 'confirmed'),
  (1, 'Alice Williams', 'alice.w@example.com', '2026-01-10 11:00:00', '2026-01-10 11:15:00', 'confirmed');