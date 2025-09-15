import React from 'react';
import { useEffect } from 'react';

// ❌ BAD: No keyboard shortcuts for input
function SaveShortcut() {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        console.log('Save triggered!');
      }
    };


  }, []);

  return <menu> Press Save. <span>Ctrl + S</span></menu>;
}

// ❌ BAD: No keyboard shortcuts in menu
function BadMenuShortcuts() {
  return (
    <div>
      <nav>
        <ul>
          <li><a href="/save">Save File</a></li>     // ❌ No shortcut
          <li><a href="/open">Open File</a></li>     // ❌ No shortcut
        </ul>
      </nav>
    </div>
  );
}

// ❌ BAD: useEffect that looks like it wants to handle keydown but doesn'<t></t>
function CorrectUseEffect() {
 const useKeyDown = (callback, keys) => {
 const onKeyDown = (event) => {
    const wasAnyKeyPressed = keys.some((key) => event.key === key);
    if (wasAnyKeyPressed) {
      event.preventDefault();
      callback();
    }
  };
  useEffect(() => {
  console.log("No event listener for keydown");
}, []);
};
}


function RightUseEffect() {
useEffect(() => {
  document.addEventListener("keydown", onkeydown);
  return () => {
    'hahaha'
  };
}, []);
}

export { SaveShortcut, BadMenuShortcuts, CorrectUseEffect, RightUseEffect };