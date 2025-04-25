import React, { useState, useEffect } from 'react';
import './Todolist.css';

function Todolist() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isAddPage, setIsAddPage] = useState(window.location.pathname === '/add');
  const [isHomePage, setIsHomePage] = useState(window.location.pathname === '/');  // Für die Startseite



  // Aufgaben vom Backend laden (nur wenn nicht auf der Startseite oder /add)
  useEffect(() => {
    if (!isHomePage) {
      const url = isAddPage ? "http://localhost:5000/add" : "http://localhost:5000/tasks";
      fetch(url)
        .then((response) => response.json())
        .then((data) => setTasks(data))  // Daten vom Backend in den State laden
        .catch((error) => console.error("Fehler beim Laden der Aufgaben", error));
    } else {
      // Auf der Startseite nur lokale Aufgaben anzeigen
      setTasks([{ id: 1, task: "Neue To-Do-Liste erstellen! ♥️", checked: false }]);

    }
  }, [isAddPage]);  // Wenn wir von der Startseite oder Add-Seite kommen

  // Aufgabe hinzufügen (nur auf der Add-Seite wird sie gespeichert)
  const addTask = () => {
    if (newTask.trim() !== "") {
      const url = isAddPage ? "http://localhost:5000/add" : "http://localhost:5000/tasks";
      fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: newTask }),
      })
        .then((response) => response.json())
        .then((data) => {
          
          const addedTask = {
            id: data.id || tasks.length + 1, // Fallback für die ID, falls das Backend keine liefert
            task: data.task || newTask, // Verwende `data.task` oder den ursprünglichen Text
            checked: data.checked || false, // Standardwert für `checked`
          };
          setTasks([...tasks, addedTask]); // Aufgabe zum State hinzufügen
          setNewTask(""); // Eingabefeld zurücksetzen
        })
        .catch((error) => console.error("Fehler beim Hinzufügen der Aufgabe", error));
    }
  };

  // Aufgabe bearbeiten
  const saveEditTask = () => {
    const url = isAddPage ? `http://localhost:5000/add/${editTaskId}` : `http://localhost:5000/tasks/${editTaskId}`;
    fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ task: editText, checked: false }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks(tasks.map((task) => (task.id === editTaskId ? data : task)));
        setEditTaskId(null);
        setEditText("");
      })
      .catch((error) => console.error("Fehler beim Bearbeiten der Aufgabe", error));
  };

  // Aufgabe löschen
  const deleteTask = (id) => {
    const url = isAddPage ? `http://localhost:5000/add/${id}` : `http://localhost:5000/tasks/${id}`;
    fetch(url, {
      method: "DELETE",
    })
      .then(() => {
        setTasks(tasks.filter((task) => task.id !== id));
      })
      .catch((error) => console.error("Fehler beim Löschen der Aufgabe", error));
  };

  // Aufgabe als erledigt markieren
  const toggleCompleted = (id) => {
    const task = tasks.find((task) => task.id === id);
    fetch(`http://localhost:5000/${isAddPage ? 'add' : 'tasks'}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: isAddPage ? task.task : task.pgtask,  // Hier `task.task` für SQLite und `task.pgtask` für PostgreSQL
        checked: !task.checked,  // `checked` für SQLite und `completed` für PostgreSQL
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        setTasks(tasks.map((task) => (task.id === id ? data : task)));
      })
      .catch((error) => console.error("Fehler beim Markieren der Aufgabe", error));
  };

  // Aufgabe hinzufügen per Enter
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && newTask.trim() !== "") {
      addTask();
    }
  };

  // Bearbeiten speichern per Enter
  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && editText.trim() !== "") {
      saveEditTask();
    }
  };

  return (
    <div className="todo-container">
      <h2>To-Do Liste</h2>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Neue Aufgabe"
        className="task-input"
      />
      <button onClick={addTask} className="add-button">
        {isAddPage ? "Add Task" : "Neue Aufgabe"}
      </button>

      <ul className="task-list">
        {tasks.length === 0 ? (
          <p>Keine Aufgaben vorhanden</p>
        ) : (
          tasks.map((task) => (
            <li key={task.id} className="task-item">
              <input
                type="checkbox"
                checked={task.checked}  // Verwende `checked` für SQLite und `completed` für PostgreSQL
                onChange={() => toggleCompleted(task.id)}
                className="checkbox"
              />
              {editTaskId === task.id ? (
                <div>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    className="task-input"
                  />
                  <button onClick={saveEditTask} className="save-button">
                    Speichern
                  </button>
                </div>
              ) : (
                <span
                  onClick={() => setEditTaskId(task.id)}
                  className={task.checked ? "task-text completed" : "task-text"}
                >
                  {task.task} {/* Verwende `task.task` für den statischen Task */}
                </span>
              )}
              <button
                className="delete-button"
                onClick={() => deleteTask(task.id)}
              >
                Löschen
              </button>
              <button
                className="edit-button"
                onClick={() => {
                  setEditTaskId(task.id);
                  setEditText(isAddPage ? task.task : task.pgtask);  // `task.task` für SQLite und `task.pgtask` für PostgreSQL
                }}
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
