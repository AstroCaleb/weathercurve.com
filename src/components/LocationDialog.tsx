import { useRef, useEffect, useCallback } from 'react';

interface LocationDialogProps {
  open: boolean;
  onConfirm: () => void;
  onDeny: () => void;
}

export default function LocationDialog({
  open,
  onConfirm,
  onDeny,
}: LocationDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const submitter = (e.nativeEvent as SubmitEvent)
        .submitter as HTMLButtonElement;
      if (submitter?.value === 'yes') {
        onConfirm();
      } else {
        onDeny();
      }
    },
    [onConfirm, onDeny],
  );

  return (
    <dialog id="location-request" ref={dialogRef}>
      <form onSubmit={handleSubmit}>
        <p>
          Can WeatherCurve.com use your current location to provide you with
          local weather information?
        </p>
        <div className="button-row">
          <button type="submit" value="no">
            No
          </button>
          <button type="submit" value="yes">
            Yes
          </button>
        </div>
      </form>
    </dialog>
  );
}
