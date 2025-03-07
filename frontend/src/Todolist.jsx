import React, { useState, useEffect } from 'react';
import './Todolist.css';

function Todolist() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isAddPage, setIsAddPage] = useState(window.location.pathname === '/add');

  // Aufgaben vom Backend laden (nur wenn nicht auf /add)
  useEffect(() => {
    if (!isAddPage) {
      // Auf der Hauptseite keine Daten vom Server laden, aber die lokale Aufgabe hinzufügen
      setTasks([{ id: Date.now(), task: "Neue To-Do-Liste erstellen! ♥️", checked: false }]);
    } else {
      // Auf der Add-Seite vom Server laden
      fetch("http://localhost:5000/tasks")
        .then((response) => response.json())
        .then((data) => setTasks(data))
        .catch((error) => console.error("Fehler beim Laden der Aufgaben", error));
    }
  }, [isAddPage]);

  // Aufgabe hinzufügen (nur auf der Add-Seite wird sie gespeichert)
  const addTask = () => {
    if (newTask.trim() !== "") {
      if (isAddPage) {
        fetch("http://localhost:5000/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ task: newTask }),
        })
          .then((response) => response.json())
          .then((data) => {
            setTasks([...tasks, data]);
            setNewTask("");
          })
          .catch((error) => console.error("Fehler beim Hinzufügen der Aufgabe", error));
      } else {
        // Aufgaben nur lokal speichern, wenn nicht auf der /add-Seite
        setTasks([...tasks, { id: Date.now(), task: newTask, checked: false }]);
        setNewTask("");
      }
    }
  };

  // Aufgabe bearbeiten
  const saveEditTask = () => {
    fetch(`http://localhost:5000/tasks/${editTaskId}`, {
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
    fetch(`http://localhost:5000/tasks/${id}`, {
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
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: task.task,
        checked: !task.checked,
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
                  {task.task}
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
                  setEditText(task.task);
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
