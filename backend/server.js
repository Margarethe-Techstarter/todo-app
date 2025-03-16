const express = require('express');
const sqlite3 = require('sqlite3');
const { Pool } = require('pg');  // PostgreSQL hinzufügen
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// **PostgreSQL**-Verbindung für `/tasks`
const pgPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'todo_app',  // Deine PostgreSQL-Datenbank
  password: '6789',  // Dein PostgreSQL-Passwort
  port: 5432,
});

// **SQLite**-Verbindung für `/add`
const db = new sqlite3.Database('./tasks.db');

// Erstelle die Tabelle für SQLite, falls sie noch nicht existiert
db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, task TEXT, checked BOOLEAN)');

// **GET**: Alle Aufgaben von PostgreSQL abrufen (für `/tasks`)
app.get('/tasks', async (req, res) => {
  try {
    const result = await pgPool.query('SELECT id, pgtask, completed FROM pgtasks');
    res.json(result.rows);  // Aufgaben aus PostgreSQL zurückgeben
  } catch (err) {
    console.error('Fehler bei der PostgreSQL-Abfrage:', err);
    res.status(500).send('Fehler beim Abrufen der Aufgaben aus PostgreSQL');
  }
});

// **POST**: Eine neue Aufgabe zu PostgreSQL hinzufügen (für `/tasks`)
app.post('/tasks', async (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).send('Aufgabenname erforderlich');

  try {
    const result = await pgPool.query(
      'INSERT INTO pgtasks (pgtask, completed) VALUES ($1, $2) RETURNING *',
      [task, false]
    );
    res.json(result.rows[0]);  // Die hinzugefügte Aufgabe zurückgeben
  } catch (err) {
    console.error('Fehler beim Hinzufügen der Aufgabe in PostgreSQL:', err);
    res.status(500).send('Fehler beim Hinzufügen der Aufgabe in PostgreSQL');
  }
});

// **PUT**: Eine Aufgabe in PostgreSQL bearbeiten (für `/tasks/:id`)
app.put('/tasks/:id', async (req, res) => {
  const { task, checked } = req.body;
  const { id } = req.params;

  try {
    const result = await pgPool.query(
      'UPDATE pgtasks SET pgtask = $1, completed = $2 WHERE id = $3 RETURNING *',
      [task, checked, id]
    );
    res.json(result.rows[0]);  // Die bearbeitete Aufgabe zurückgeben
  } catch (err) {
    console.error('Fehler beim Bearbeiten der Aufgabe in PostgreSQL:', err);
    res.status(500).send('Fehler beim Bearbeiten der Aufgabe in PostgreSQL');
  }
});

// **DELETE**: Eine Aufgabe in PostgreSQL löschen (für `/tasks/:id`)
app.delete('/tasks/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pgPool.query('DELETE FROM pgtasks WHERE id = $1', [id]);
    res.send('Aufgabe gelöscht');
  } catch (err) {
    console.error('Fehler beim Löschen der Aufgabe in PostgreSQL:', err);
    res.status(500).send('Fehler beim Löschen der Aufgabe in PostgreSQL');
  }
});

// **GET**: Alle Aufgaben von SQLite abrufen (für `/add`)
app.get('/add', (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      console.error('Fehler beim Abrufen der Aufgaben aus SQLite:', err);
      return res.status(500).send('Fehler beim Abrufen der Aufgaben aus SQLite');
    }
    res.json(rows);  // Aufgaben aus SQLite zurückgeben
  });
});

// **POST**: Eine neue Aufgabe zu SQLite hinzufügen (für `/add`)
app.post('/add', (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).send('Aufgabenname erforderlich');

  const stmt = db.prepare('INSERT INTO tasks (task, checked) VALUES (?, ?)');
  stmt.run(task, false, function (err) {
    if (err) return res.status(500).send('Fehler beim Hinzufügen der Aufgabe in SQLite');
    res.json({ id: this.lastID, task, checked: false });
  });
});

// **PUT**: Eine Aufgabe in SQLite bearbeiten (für `/add/:id`)
app.put('/add/:id', (req, res) => {
  const { task, checked } = req.body;
  const { id } = req.params;

  const stmt = db.prepare('UPDATE tasks SET task = ?, checked = ? WHERE id = ?');
  stmt.run(task, checked, id, function (err) {
    if (err) return res.status(500).send('Fehler beim Bearbeiten der Aufgabe in SQLite');
    res.json({ id, task, checked });
  });
});

// **DELETE**: Eine Aufgabe in SQLite löschen (für `/add/:id`)
app.delete('/add/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).send('Fehler beim Löschen der Aufgabe in SQLite');
    res.send('Aufgabe gelöscht');
  });
});

// **Route für die Startseite (`/`)**
app.get('/', (req, res) => {
  res.send('Willkommen auf der To-Do Liste!');  // Eine einfache Nachricht für die Startseite
});

// Server starten
app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
