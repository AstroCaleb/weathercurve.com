interface ErrorAlertProps {
  message: string | null;
  onDismiss: () => void;
}

export default function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  return (
    <div
      className={`error-alert ${message ? 'show' : ''}`}
      onClick={onDismiss}
      role="alert"
    >
      Error
      <span className="error-msg">{message}</span>
    </div>
  );
}
