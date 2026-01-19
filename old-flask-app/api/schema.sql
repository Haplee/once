DROP TABLE IF EXISTS transaction_history;

CREATE TABLE transaction_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp TEXT NOT NULL,
  total REAL NOT NULL,
  received REAL NOT NULL,
  change REAL NOT NULL
);
