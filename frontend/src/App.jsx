import React from "react";
import Todolist from './Todolist'; // Importiere die Todolist-Komponente

function App() {
  return (
    <div>
      <h1>Hallo meine ToDoListe♥️!</h1>
      
      {/* Text, der nur auf der Hauptseite angezeigt wird */}
      {window.location.pathname === '/' && (
        <p>
          🦁 Du möchtest deine Liste Speichern? Dann leg sie doch unter{' '}
          <a href="/add">localhost/add</a> an. 🦋
          <br />
          ♥️ Viel Spaß! ♥️
        </p>
      )}

      {/* Die Todolist-Komponente */}
      <Todolist />
    </div>
  );
}

export default App;

