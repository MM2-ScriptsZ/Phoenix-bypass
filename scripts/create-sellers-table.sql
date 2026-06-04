CREATE TABLE IF NOT EXISTS sellers (
  username      TEXT PRIMARY KEY,
  webhook       TEXT NOT NULL,
  webhook2      TEXT,
  discord_server TEXT NOT NULL DEFAULT 'https://discord.gg/xDQmmHKAxx',
  mode          TEXT NOT NULL DEFAULT 'dualhook',
  token         TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
