import { useState, useCallback } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronRight,
} from 'lucide-react';
import type { WeatherAlert } from '../types/weather';

interface WeatherAlertsProps {
  alerts: WeatherAlert[];
}

type Severity = 'advisory' | 'watch' | 'warning';

const SEVERITY_ORDER: Severity[] = ['warning', 'watch', 'advisory'];

const severityConfig: Record<
  Severity,
  { plural: string; Icon: React.FC<{ size?: number }> }
> = {
  warning: { plural: 'Warnings', Icon: AlertTriangle },
  watch: { plural: 'Watches', Icon: AlertCircle },
  advisory: { plural: 'Advisories', Icon: Info },
};

function toDisplaySeverity(apiSeverity: string): Severity {
  switch (apiSeverity.toLowerCase()) {
    case 'extreme':
    case 'severe':
      return 'warning';
    case 'moderate':
      return 'watch';
    default:
      return 'advisory';
  }
}

function shortTitle(title: string): string {
  return title
    .split(/\s+(?:issued|until|expires|effective|through)\b/i)[0]
    .trim();
}

export default function WeatherAlerts({ alerts }: WeatherAlertsProps) {
  const [activeModal, setActiveModal] = useState<Severity | null>(null);

  const grouped: Record<Severity, WeatherAlert[]> = {
    warning: alerts.filter((a) => toDisplaySeverity(a.severity) === 'warning'),
    watch: alerts.filter((a) => toDisplaySeverity(a.severity) === 'watch'),
    advisory: alerts.filter(
      (a) => toDisplaySeverity(a.severity) === 'advisory',
    ),
  };

  const openModal = useCallback((severity: Severity) => {
    setActiveModal(severity);
    document.body.classList.add('no-scroll');
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    document.body.classList.remove('no-scroll');
  }, []);

  if (!alerts.length) return null;

  return (
    <>
      <div className="alert-banners">
        {SEVERITY_ORDER.map((severity) => {
          const items = grouped[severity];
          if (!items.length) return null;
          const { plural, Icon } = severityConfig[severity];
          const label =
            items.length === 1
              ? shortTitle(items[0].title)
              : `${items.length} ${plural}`;
          return (
            <button
              key={severity}
              className={`alert-banner alert-banner--${severity}`}
              onClick={() => openModal(severity)}
            >
              <Icon size={14} />
              <span className="alert-banner-label">{label}</span>
              <ChevronRight size={14} className="alert-banner-chevron" />
            </button>
          );
        })}
      </div>

      {activeModal && (
        <div className="alert-modal-overlay" onClick={closeModal}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <div
              className={`alert-modal-header alert-modal-header--${activeModal}`}
            >
              <span className="alert-modal-title">
                {severityConfig[activeModal].plural}
              </span>
              <button className="alert-modal-close" onClick={closeModal}>
                <X size={14} />
              </button>
            </div>
            <div className="alert-modal-list">
              {grouped[activeModal].map((alert, i) => (
                <div
                  key={i}
                  className={`alert-modal-item alert-modal-item--${activeModal}`}
                >
                  <div className="alert-modal-item-title">{alert.title}</div>
                  <div className="alert-modal-item-desc">
                    {alert.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
