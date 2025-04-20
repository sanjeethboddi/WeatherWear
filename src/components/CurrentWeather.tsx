import React from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { WeatherData } from '../types/weather';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import { useUnits } from '../contexts/UnitContext';

interface CurrentWeatherProps {
  weather: WeatherData;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weather }) => {
  const { current, location } = weather;
  const { isCelsius, isKilometers } = useUnits();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 overflow-hidden relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <p className="text-white/70 mb-1">
            {format(new Date(location.localtime), 'EEEE, MMMM d • h:mm a')}
          </p>
          <h3 className="text-5xl font-bold text-white mb-2">
            {Math.round(isCelsius ? current.temp_c : current.temp_f)}°{isCelsius ? 'C' : 'F'}
          </h3>
          <div className="flex items-center justify-center md:justify-start">
            <img 
              src={current.condition.icon.replace('64x64', '128x128')} 
              alt={current.condition.text}
              className="w-12 h-12 mr-2"
            />
            <p className="text-xl text-white/90">{current.condition.text}</p>
          </div>
          <p className="text-white/70 mt-2">
            Feels like {Math.round(isCelsius ? current.feelslike_c : current.feelslike_f)}°{isCelsius ? 'C' : 'F'}
          </p>
        </div>
        
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-4"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          <motion.div 
            className="flex items-center text-white p-3 bg-white/5 rounded-lg"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <Wind className="mr-2 text-sky-300" size={20} />
            <div>
              <p className="text-sm text-white/60">Wind</p>
              <p className="font-medium">
                {Math.round(isKilometers ? current.wind_kph : current.wind_mph)} {isKilometers ? 'km/h' : 'mph'}
              </p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center text-white p-3 bg-white/5 rounded-lg"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <Droplets className="mr-2 text-blue-300" size={20} />
            <div>
              <p className="text-sm text-white/60">Humidity</p>
              <p className="font-medium">{current.humidity}%</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-center text-white p-3 bg-white/5 rounded-lg col-span-2 md:col-span-1"
            variants={{
              hidden: { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0 }
            }}
          >
            <Thermometer className="mr-2 text-red-300" size={20} />
            <div>
              <p className="text-sm text-white/60">UV Index</p>
              <p className="font-medium">{current.uv} {getUVIndexText(current.uv)}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const getUVIndexText = (uv: number): string => {
  if (uv <= 2) return '(Low)';
  if (uv <= 5) return '(Moderate)';
  if (uv <= 7) return '(High)';
  if (uv <= 10) return '(Very High)';
  return '(Extreme)';
};

export default CurrentWeather;