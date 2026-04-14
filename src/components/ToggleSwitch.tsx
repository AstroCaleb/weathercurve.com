import { useId } from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  labelHidden?: boolean;
  offLabel?: string;
  onLabel?: string;
}

export default function ToggleSwitch({
  checked,
  onChange,
  label,
  labelHidden,
  offLabel,
  onLabel,
}: ToggleSwitchProps) {
  const id = useId();

  return (
    <label className="toggle-switch" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label && (
        <div className={`label${labelHidden ? ' visually-hidden' : ''}`}>
          {label}
        </div>
      )}
      <span aria-hidden="true">
        <span>{offLabel}</span>
        <span>{onLabel}</span>
        <i />
      </span>
    </label>
  );
}
