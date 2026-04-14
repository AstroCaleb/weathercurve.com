interface LoadingSpinnerProps {
  visible: boolean;
}

export default function LoadingSpinner({ visible }: LoadingSpinnerProps) {
  return (
    <div className={`spinner-wrapper ${visible ? 'visible' : ''}`}>
      <span className="spinner" />
    </div>
  );
}
