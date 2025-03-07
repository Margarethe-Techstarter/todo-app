import React from 'react';
import Todolist from './Todolist';  // Stelle sicher, dass die Datei korrekt importiert wird

function App() {
  return (
    <div>
      <h1>Hallo meine ToDoListe♥️!</h1>
      <Todolist /> {/* Hier wird die Todolist-Komponente gerendert */}
    </div>
  );
}

export default App;
