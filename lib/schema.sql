CREATE TABLE IF NOT EXISTS daily_exercises (
  date        DATE PRIMARY KEY,
  exercises   JSONB NOT NULL,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_exercises_date
  ON daily_exercises (date DESC);
