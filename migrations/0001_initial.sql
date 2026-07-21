PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT,
  email TEXT,
  emailVerified TEXT,
  image TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
  ON users(email)
  WHERE email IS NOT NULL;

CREATE TABLE IF NOT EXISTS accounts (
  id TEXT NOT NULL PRIMARY KEY,
  userId TEXT NOT NULL,
  type TEXT NOT NULL,
  provider TEXT NOT NULL,
  providerAccountId TEXT NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  oauth_token_secret TEXT,
  oauth_token TEXT,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_accounts_provider_account
  ON accounts(provider, providerAccountId);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id
  ON accounts(userId);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL,
  sessionToken TEXT NOT NULL PRIMARY KEY,
  userId TEXT NOT NULL,
  expires TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id
  ON sessions(userId);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT NOT NULL,
  token TEXT NOT NULL PRIMARY KEY,
  expires TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_tokens_identifier
  ON verification_tokens(identifier);

CREATE TABLE IF NOT EXISTS daily_exercises (
  date TEXT NOT NULL PRIMARY KEY,
  exercises TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS missed_problems (
  id TEXT NOT NULL PRIMARY KEY,
  user_id TEXT NOT NULL,
  problem_key TEXT NOT NULL,
  source_date TEXT NOT NULL,
  problem_type TEXT NOT NULL CHECK (problem_type IN ('vocab', 'sentence')),
  problem_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  answer TEXT NOT NULL,
  explanation TEXT NOT NULL,
  resolved_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, problem_key)
);

CREATE INDEX IF NOT EXISTS idx_missed_problems_user_active
  ON missed_problems(user_id, resolved_at, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_missed_problems_source
  ON missed_problems(source_date, problem_type, problem_order);

PRAGMA optimize;
