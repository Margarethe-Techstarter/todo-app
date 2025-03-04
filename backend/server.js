const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 5000;  // Backend läuft auf Port 5000

app.use(cors());
app.use(bodyParser.json());

// SQLite-Datenbank erstellen oder öffnen
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Tabelle für Aufgaben erstellen, falls noch nicht vorhanden
db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT,
    checked BOOLEAN
)`);

// Endpunkt zum Abrufen aller Aufgaben
app.get('/tasks', (req, res) => {
  db.all("SELECT * FROM tasks", [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.json(rows);
  });
});

// Endpunkt zum Hinzufügen einer neuen Aufgabe
app.post('/tasks', (req, res) => {
  const { task } = req.body;
  const sql = 'INSERT INTO tasks (task, checked) VALUES (?, ?)';
  db.run(sql, [task, false], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.status(201).json({ id: this.lastID, task, checked: false });
  });
});

// Endpunkt zum Bearbeiten einer Aufgabe
app.put('/tasks/:id', (req, res) => {
  const { task, checked } = req.body;
  const { id } = req.params;
  const sql = 'UPDATE tasks SET task = ?, checked = ? WHERE id = ?';
  db.run(sql, [task, checked, id], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.json({ id, task, checked });
  });
});

// Endpunkt zum Löschen einer Aufgabe
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tasks WHERE id = ?';
  db.run(sql, [id], function(err) {
    if (err) {
      return console.error(err.message);
    }
    res.status(204).send();
  });
});

// Server starten
app.listen(port, () => {
  console.log(`Backend läuft auf http://localhost:${port}`);
});
