// Mixed Modal Examples - Good and Bad UX Patterns
// Demonstrates both proper and improper modal exit mechanisms

import React, { useState } from 'react';

// ✅ GOOD: Modal with proper exit mechanisms
function GoodModalWithExits() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Good Modal</button>
      
      {/* ✅ Has onClose prop and visible close button */}
      {/* @ts-ignore - intentional bad example */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h2>Well-Designed Modal</h2>
            {/* ✅ Clear close button */}
            <button onClick={() => setIsOpen(false)}>×</button>
          </div>
          <p>Users have multiple ways to exit this modal.</p>
          <div>
            <button onClick={() => setIsOpen(false)}>Cancel</button>
            <button onClick={() => setIsOpen(false)}>Save & Close</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ❌ BAD: Dialog with missing close button
function BadDialogMissingClose() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setDialogOpen(true)}>Open Bad Dialog</button>
      
      {/* ❌ Has onClose but no visible close button */}
      {/* @ts-ignore - intentional bad example */}
      <Dialog open={dialogOpen}  onClose={() => setDialogOpen(false)}>
        <h3>Confirmation Dialog</h3>
        <p>Are you sure you want to delete this item?</p>
        
        <div>
          <button onClick={() => setDialogOpen(false)}>No</button>
          <button onClick={() => alert('Deleted!')}>Yes, Delete</button>
          {/* ❌ Missing clear "Close" or "×" button */}
        </div>
      </Dialog>
    </div>
  );
}

// ✅ GOOD: Popup with multiple exit options
function GoodPopupMultipleExits() {
  const [showPopup, setShowPopup] = useState(false);
  
  return (
    <div>
      <button onClick={() => setShowPopup(true)}>Show Good Popup</button>
      
      {/* ✅ Has onClose and visible close options */}
      <Popup 
        visible={showPopup} 
        onClose={() => setShowPopup(false)}
      >
        <div>
          <div style={{ textAlign: 'right' }}>
            {/* ✅ Clear close icon */}
            <button onClick={() => setShowPopup(false)}>×</button>
          </div>
          <h3>Newsletter Signup</h3>
          <p>Stay updated with our latest news!</p>
          <input type="email" placeholder="Enter your email" />
          <div>
            <button onClick={() => setShowPopup(false)}>Subscribe</button>
            <button onClick={() => setShowPopup(false)}>No Thanks</button>
          </div>
        </div>
      </Popup>
    </div>
  );
}

// ❌ BAD: Modal without onClose prop
function BadModalNoOnClose() {
  const [modalState, setModalState] = useState(false);
  
  return (
    <div>
      <button onClick={() => setModalState(true)}>Open Broken Modal</button>
      
      {/* ❌ Missing onClose prop */}
      {/* @ts-ignore - intentional bad example */}
      <Modal isOpen={modalState}>
        <div>
          <h2>Settings</h2>
          <p>Configure your preferences below:</p>
          
          <div>
            <label>
              <input type="checkbox" /> Enable notifications
            </label>
          </div>
          
          <div>
            {/* ❌ Close button exists but can't actually close modal */}
            <button onClick={() => setModalState(false)}>Close</button>
            <button onClick={() => alert('Saved!')}>Save Settings</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ✅ GOOD: Drawer with proper close mechanisms
function GoodDrawerWithClose() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setDrawerOpen(true)}>Open Good Drawer</button>
      
      {/* ✅ Has onClose prop and close button */}
      <Drawer 
        open={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3>Navigation</h3>
            {/* ✅ Clear close button */}
            <button onClick={() => setDrawerOpen(false)}>×</button>
          </div>
          
          <ul>
            <li><a href="/" onClick={() => setDrawerOpen(false)}>Home</a></li>
            <li><a href="/about" onClick={() => setDrawerOpen(false)}>About</a></li>
            <li><a href="/contact" onClick={() => setDrawerOpen(false)}>Contact</a></li>
          </ul>
        </div>
      </Drawer>
    </div>
  );
}

// ❌ BAD: Sheet with confusing close buttons
function BadSheetConfusingButtons() {
  const [sheetOpen, setSheetOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setSheetOpen(true)}>Open Confusing Sheet</button>
      
      {/* ✅ Has onClose prop but... */}
      <Sheet 
        visible={sheetOpen} 
        onClose={() => setSheetOpen(false)}
      >
        <h3>Filter Options</h3>
        <p>Select your preferences:</p>
        
        <div>
          <label><input type="checkbox" /> Option 1</label>
          <label><input type="checkbox" /> Option 2</label>
          <label><input type="checkbox" /> Option 3</label>
        </div>
        
        <div>
          {/* ❌ Too many buttons, unclear which one closes */}
          <button>Done</button>
          <button>Apply</button>
          <button>OK</button>
          <button>Finish</button>
          <button>Continue</button>
          {/* ❌ No clear "Close" or "×" button */}
        </div>
      </Sheet>
    </div>
  );
}

// ✅ GOOD: Overlay with clear exit
function GoodOverlayWithExit() {
  const [overlayVisible, setOverlayVisible] = useState(false);
  
  return (
    <div>
      <button onClick={() => setOverlayVisible(true)}>Show Good Overlay</button>
      
      {overlayVisible && (
        /* ✅ Controlled visibility and proper close mechanism */
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setOverlayVisible(false)} // ✅ Click to close
        >
          <div 
            style={{
              background: 'white',
              padding: '30px',
              borderRadius: '8px',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking content
          >
            {/* ✅ Clear close button */}
            <button 
              onClick={() => setOverlayVisible(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'none',
                border: 'none',
                fontSize: '20px'
              }}
            >
              ×
            </button>
            
            <h2>Image Preview</h2>
            <p>Click anywhere outside to close or use the × button.</p>
            <img src="/placeholder.jpg" alt="Preview" style={{ maxWidth: '300px' }} />
          </div>
        </div>
      )}
    </div>
  );
}

// ❌ BAD: Modal with broken close button functionality
function BadModalBrokenFunctionality() {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsVisible(true)}>Open Broken Modal</button>
      
      {/* ✅ Has onClose prop but... */}
      <Modal 
        isOpen={isVisible} 
        onClose={() => setIsVisible(false)}
      >
        <div>
          <h2>User Profile</h2>
          <p>Edit your profile information:</p>
          
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          
          <div>
            {/* ❌ Close button exists but doesn't call the close function */}
            <button onClick={() => console.log('Close clicked but modal stays open')}>
              Close
            </button>
            <button onClick={() => setIsVisible(false)}>Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

//Mock components
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return <div>{children}</div>;
}

function Dialog({ onClose, children }) {
  return <div>{children}</div>;
}

function Popup({ visible, onClose, children }) {
  if (!visible) return null;
  return <div>{children}</div>;
}

function Drawer({ open, onClose, children }) {
  if (!open) return null;
  return <div>{children}</div>;
}

function Sheet({ visible, onClose, children }) {
  if (!visible) return null;
  return <div>{children}</div>;
}


export {
  GoodModalWithExits,
  BadDialogMissingClose,
  GoodPopupMultipleExits,
  BadModalNoOnClose,
  GoodDrawerWithClose,
  BadSheetConfusingButtons,
  GoodOverlayWithExit,
  BadModalBrokenFunctionality
};
