import sqlite3
import click
from flask import current_app, g
import os

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row

    return g.db

def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()

def init_db():
    db = get_db()
    
    # Create table for history
    # id, date, total, received, change, currency (default EUR)
    db.executescript('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_amount REAL NOT NULL,
            amount_received REAL NOT NULL,
            change_returned REAL NOT NULL,
            currency TEXT DEFAULT 'EUR'
        );
    ''')
    click.echo('Initialized the database.')

@click.command('init-db')
def init_db_command():
    """Clear the existing data and create new tables."""
    init_db()

def init_app(app):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_command)
