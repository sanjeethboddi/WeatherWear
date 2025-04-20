import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';
import { WeatherData } from '../types/weather';

interface AstronomyProps {
  weather: WeatherData;
}

const Astronomy: React.FC<AstronomyProps> = ({ weather }) => {
  const today = weather.forecast.forecastday[0];
  const uvIndex = weather.current.uv;
  
  const getUVIndexLevel = (uv: number) => {
    if (uv <= 2) return { level: 'Low', color: 'text-green-500' };
    if (uv <= 5) return { level: 'Moderate', color: 'text-yellow-500' };
    if (uv <= 7) return { level: 'High', color: 'text-orange-500' };
    if (uv <= 10) return { level: 'Very High', color: 'text-red-500' };
    return { level: 'Extreme', color: 'text-purple-500' };
  };

  const uvLevel = getUVIndexLevel(uvIndex);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Astronomy & UV Index</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Sun Times */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sunrise className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/60 text-sm">Sunrise</p>
              <p className="text-white font-medium">{today.astro.sunrise}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Sunset className="text-orange-400" size={24} />
            <div>
              <p className="text-white/60 text-sm">Sunset</p>
              <p className="text-white font-medium">{today.astro.sunset}</p>
            </div>
          </div>
        </div>

        {/* UV Index */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Sun className="text-yellow-400" size={24} />
            <div>
              <p className="text-white/60 text-sm">UV Index</p>
              <p className={`${uvLevel.color} font-medium`}>
                {uvIndex} - {uvLevel.level}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Moon className="text-blue-400" size={24} />
            <div>
              <p className="text-white/60 text-sm">Moon Phase</p>
              <p className="text-white font-medium">{today.astro.moon_phase}</p>
            </div>
          </div>
        </div>
      </div>

      {/* UV Index Description */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-white/80 text-sm">
          {uvIndex <= 2 && "Low UV index. Minimal sun protection required."}
          {uvIndex > 2 && uvIndex <= 5 && "Moderate UV index. Take precautions - wear sunscreen."}
          {uvIndex > 5 && uvIndex <= 7 && "High UV index. Protection essential - reduce time in the sun."}
          {uvIndex > 7 && uvIndex <= 10 && "Very High UV index. Take extra precautions - avoid midday sun."}
          {uvIndex > 10 && "Extreme UV index. Take all precautions - avoid sun exposure."}
        </p>
      </div>
    </motion.div>
  );
};

export default Astronomy; 