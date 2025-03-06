const express = require('express');
const cors = require('cors'); // Importiere CORS
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

// Express app initialisieren
const app = express();

// CORS Middleware aktivieren
app.use(cors());  // Alle Ursprünge erlauben

// Datenbank verbinden
const db = new sqlite3.Database('./tasks.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Mit der SQLite-Datenbank verbunden.");
  }
});

// Middleware für JSON-Daten
app.use(bodyParser.json()); 

// Tabelle für Aufgaben erstellen, falls noch nicht vorhanden
db.run('CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT, completed BOOLEAN DEFAULT 0)', (err) => {
  if (err) {
    console.error("Fehler beim Erstellen der Tabelle:", err.message);
  }
});

// Beispielroute (Startseite)
app.get('/', (req, res) => {
  res.send('Request empfangen');
});

// Beispielroute
app.get('/ralf', (req, res) => {
  res.send('Vielen Dank, Ralf!');
});

// Route zum Hinzufügen eines neuen Tasks
app.post('/add', (req, res) => {
  const { title } = req.body;

  // Sicherstellen, dass der Task-Titel vorhanden ist
  if (!title) {
    return res.status(400).json({ error: 'Titel der Aufgabe ist erforderlich' });
  }

  db.run('INSERT INTO tasks (title) VALUES (?)', [title], function (err) {
    if (err) {
      return console.error("Fehler beim Hinzufügen der Aufgabe:", err.message);
    }
    res.status(201).json({ id: this.lastID, title, completed: false });
  });
});

// Route zum Abrufen aller Tasks
app.get('/tasks', (req, res) => {
  db.all('SELECT * FROM tasks', (err, rows) => {
    if (err) {
      return console.error("Fehler beim Abrufen der Aufgaben:", err.message);
    }
    res.json(rows);
  });
});

// Route zum Bearbeiten einer Aufgabe (Status ändern)
app.put('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  if (!title && completed === undefined) {
    return res.status(400).json({ error: 'Kein Titel oder Status zum Aktualisieren bereitgestellt' });
  }

  const updateQuery = 'UPDATE tasks SET title = ?, completed = ? WHERE id = ?';
  db.run(updateQuery, [title || null, completed !== undefined ? completed : null, id], function (err) {
    if (err) {
      return console.error("Fehler beim Bearbeiten der Aufgabe:", err.message);
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    res.json({ id, title, completed });
  });
});

// Route zum Löschen einer Aufgabe
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM tasks WHERE id = ?', [id], function (err) {
    if (err) {
      return console.error("Fehler beim Löschen der Aufgabe:", err.message);
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
    }

    res.status(204).send(); // Erfolgreiches Löschen (keine Inhalte)
  });
});

// Server starten
app.listen(5000, 'localhost', () => {
  console.log("Server läuft auf http://localhost:5000");
});
