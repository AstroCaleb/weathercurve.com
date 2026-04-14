import { useState, useCallback } from 'react';
import { Check, X, Navigation, ExternalLink } from 'lucide-react';
import ToggleSwitch from './ToggleSwitch';
import { geocodeAddress } from '../services/geocodeApi';
import type {
  SavedLocation,
  SavedLocationsData,
  TimeFormat,
} from '../types/weather';

interface SidebarProps {
  isOpen: boolean;
  timeFormat: TimeFormat;
  onTimeFormatChange: (format: TimeFormat) => void;
  savedLocationsData: SavedLocationsData;
  onSavedLocationsChange: (data: SavedLocationsData) => void;
  onSelectLocation: (location: SavedLocation | 'current') => void;
  onError: (message: string) => void;
}

export default function Sidebar({
  isOpen,
  timeFormat,
  onTimeFormatChange,
  savedLocationsData,
  onSavedLocationsChange,
  onSelectLocation,
  onError,
}: SidebarProps) {
  const [lookupText, setLookupText] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleAddLocation = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!lookupText.trim()) {
        onError('Please enter a location');
        return;
      }

      setIsSearching(true);
      try {
        const result = await geocodeAddress(lookupText);

        const isDuplicate = savedLocationsData.locations.some(
          (loc) =>
            Math.abs(loc.longitude - result.longitude) < 0.001 &&
            Math.abs(loc.latitude - result.latitude) < 0.001,
        );
        if (isDuplicate) {
          onError('That location already exists');
          setIsSearching(false);
          return;
        }

        const newLocation: SavedLocation = {
          id: String(Math.floor(Math.random() * (1000000 - 10000) + 10000)),
          name: result.name,
          longitude: result.longitude,
          latitude: result.latitude,
        };

        const updated: SavedLocationsData = {
          ...savedLocationsData,
          locations: [...savedLocationsData.locations, newLocation],
        };
        onSavedLocationsChange(updated);
        setLookupText('');
      } catch {
        onError('Failed to find your location');
      } finally {
        setIsSearching(false);
      }
    },
    [lookupText, savedLocationsData, onSavedLocationsChange, onError],
  );

  const handleRemoveLocation = useCallback(
    (id: string) => {
      const updated: SavedLocationsData = {
        ...savedLocationsData,
        locations: savedLocationsData.locations.filter((loc) => loc.id !== id),
      };

      if (
        savedLocationsData.activeLocation === id ||
        updated.locations.length === 0
      ) {
        updated.activeLocation = null;
        updated.useCurrent = true;
        onSavedLocationsChange(updated);
        onSelectLocation('current');
      } else {
        onSavedLocationsChange(updated);
      }
    },
    [savedLocationsData, onSavedLocationsChange, onSelectLocation],
  );

  const handleSelectLocation = useCallback(
    (location: SavedLocation | 'current') => {
      if (location === 'current') {
        onSavedLocationsChange({
          ...savedLocationsData,
          useCurrent: true,
          activeLocation: null,
        });
      } else {
        onSavedLocationsChange({
          ...savedLocationsData,
          useCurrent: false,
          activeLocation: location.id,
        });
      }
      onSelectLocation(location);
    },
    [savedLocationsData, onSavedLocationsChange, onSelectLocation],
  );

  const isActive = (id: string | 'current') => {
    if (id === 'current') return savedLocationsData.useCurrent;
    return savedLocationsData.activeLocation === id;
  };

  return (
    <nav
      className={`sidebar ${isOpen ? 'open' : ''}`}
      aria-label="Location and settings"
    >
      <div className="time-format">
        <ToggleSwitch
          checked={timeFormat === '24'}
          onChange={(checked) => onTimeFormatChange(checked ? '24' : '12')}
          label="24 Hour Format"
        />
      </div>

      <form
        id="location-lookup-form"
        className={isSearching ? 'loading' : ''}
        onSubmit={handleAddLocation}
      >
        <div className="input-wrapper">
          <div className="input-spinner-wrapper">
            <span className="spinner" />
          </div>
          <input
            type="text"
            placeholder="Location (ZIP code / City, ST)"
            value={lookupText}
            onChange={(e) => setLookupText(e.target.value)}
          />
        </div>
        <button className="btn add-location-btn" type="submit">
          Add
        </button>
      </form>

      <div className="locations-wrapper">
        <div className="location-item-wrapper">
          <button
            className={`location-item current-location ${isActive('current') ? 'active' : ''}`}
            onClick={() => handleSelectLocation('current')}
          >
            <Check size={10} className="check-icon" />
            Current Location
            <Navigation size={10} className="nav-icon" />
          </button>
        </div>

        {savedLocationsData.locations.map((location) => (
          <div key={location.id} className="location-item-wrapper">
            <button
              className={`location-item ${isActive(location.id) ? 'active' : ''}`}
              onClick={() => handleSelectLocation(location)}
            >
              <Check size={10} className="check-icon" />
              {location.name}
            </button>
            <button
              className="remove-item"
              title="Remove location"
              aria-label="Remove location"
              onClick={() => handleRemoveLocation(location.id)}
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <a
        href="https://ko-fi.com/A487E93"
        target="_blank"
        rel="noopener noreferrer"
        className="donate"
      >
        Powered By Coffee <ExternalLink size={12} />
      </a>
    </nav>
  );
}
