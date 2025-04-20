import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import CurrentWeather from './components/CurrentWeather';
import Recommendations from './components/Recommendations';
import Timeline from './components/Timeline';
import Forecast from './components/Forecast';
import { fetchWeatherData } from './services/weatherService';
import { WeatherData } from './types/weather';
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun } from 'lucide-react';
import Loading from './components/Loading';
import { setCoordinatesForLocation } from './services/weatherService';
import { Location } from './types/weather';

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location>({
                id: 0, 
                name: 'Malvern', 
                latitude: 0, 
                longitude: 0,
                country: 'US',
                admin1: 'Pennsylvania'
              });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);

  // Get user's current location name, latitude, and longitude
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        if (!navigator.geolocation) {
          console.log('Geolocation is not supported by your browser');
          setGeolocationError('Geolocation is not supported by your browser. Using default location: New York');
          return;
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            resolve,
            (error) => {
              console.log('Geolocation error:', error);
              let errorMessage = 'Unable to get your location. ';
              
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage += 'Please enable location access in your browser settings.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage += 'Location information is unavailable. Please check your device settings.';
                  break;
                case error.TIMEOUT:
                  errorMessage += 'Location request timed out. Please try again.';
                  break;
                default:
                  errorMessage += 'An unknown error occurred.';
                  break;
              }
              reject(error);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0
            }
          );
        });

        // Todo: fetch location name using reverse geocoding
        console.log('current location', position.coords.latitude, position.coords.longitude);
        setLocation({
          id: 0, 
          name: 'Current Location',
          latitude: position.coords.latitude, 
          longitude: position.coords.longitude,
          country: '',
          admin1: ''
        });
        setGeolocationError(null); // Clear any previous geolocation errors
        
      } catch (error) {
        console.log('Error getting location:', error);
        setGeolocationError('Failed to get your location. Using default location');
      }
    };

    getCurrentLocation();
  }, []);

  // First useEffect to handle coordinate fetching
  useEffect(() => {
    const fetchCoordinates = async () => {
      if (!location.latitude || !location.longitude) {
        try {
          await setCoordinatesForLocation(location, setLocation);
        } catch (err) {
          console.error('Error fetching coordinates:', err);
          setError('Could not fetch location coordinates.');
        }
      }
    };

    fetchCoordinates();
  }, [location.name]); // Only run when location name changes

  // Second useEffect to fetch weather data after coordinates are set
  useEffect(() => {
    const getWeather = async () => {
      if (!location.latitude || !location.longitude) return; // Don't fetch if no coordinates

      try {
        setLoading(true);
        setError(null);
        const data = await fetchWeatherData(location);
        setWeather(data);
      } catch (err) {
        console.error('Weather fetch error:', err);
        setError('Could not fetch weather data. Please try again.');
        setWeather(null);
      } finally {
        setLoading(false);
      }
    };

    getWeather();
  }, [location.latitude, location.longitude]); // Only run when coordinates change

  const handleLocationChange = (newLocation: Location) => {
    if (newLocation.name.trim()) {
      setLocation(newLocation);
    }
  };

  const getBackgroundColor = () => {
    if (!weather) return 'bg-gradient-to-br from-blue-400 to-blue-600';
    
    const condition = weather.current.condition.text.toLowerCase();
    const isDay = weather.current.is_day === 1;
    
    if (condition.includes('sun') || condition.includes('clear')) {
      return isDay 
        ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
        : 'bg-gradient-to-br from-indigo-900 to-purple-900';
    } else if (condition.includes('cloud')) {
      return isDay 
        ? 'bg-gradient-to-br from-blue-300 to-blue-500' 
        : 'bg-gradient-to-br from-gray-700 to-gray-900';
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return isDay 
        ? 'bg-gradient-to-br from-gray-400 to-gray-600' 
        : 'bg-gradient-to-br from-gray-800 to-gray-900';
    } else if (condition.includes('snow')) {
      return 'bg-gradient-to-br from-blue-100 to-blue-300';
    } else if (condition.includes('fog') || condition.includes('mist')) {
      return 'bg-gradient-to-br from-gray-300 to-gray-500';
    } else if (condition.includes('thunder') || condition.includes('lightning')) {
      return 'bg-gradient-to-br from-gray-700 to-gray-900';
    }
    
    return 'bg-gradient-to-br from-blue-400 to-blue-600';
  };

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="text-yellow-400" size={28} />;

    const condition = weather.current.condition.text.toLowerCase();
    
    if (condition.includes('sun') || condition.includes('clear')) {
      return <Sun className="text-yellow-400" size={28} />;
    } else if (condition.includes('cloud') && !condition.includes('rain')) {
      return <Cloud className="text-gray-200" size={28} />;
    } else if (condition.includes('rain') || condition.includes('drizzle')) {
      return <CloudRain className="text-blue-300" size={28} />;
    } else if (condition.includes('snow')) {
      return <CloudSnow className="text-white" size={28} />;
    } else if (condition.includes('fog') || condition.includes('mist')) {
      return <CloudFog className="text-gray-300" size={28} />;
    } else if (condition.includes('thunder') || condition.includes('lightning')) {
      return <CloudLightning className="text-yellow-300" size={28} />;
    } else if (condition.includes('drizzle')) {
      return <CloudDrizzle className="text-blue-300" size={28} />;
    }
    
    return <Sun className="text-yellow-400" size={28} />;
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBackgroundColor()}`}>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Header 
          location={location} 
          onLocationChange={handleLocationChange} 
          weatherIcon={getWeatherIcon()} 
        />
        
        {geolocationError && (
          <div className="bg-yellow-500/20 text-yellow-200 p-4 rounded-lg mb-4">
            <p className="text-sm">{geolocationError}</p>
          </div>
        )}
        
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-white text-lg">{error}</p>
          </div>
        ) : weather ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <CurrentWeather weather={weather} />
            <Recommendations weather={weather} />
            <Timeline weather={weather} />
            <Forecast weather={weather} />
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}

export default App;