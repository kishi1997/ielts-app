PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS quest_completions (
  id TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL,
  source_date TEXT NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (source_date) REFERENCES daily_exercises(date) ON DELETE CASCADE,
  UNIQUE (user_id, source_date)
);

CREATE INDEX IF NOT EXISTS idx_quest_completions_user_date
  ON quest_completions(user_id, source_date);

PRAGMA optimize;
