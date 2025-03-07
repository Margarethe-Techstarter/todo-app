import React from 'react';
import Todolist from './Todolist';  // Stelle sicher, dass die Datei korrekt importiert wird

function App() {
  return (
    <div>
      <h1>Hallo meine ToDoListe♥️!</h1>
      <p>🦁 Du möchtest deine Liste Speichern? Dann leg sie doch unter localhost/add an. 🦋<br />
      ♥️ Viel spaß! ♥️</p>
      <Todolist /> {/* Hier wird die Todolist-Komponente gerendert */}
    </div>
  );
}

export default App;
