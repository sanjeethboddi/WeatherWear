import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { WeatherData } from '../types/weather';
import { getRecommendations } from '../services/recommendationService';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useUnits } from '../contexts/UnitContext';

interface ForecastProps {
  weather: WeatherData;
}

const Forecast: React.FC<ForecastProps> = ({ weather }) => {
  const [expandedDay, setExpandedDay] = React.useState<number | null>(null);
  const { isCelsius } = useUnits();
  
  const toggleDay = (index: number) => {
    if (expandedDay === index) {
      setExpandedDay(null);
    } else {
      setExpandedDay(index);
    }
  };
  
  const getTemperature = (tempC: number) => {
    return isCelsius ? Math.round(tempC) : Math.round((tempC * 9/5) + 32);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-10"
    >
      <h3 className="text-xl font-bold text-white mb-4">10-Day Forecast</h3>
      
      <div className="space-y-2">
        {weather.forecast.forecastday.map((day, index) => {
          const isExpanded = expandedDay === index;
          // We create a simplified weather object to pass to the recommendation service
          const simulatedWeather = {
            ...weather,
            current: {
              ...weather.current,
              temp_c: day.day.avgtemp_c,
              condition: day.day.condition,
              humidity: day.day.avghumidity,
              wind_kph: day.day.maxwind_kph,
              uv: day.day.uv
            }
          };
          
          const dayRecommendations = getRecommendations(simulatedWeather);
          
          return (
            <div key={day.date_epoch} className="overflow-hidden">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`bg-white/5 rounded-lg cursor-pointer transition-colors ${isExpanded ? 'bg-white/10' : 'hover:bg-white/8'}`}
              >
                <div 
                  className="p-4 flex items-center justify-between"
                  onClick={() => toggleDay(index)}
                >
                  <div className="flex items-center space-x-4">
                    <p className="text-white/80 w-24">
                      {index === 0 ? 'Today' : format(parseISO(day.date), 'E, MMM d')}
                    </p>
                    <img 
                      src={day.day.condition.icon} 
                      alt={day.day.condition.text} 
                      className="w-8 h-8"
                    />
                    <span className="text-white/60 text-sm hidden md:inline">
                      {day.day.condition.text}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="flex items-center md:w-36 justify-end mr-4">
                      <span className="text-white/40 text-sm mr-2 hidden md:inline">Chance of rain:</span>
                      <span className="text-white/80">{day.day.daily_chance_of_rain}%</span>
                    </div>
                    
                    <div className="flex space-x-2 md:space-x-4 mr-2">
                      <span className="text-blue-300 font-medium">{getTemperature(day.day.mintemp_c)}°</span>
                      <span className="text-white font-medium">{getTemperature(day.day.maxtemp_c)}°</span>
                    </div>
                    
                    {isExpanded ? <ChevronUp size={18} className="text-white/60" /> : <ChevronDown size={18} className="text-white/60" />}
                  </div>
                </div>
                
                {isExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <div className="border-t border-white/10 pt-4 mt-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-white/90 font-medium mb-2">Casual Attire:</h4>
                          <ul className="space-y-1 pl-4">
                            {dayRecommendations.attire.informal.slice(0, 4).map((item, i) => (
                              <li key={i} className="text-white/70 text-sm list-disc">{item}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-white/90 font-medium mb-2">Formal Attire:</h4>
                          <ul className="space-y-1 pl-4">
                            {dayRecommendations.attire.formal.slice(0, 4).map((item, i) => (
                              <li key={i} className="text-white/70 text-sm list-disc">{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-white/90 font-medium mb-2">Items to Carry:</h4>
                        <div className="flex flex-wrap gap-2">
                          {dayRecommendations.items.map((item, i) => (
                            <span key={i} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Forecast;