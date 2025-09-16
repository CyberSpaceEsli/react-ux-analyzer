import React from "react";

// ❌ Modal with no help or instructional content
function BadModalWithoutHelp() {
  return (
    <Modal>
        <h2>Welcome to the page</h2>
        <p>This tour will show you everything.</p>
        {/* Missing "Start" button */}
    </Modal>
  );
}

// ❌ Navigation with no "Help", "Docs", or "Support" links
function BadNavWithoutHelpLink() {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>
      <a href="/profile">Profile</a>
      <a href="/settings">Settings</a>
    </nav>
  );
}

// ❌ Form actions with no tooltip/title/hint
function FormActionsWithoutTooltips() {
  return (
    <form>
    <input type="file" />
    <input type="password" />
    <button>Upload</button>
    </form>
  );
}

// ❌ Icon button with no aria-label, title, or tooltip
function BadIconButtonNoTooltip() {
  return (
      <IconButton>
        <DeleteIcon />
      </IconButton>
  );
}

// Mock components
function Modal({ children }) {
  return <div className="modal">{children}</div>;
}

function IconButton({ children, ...props }) {
  return <button {...props}>{children}</button>;
}

function DeleteIcon() {
  return <svg>🗑</svg>;
}

export {
  BadModalWithoutHelp,
  BadNavWithoutHelpLink,
  FormActionsWithoutTooltips
};