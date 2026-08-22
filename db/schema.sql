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
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  photo_url     TEXT,
  language      VARCHAR(10) NOT NULL DEFAULT 'en',
  role          user_role NOT NULL DEFAULT 'USER',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  share_slug   VARCHAR(64) UNIQUE,
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
  act_order   INTEGER NOT NULL DEFAULT 0,
  notes       TEXT,
  custom_cost NUMERIC(10, 2)
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
