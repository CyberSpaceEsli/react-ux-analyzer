import React from "react";

function ServerErrorDisplay() {
  return (
    <div>
      <div>Error 500: Internal Server Error</div> {/* Should not be detected */}
    </div>
  );
}

function ApiFailureAlert() {
  return (
    <div className="alert-box">
      API_ERROR_TIMEOUT: Request failed to fetch {/* ❌ Technical + not red/styled */}
    </div>
  );
}

function NetworkErrorInline() {
  return (
    <span className="error text-red-500 font-bold">
      Network error occurred. ERR_TIMEOUT {/* ❌ Technical */}
    </span>
  );
}

function BadErrorMessage() {
  return (
    <ErrorMessage>
    <div>
      <p>Please Leave Website as Soon as Possible</p> {/* ❌  No visual cues */}
    </div>
    </ErrorMessage>
  );
}

function SystemNotification() {
  return (
    <div className="error-notification">
      Failed to fetch data. Please retry later. {/* ❌ Message is vague */}
    </div>
  );
}

//Mock components
function ErrorMessage({ children }) {
    return <div>{children}</div>;
}

export {
  ServerErrorDisplay,
  ApiFailureAlert,
  NetworkErrorInline,
  BadErrorMessage,
  SystemNotification,
};