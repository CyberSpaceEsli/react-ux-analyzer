// Bad Modal Examples - Missing Exit Mechanisms
// These examples demonstrate poor modal UX that violates Nielsen Heuristic #3

import React, { useState } from 'react';

// ❌ BAD: Modal with no close button and no onClose prop
function BadBasicModal() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      {/* Missing onClose prop, no close button */}
      {/* @ts-ignore - intentional bad example */}
      <Modal isOpen={isOpen}>
        <h2>Trapped Modal</h2>
        <p>Users have no way to close this modal!</p>
        <p>This violates user control and freedom.</p>
      </Modal>
    </div>
  );
}

// ❌ BAD: Dialog missing state control prop
function BadDialogNoState() {
  const handleSubmit = () => {
    // Logic here
  };
  
  return (
    <div>
      {/* Missing isOpen/visible prop - can't control when it shows */}
      <SimpleDialog>
        <h3>Uncontrolled Dialog</h3>
        <button onClick={handleSubmit}>Submit</button>
        <button>Close</button> {/* No close handler */}
      </SimpleDialog>
    </div>
  );
}

// ❌ BAD: Modal with broken close button (no handler)
function BadModalBrokenClose() {
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Open</button>
      
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        <div>
          <h2>Broken Close Button</h2>
          <p>The close button below does nothing</p>
          
          {/* Close button without onClick handler */}
          <button>Close</button>
          
          <div>
            <button onClick={() => alert('Save')}>Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ❌ BAD: Modal that only closes programmatically (no user control)
function BadModalNoUserControl() {
  const [autoModal, setAutoModal] = useState(false);
  
  // Modal closes automatically after 10 seconds
  React.useEffect(() => {
    if (autoModal) {
      const timer = setTimeout(() => setAutoModal(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [autoModal]);
  
  return (
    <div>
      <button onClick={() => setAutoModal(true)}>
        Open Auto-Close Modal
      </button>
      
      {/* No onClose prop, no close button - users have no control */}
      {/* @ts-ignore - intentional bad example */}
      <Modal isOpen={autoModal}>
        <div>
          <h2>Wait 10 Seconds...</h2>
          <p>This modal will close automatically</p>
          <p>You have no control over when it closes</p>
          <div>Loading...</div>
        </div>
      </Modal>
    </div>
  );
}

  // ❌ BAD: Multi-step form without a Back button
  function BadMultiStepForm() {
    const [step, setStep] = React.useState(1);

    const next = () => setStep((s) => s + 1);

    return (
      <div>
        {step === 1 && (
          <div>
            <h2>Step 1</h2>
            <input placeholder="Name" />
            <button onClick={next}>Next</button>
            {/* Missing Back button */}
          </div>
        )}
        {step === 2 && (
          <div>
            <h2>Step 2</h2>
            <input placeholder="Email" />
            <button onClick={next}>Next</button>
            {/* Still missing Back button */}
          </div>
        )}
      </div>
    );
  }

  // ❌ BAD: Form with destructive action but no Undo
  function BadDeleteAction() {
    const [deleted, setDeleted] = React.useState(false);

    return (
      <div>
        {!deleted ? (
          <div>
            <p>Are you sure you want to delete your account?</p>
            <button onClick={() => setDeleted(true)}>Delete Account</button>
            {/* No Undo option provided */}
          </div>
        ) : (
          <p>Account deleted.</p>
        )}
      </div>
    );
  }

 // ❌ BAD: Only Next buttons, no Back navigation
function BadNextOnlyForm() {
  const [step, setStep] = useState(1);

  return (
    <div>
      {step === 1 && (
        <div>
          <h2>Step 1</h2>
          <button onClick={() => setStep(2)}>Next</button>
        </div>
      )}
      {step === 2 && (
        <div>
          <h2>Step 2</h2>
          <button onClick={() => setStep(3)}>Next</button>
        </div>
      )}
      {step === 3 && (
        <div>
          <h2>Step 3</h2>
          <button onClick={() => alert("Submit")}>Finish</button>
        </div>
      )}
    </div>
  );
}

  // ❌ BAD: Modal with only confusing exit, no clear close
  function BadConfusingModal() {
    const [open, setOpen] = React.useState(true);

    return (
      // @ts-ignore - intentional bad example
      <Modal isOpen={open}>
        <h2>Confusing Exit</h2>
        <p>Which button actually closes this?</p>
        {/* Buttons exist but none clearly labeled as close */}
        <button>OK</button>
        <button>Done</button>
        <button>Finish</button>
      </Modal>
    );
}

// Mock components
function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return <div>{children}</div>;
}

function SimpleDialog(children) {
  return <div>{children}</div>;
}

export {
  BadBasicModal,
  BadDialogNoState,
  BadModalBrokenClose,
  BadModalNoUserControl,
  BadMultiStepForm,
  BadDeleteAction,
  BadNextOnlyForm,
  BadConfusingModal
};
