import React, { useState, useEffect } from 'react';
import './Todolist.css';  // Deine CSS-Datei für Stil

function Todolist() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null); // ID der Aufgabe, die bearbeitet wird
  const [editText, setEditText] = useState(""); // Der neue Text für die Aufgabe

  // Lade Aufgaben vom Backend
  useEffect(() => {
    fetch('http://localhost:5000/tasks')
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error('Fehler beim Abrufen der Aufgaben:', error));
  }, []);

  // Aufgabe hinzufügen
  const addTask = () => {
    if (newTask.trim() !== "") {
      fetch("http://localhost:5000/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: newTask }), // Sendet die neue Aufgabe an das Backend
      })
      .then(response => response.json())
      .then(data => {
        setTasks([...tasks, data]);  // Neue Aufgabe zur Liste hinzufügen
        setNewTask("");  // Eingabefeld leeren
      })
      .catch(error => console.error('Fehler beim Hinzufügen der Aufgabe:', error));
    }
  };

  // Aufgabe bearbeiten
  const startEditTask = (id, task) => {
    setEditTaskId(id);   // ID der Aufgabe speichern, die bearbeitet wird
    setEditText(task);    // Text der Aufgabe zum Bearbeiten in das Eingabefeld setzen
  };

  // Aufgabe speichern (nach dem Bearbeiten)
  const saveEditTask = () => {
    if (editText.trim() !== "") {
      fetch(`http://localhost:5000/edit/${editTaskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: editText }),
      })
      .then(() => {
        setTasks(tasks.map((task) =>
          task.id === editTaskId ? { ...task, task: editText } : task
        ));  // Aufgabe lokal aktualisieren
        setEditTaskId(null);  // Bearbeitung beenden
        setEditText("");  // Eingabefeld leeren
      })
      .catch(error => console.error('Fehler beim Bearbeiten der Aufgabe:', error));
    }
  };

  // Aufgabe löschen
  const deleteTask = (id) => {
    fetch(`http://localhost:5000/delete/${id}`, {
      method: "DELETE",  // DELETE-Anfrage an den Server
    })
    .then(() => {
      setTasks(tasks.filter(task => task.id !== id)); // Entfernt die Aufgabe aus dem lokalen State
    })
    .catch(error => console.error('Fehler beim Löschen der Aufgabe:', error));
  };

  // Aufgabe als erledigt markieren
  const toggleCompleted = (id) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, checked: !task.checked } : task
    );
    setTasks(updatedTasks); // Lokalen Status ändern
  };

  return (
    <div className="todo-container">
      <h2>To-Do Liste</h2>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Neue Aufgabe"
        className="task-input"
      />
      <button onClick={addTask} className="add-button">Add Task</button>

      <ul className="task-list">
        {tasks.length === 0 ? (
          <p>Keine Aufgaben vorhanden</p>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.checked}
                onChange={() => toggleCompleted(task.id)}
                className="checkbox"
              />
              {editTaskId === task.id ? (
                <div>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="task-input"
                  />
                  <button onClick={saveEditTask} className="save-button">Speichern</button>
                </div>
              ) : (
                <span className={task.checked ? "task-text completed" : "task-text"}>
                  {task.task}
                </span>
              )}
              <button
                className="delete-button"
                onClick={() => deleteTask(task.id)} // Aufruf der deleteTask-Funktion
              >
                Löschen
              </button>
              <button
                className="edit-button"
                onClick={() => startEditTask(task.id, task.task)} // Aufruf der startEditTask-Funktion
              >
                Bearbeiten
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Todolist;
