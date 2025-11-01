import React from "react";

// 1. Destructive button with no confirmation
function DeleteButtonNoConfirm() {

    const deleteAccount = () => {
      // Simulate account deletion
      console.log("Account deleted");
    };

  return (
    <div>
      <h3>Danger Zone</h3>
      <button onClick={() => deleteAccount()}>
        Delete Account
      </button>
    </div>
  );
}

// 2. Confirmation dialog missing cancel option
function ConfirmDialogWithoutCancel() {
  return (
    <Dialog>
      <h2>Are you sure?</h2>
      <p>This action is irreversible and cannot be undone.</p>
      <button>Yes, delete</button>
      {/* Missing cancel or dismiss option */}
    </Dialog>
  );
}

// 3. Select/dropdown missing contextual hint
function SelectWithoutHelp() {
  return (
    <form>
      <label htmlFor="country">Choose your country</label>
      <select id="country">
        <option value="">-- Select one --</option>
        <option value="de">Germany</option>
        <option value="us">USA</option>
      </select>
    </form>
  );
}

// BAD: RadioGroup missing tooltip or aria-label
function BadRadioGroupExample() {
  return (
    <div>
      <h2>Select your gender</h2>
      <RadioGroup name="gender">
        <label>
          <input type="radio" value="male" name="gender" />
          Male
        </label>
        <label>
          <input type="radio" value="female" name="gender" />
          Female
        </label>
      </RadioGroup>
    </div>
  );
}

// X BAD: no catch block at fetch or axios call
function FetchWithoutErrorHandling() {
    React.useEffect(() => {
        fetch('/api/users')
        .then(res => res.json());
    }, []);
}

// X BAD: Error inside catch is not user-friendly but dev-only
function FetchWithDevOnlyError() {
    React.useEffect(() => {
        fetch('/api/data')
        .then(res => res.json())
        .catch(err => {
            console.log('Fetch error:', err); // ❌ Only logs error, no user feedback
            //<ErrorBoundary feedback={'Test'}/>
        });
    }, []);
}

// X BAD: Alert instead of user-friendly error message
function FetchError() {
    try {
    fetch("/data");
    } catch (error) {
    console.log(error);
    }
}

// X BAD: Missing try-catch around fetch
function OnlyFetch() {
    fetch("/data").catch((error) => {
      console.log("Fetch failed:", error);
    });
}

// Mock component
function Dialog({ children }) {
  return <div className="dialog">{children}</div>;
}

function RadioGroup({name, children }) {
  return <div>{children}</div>;
}

function ErrorBoundary({ feedback }) {
  return <div className="error-boundary">{feedback}</div>;
}

export {
  DeleteButtonNoConfirm,
  ConfirmDialogWithoutCancel,
  SelectWithoutHelp,
  BadRadioGroupExample,
  FetchWithoutErrorHandling,
  FetchWithDevOnlyError,
  OnlyFetch,
  FetchError,
};