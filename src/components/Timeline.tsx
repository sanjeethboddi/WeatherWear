import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { WeatherData } from '../types/weather';
import { useUnits } from '../contexts/UnitContext';

interface TimelineProps {
  weather: WeatherData;
}

const Timeline: React.FC<TimelineProps> = ({ weather }) => {
  const currentHour = new Date().getHours();
  const today = weather.forecast.forecastday[0];
  const { isCelsius } = useUnits();

  
  // Get hours from now until the end of the day
  const hourlyForecast = today.hour.filter(hour => {
    if (!hour?.time) return false;
    try {
      // Parse the ISO date string and get the hour
      const date = new Date(hour.time);
      const hourTime = date.getHours();
      return hourTime >= currentHour;
    } catch (error) {
      console.error('Error parsing hour time:', hour?.time, error);
      return false;
    }
  });
  
  // If we have less than 8 hours left today, add some hours from tomorrow
  let extraHours: any[] = [];
  if (hourlyForecast.length < 8 && weather.forecast.forecastday.length > 1) {
    const tomorrow = weather.forecast.forecastday[1];
    const hoursNeeded = 8 - hourlyForecast.length;
    extraHours = tomorrow.hour.slice(0, hoursNeeded);
  }
  
  const combinedHours = [...hourlyForecast, ...extraHours].slice(0, 8);

  const getTemperature = (tempC: number) => {
    return isCelsius ? Math.round(tempC) : Math.round((tempC * 9/5) + 32);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
    >
      <h3 className="text-xl font-bold text-white mb-4">Today's Timeline</h3>
      
      <div className="flex overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
        <div className="flex space-x-4">
          {combinedHours.map((hour, index) => (
            <motion.div 
              key={hour?.time_epoch || index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex flex-col items-center min-w-[4.5rem] bg-white/5 rounded-lg p-3"
            >
              <p className="text-white/80 text-sm mb-2">
                {hour?.time ? format(parseISO(hour.time), 'h a') : '--'}
              </p>
              <img 
                src={hour?.condition?.icon} 
                alt={hour?.condition?.text || 'weather'} 
                className="w-8 h-8 my-1"
                title={hour?.condition?.text}
              />
              <p className="text-white font-medium mt-1">{getTemperature(hour?.temp_c || 0)}°</p>
              <p className="text-white/60 text-xs mt-1">{hour?.chance_of_rain || 0}%</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Timeline;