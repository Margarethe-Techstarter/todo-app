const express = require('express');
const sqlite3 = require('sqlite3');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// SQLite-Datenbank erstellen bzw. verbinden
const db = new sqlite3.Database('./tasks.db');

// Datenbanktabelle erstellen (falls noch nicht vorhanden)
db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, task TEXT, checked BOOLEAN)');

// GET: Alle Aufgaben abrufen
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Fehler beim Abrufen der Aufgaben');
    }
    res.json(rows);
  });
});

// POST: Eine neue Aufgabe hinzufügen
app.post('/tasks', (req, res) => {
  const { task } = req.body;
  if (!task) return res.status(400).send('Aufgabenname erforderlich');
  
  const stmt = db.prepare('INSERT INTO tasks (task, checked) VALUES (?, ?)');
  stmt.run(task, false, function (err) {
    if (err) return res.status(500).send('Fehler beim Hinzufügen der Aufgabe');
    res.json({ id: this.lastID, task, checked: false });
  });
});

// PUT: Eine Aufgabe bearbeiten
app.put('/tasks/:id', (req, res) => {
  const { task, checked } = req.body;
  const { id } = req.params;

  const stmt = db.prepare('UPDATE tasks SET task = ?, checked = ? WHERE id = ?');
  stmt.run(task, checked, id, function (err) {
    if (err) return res.status(500).send('Fehler beim Bearbeiten der Aufgabe');
    res.json({ id, task, checked });
  });
});

// DELETE: Eine Aufgabe löschen
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).send('Fehler beim Löschen der Aufgabe');
    res.send('Aufgabe gelöscht');
  });
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});
