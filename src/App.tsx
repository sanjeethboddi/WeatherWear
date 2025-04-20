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

function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<string>('New York');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getWeather = async () => {
      try {
        setLoading(true);
        const data = await fetchWeatherData(location);
        setWeather(data);
        setError(null);
      } catch (err) {
        setError('Could not fetch weather data. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getWeather();
  }, [location]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
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