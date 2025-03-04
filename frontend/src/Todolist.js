import { useState, useEffect } from 'react';
import './Todolist.css';

function Todolist() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editTaskId, setEditTaskId] = useState(null);
  const [editText, setEditText] = useState("");

  // Aufgaben vom Backend laden
  useEffect(() => {
    fetch("http://localhost:5000/tasks")
      .then(response => response.json())
      .then(data => setTasks(data))
      .catch(error => console.error("Fehler beim Laden der Aufgaben", error));
  }, []);

  // Aufgabe hinzufügen
  const addTask = () => {
    if (newTask.trim() !== "") {
      fetch("http://localhost:5000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task: newTask }),
      })
        .then(response => response.json())
        .then(data => {
          setTasks([...tasks, data]);
          setNewTask("");
        })
        .catch(error => console.error("Fehler beim Hinzufügen der Aufgabe", error));
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
      .then(response => response.json())
      .then(data => {
        setTasks(tasks.map(task =>
          task.id === editTaskId ? data : task
        ));
        setEditTaskId(null);
        setEditText("");
      })
      .catch(error => console.error("Fehler beim Bearbeiten der Aufgabe", error));
  };

  // Aufgabe löschen
  const deleteTask = (id) => {
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: "DELETE",
    })
      .then(() => {
        setTasks(tasks.filter(task => task.id !== id));
      })
      .catch(error => console.error("Fehler beim Löschen der Aufgabe", error));
  };

  // Aufgabe als erledigt markieren
  const toggleCompleted = (id) => {
    const task = tasks.find(task => task.id === id);
    fetch(`http://localhost:5000/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: task.task,
        checked: !task.checked
      }),
    })
      .then(response => response.json())
      .then(data => {
        setTasks(tasks.map(task =>
          task.id === id ? data : task
        ));
      })
      .catch(error => console.error("Fehler beim Markieren der Aufgabe", error));
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
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={saveEditTask}
                  className="task-text editing"
                />
              ) : (
                <span
                  onClick={() => setEditTaskId(task.id)}
                  className={task.checked ? "task-text completed" : "task-text"}
                >
                  {task.task}
                </span>
              )}
              <button onClick={() => deleteTask(task.id)} className="delete-button">Löschen</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default Todolist;
