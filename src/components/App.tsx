import { useState, useCallback, useEffect, useRef } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import { useWeather } from '../hooks/useWeather';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useGeolocation } from '../hooks/useGeolocation';
import { reverseGeocode } from '../services/geocodeApi';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';
import Sidebar from './Sidebar';
import WeatherBackground from './WeatherBackground';
import WeatherDisplay from './WeatherDisplay';
import HourlyScroller from './HourlyScroller';
import type {
  SavedLocationsData,
  SavedLocation,
  TempFormat,
  TimeFormat,
  StatKey,
} from '../types/weather';

const DEFAULT_LOCATIONS: SavedLocationsData = {
  useCurrent: false,
  activeLocation: '1',
  locations: [
    {
      id: '1',
      name: 'New York City',
      longitude: -74.00597,
      latitude: 40.71427,
    },
  ],
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scrollIndex, setScrollIndex] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [locationName, setLocationName] = useState('');
  const [selectedStat, setSelectedStat] =
    useState<StatKey>('precipProbability');

  const [tempFormat, setTempFormat] = useLocalStorage<TempFormat>(
    'tempFormat',
    'f',
  );
  const [timeFormat, setTimeFormat] = useLocalStorage<TimeFormat>(
    'timeFormat',
    '24',
  );
  const [savedLocationsData, setSavedLocationsData] =
    useLocalStorage<SavedLocationsData>('savedLocations', DEFAULT_LOCATIONS);

  const [coords, setCoords] = useState(() => {
    if (!savedLocationsData.useCurrent && savedLocationsData.activeLocation) {
      const loc = savedLocationsData.locations.find(
        (l) => l.id === savedLocationsData.activeLocation,
      );
      if (loc) return { latitude: loc.latitude, longitude: loc.longitude };
    }
    return { latitude: 40.71427, longitude: -74.00597 };
  });

  const geolocation = useGeolocation();
  const {
    data: weather,
    isLoading,
    error,
    refetch,
  } = useWeather(coords.latitude, coords.longitude);

  // Fetch location name when coords change
  useEffect(() => {
    reverseGeocode(coords.latitude, coords.longitude)
      .then(setLocationName)
      .catch(() => setLocationName(''));
  }, [coords.latitude, coords.longitude]);

  // Handle geolocation result
  useEffect(() => {
    if (geolocation.latitude && geolocation.longitude) {
      setCoords({
        latitude: geolocation.latitude,
        longitude: geolocation.longitude,
      });
    }
    if (geolocation.error) {
      setErrorMessage(geolocation.error);
    }
  }, [geolocation.latitude, geolocation.longitude, geolocation.error]);

  const handleSelectLocation = useCallback(
    (location: SavedLocation | 'current') => {
      setSidebarOpen(false);
      if (location === 'current') {
        geolocation.requestLocation();
      } else {
        setCoords({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      }
    },
    [geolocation],
  );

  const handleScrollUpdate = useCallback((index: number, percent: number) => {
    setScrollIndex(index);
    setScrollPercent(percent);
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const refreshDoneRef = useRef(false);
  const refreshTimerRef = useRef(false);

  const handleRefresh = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    refreshDoneRef.current = false;
    refreshTimerRef.current = false;

    const checkDone = () => {
      if (refreshDoneRef.current && refreshTimerRef.current) {
        setRefreshing(false);
      }
    };

    setTimeout(() => {
      refreshTimerRef.current = true;
      checkDone();
    }, 500);

    try {
      await refetch();
    } finally {
      refreshDoneRef.current = true;
      checkDone();
    }
  }, [refetch, refreshing]);

  // Determine weather icon and wind gust for background based on current scroll position
  const weatherIcon =
    weather &&
    (scrollPercent < 0.3
      ? weather.currently.icon
      : (weather.hourly.data[scrollIndex]?.icon ?? weather.currently.icon));

  const windGust =
    weather &&
    (scrollPercent < 0.3
      ? weather.currently.windGust
      : (weather.hourly.data[scrollIndex]?.windGust ??
        weather.currently.windGust));

  return (
    <>
      {weatherIcon ? (
        <WeatherBackground icon={weatherIcon} windGust={windGust ?? 0} />
      ) : (
        <div className="weather-bg" />
      )}
      <ErrorAlert
        message={
          errorMessage || (error ? 'Failed to fetch weather data' : null)
        }
        onDismiss={() => setErrorMessage(null)}
      />
      <LoadingSpinner visible={isLoading || geolocation.loading} />

      <header className="top-bar">
        <button
          className="btn sidebar-toggle"
          aria-label="Toggle sidebar"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {sidebarOpen ? <X size={16} /> : <Search size={16} />}
        </button>

        <span
          className="location-name"
          onClick={() => setSidebarOpen((prev) => !prev)}
        >
          {locationName}
        </span>

        <button
          className={`btn refresh${refreshing ? ' spinning' : ''}`}
          aria-label="Refresh content"
          onClick={handleRefresh}
        >
          <RefreshCw size={16} />
        </button>
      </header>

      <Sidebar
        isOpen={sidebarOpen}
        timeFormat={timeFormat}
        onTimeFormatChange={setTimeFormat}
        savedLocationsData={savedLocationsData}
        onSavedLocationsChange={setSavedLocationsData}
        onSelectLocation={handleSelectLocation}
        onError={setErrorMessage}
      />

      <main id="content">
        {weather && (
          <WeatherDisplay
            weather={weather}
            scrollIndex={scrollIndex}
            scrollPercent={scrollPercent}
            tempFormat={tempFormat}
            timeFormat={timeFormat}
            onTempFormatChange={setTempFormat}
            selectedStat={selectedStat}
            onSelectedStatChange={setSelectedStat}
          >
            <HourlyScroller
              weather={weather}
              timeFormat={timeFormat}
              selectedStat={selectedStat}
              onScrollUpdate={handleScrollUpdate}
            />
          </WeatherDisplay>
        )}
      </main>
    </>
  );
}
