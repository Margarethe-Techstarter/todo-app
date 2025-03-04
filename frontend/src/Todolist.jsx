import { useState, useEffect, useCallback, useRef } from 'react';
import './Todolist.css';  // Verlinkung zur CSS-Datei

function Todolist() {
    const [tasks, setTasks] = useState([
        { id: 1, task: "Todoliste Fertig Bauen", checked: false },
    ]);
    const [newTask, setNewTask] = useState(""); // Eingabefeld für neue Aufgaben
    const [editTaskId, setEditTaskId] = useState(null); // ID der aktuell bearbeiteten Aufgabe
    const [editText, setEditText] = useState(""); // Text für das bearbeitete Feld

    const taskListRef = useRef(null); // Referenz für die Task-Liste

    // Aufgabe hinzufügen
    const addTask = () => {
        if (newTask.trim() !== "") {
            setTasks([...tasks, { id: Date.now(), task: newTask, checked: false }]);
            setNewTask(""); // Nach dem Hinzufügen das Eingabefeld leeren
        }
    };

    // Aufgabe bearbeiten
    const startEditTask = (id, task) => {
        setEditTaskId(id);
        setEditText(task);
    };

    // Aufgabe speichern
    const saveEditTask = useCallback(() => {
        setTasks((prevTasks) =>
            prevTasks.map((task) =>
                task.id === editTaskId ? { ...task, task: editText } : task
            )
        );
        setEditTaskId(null); // Bearbeitung beenden
        setEditText(""); // Eingabefeld leeren
    }, [editTaskId, editText]); // Abhängigkeiten für die Stabilität der Funktion

    // Aufgabe löschen
    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    // Aufgabe als erledigt markieren
    const toggleCompleted = (id) => {
        setTasks(tasks.map(task =>
            task.id === id ? { ...task, checked: !task.checked } : task
        ));
    };

    // Alle Aufgaben löschen (Reset)
    const resetTasks = () => {
        setTasks([]);
    };

    // Mit Enter hinzufügen
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    };

    // Klicken außerhalb des Eingabefeldes schließen (mit useRef und useEffect)
    const handleClickOutside = useCallback((e) => {
        if (editTaskId !== null && taskListRef.current && !taskListRef.current.contains(e.target)) {
            saveEditTask(); // Speichern und schließen, wenn außerhalb geklickt wird
        }
    }, [editTaskId, saveEditTask]);

    // Event Listener für Klick außerhalb des Eingabefeldes hinzufügen
    useEffect(() => {
        document.addEventListener('click', handleClickOutside);

        // Aufräumen, um Event Listener zu entfernen
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [handleClickOutside]); // handleClickOutside als Abhängigkeit

    return (
        <div className="todo-container" ref={taskListRef}>
            <h2>To-Do Liste</h2>
            <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={handleKeyPress}
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
                                    onBlur={saveEditTask} // Wenn das Eingabefeld verlässt
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            saveEditTask(); // Speichern bei Enter
                                        }
                                    }}
                                    className="task-text editing" // CSS Klasse für das Bearbeiten
                                />
                            ) : (
                                <span
                                    onClick={() => startEditTask(task.id, task.task)}
                                    className={task.checked ? "task-text completed" : "task-text"}
                                >
                                    {task.task}
                                </span>
                            )}
                            <button onClick={() => deleteTask(task.id)} className="delete-button">Löschen</button>
                            <button onClick={() => startEditTask(task.id, task.task)} className="edit-button">Bearbeiten</button>
                        </li>
                    ))
                )}
            </ul>
            <button onClick={resetTasks} className="reset-button">Reset</button>
        </div>
    );
}

export default Todolist;
