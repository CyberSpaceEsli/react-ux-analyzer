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

// Mock component
function Dialog({ children }) {
  return <div className="dialog">{children}</div>;
}

function RadioGroup({name, children }) {
  return <div>{children}</div>;
}

export {
  DeleteButtonNoConfirm,
  ConfirmDialogWithoutCancel,
  SelectWithoutHelp,
  BadRadioGroupExample
};