-- GlobeTrotter schema for PostgreSQL (run in pgAdmin Query Tool)
-- Create database first: CREATE DATABASE globetrotter;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE activity_type AS ENUM (
  'SIGHTSEEING', 'FOOD', 'ADVENTURE', 'CULTURE',
  'SHOPPING', 'RELAXATION', 'TRANSPORT', 'OTHER'
);
CREATE TYPE budget_category AS ENUM (
  'TRANSPORT', 'STAY', 'ACTIVITIES', 'MEALS', 'OTHER'
);

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL UNIQUE,
  username      VARCHAR(60),
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(160) NOT NULL,
  first_name    VARCHAR(80) NOT NULL,
  last_name     VARCHAR(80) NOT NULL,
  phone         VARCHAR(30),
  home_city     VARCHAR(120),
  home_country  VARCHAR(120),
  additional_info TEXT,
  photo_url     TEXT,
  language      VARCHAR(10) NOT NULL DEFAULT 'en',
  role          user_role NOT NULL DEFAULT 'USER',
  is_suspended  BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_at  TIMESTAMPTZ,
  suspended_reason TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_username ON users (username) WHERE username IS NOT NULL;

CREATE TABLE cities (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(120) NOT NULL,
  country    VARCHAR(120) NOT NULL,
  region     VARCHAR(120),
  cost_index NUMERIC(6, 2) NOT NULL DEFAULT 1.00,
  popularity INTEGER NOT NULL DEFAULT 0,
  image_url  TEXT,
  latitude   DOUBLE PRECISION,
  longitude  DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (name, country)
);

CREATE INDEX idx_cities_country ON cities (country);
CREATE INDEX idx_cities_popularity ON cities (popularity DESC);

CREATE TABLE activities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id      UUID NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  type         activity_type NOT NULL DEFAULT 'OTHER',
  cost         NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_hrs NUMERIC(5, 2),
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_city ON activities (city_id);
CREATE INDEX idx_activities_type ON activities (type);

CREATE TABLE trips (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  cover_photo  TEXT,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  start_point  VARCHAR(200),
  end_point    VARCHAR(200),
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  share_slug   VARCHAR(64) UNIQUE,
  is_featured  BOOLEAN NOT NULL DEFAULT FALSE,
  budget_limit NUMERIC(12, 2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trips_user ON trips (user_id);

CREATE TABLE trip_stops (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  city_id    UUID NOT NULL REFERENCES cities (id),
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  stop_order INTEGER NOT NULL,
  notes      TEXT,
  UNIQUE (trip_id, stop_order)
);

CREATE INDEX idx_trip_stops_trip ON trip_stops (trip_id);

CREATE TABLE trip_activities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stop_id     UUID NOT NULL REFERENCES trip_stops (id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES activities (id),
  day_date    DATE NOT NULL,
  start_time  VARCHAR(8),
  end_time    VARCHAR(8),
  act_order   INTEGER NOT NULL DEFAULT 0,
  notes       TEXT,
  custom_cost NUMERIC(10, 2),
  is_done     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_trip_activities_stop ON trip_activities (stop_id);

CREATE TABLE trip_costs (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id  UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  category budget_category NOT NULL,
  label    VARCHAR(200),
  amount   NUMERIC(12, 2) NOT NULL,
  day_date DATE
);

CREATE INDEX idx_trip_costs_trip ON trip_costs (trip_id);

CREATE TABLE saved_destinations (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  city_id UUID NOT NULL REFERENCES cities (id) ON DELETE CASCADE,
  UNIQUE (user_id, city_id)
);

CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens (user_id);
CREATE INDEX idx_password_reset_tokens_hash ON password_reset_tokens (token_hash);

CREATE TABLE packing_suggestion_templates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season     VARCHAR(20) NOT NULL DEFAULT 'all',
  month_from SMALLINT,
  month_to   SMALLINT,
  label      VARCHAR(120) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE trip_packing_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id    UUID NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  label      VARCHAR(120) NOT NULL,
  checked    BOOLEAN NOT NULL DEFAULT FALSE,
  source     VARCHAR(40) NOT NULL DEFAULT 'weather_suggestion',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trip_packing_items_trip ON trip_packing_items (trip_id);

CREATE TABLE community_posts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  body       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_community_posts_created ON community_posts (created_at DESC);

CREATE TABLE app_settings (
  key        VARCHAR(100) PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional CHECK constraints (also in migration 003_check_constraints.sql)
ALTER TABLE trips ADD CONSTRAINT trips_dates_check CHECK (end_date >= start_date);
ALTER TABLE trip_stops ADD CONSTRAINT trip_stops_dates_check CHECK (end_date >= start_date);
ALTER TABLE trip_costs ADD CONSTRAINT trip_costs_amount_nonnegative CHECK (amount >= 0);
ALTER TABLE activities ADD CONSTRAINT activities_cost_nonnegative CHECK (cost >= 0);
ALTER TABLE packing_suggestion_templates ADD CONSTRAINT packing_templates_month_range CHECK (
  (month_from IS NULL AND month_to IS NULL)
  OR (month_from BETWEEN 1 AND 12 AND month_to BETWEEN 1 AND 12)
);

