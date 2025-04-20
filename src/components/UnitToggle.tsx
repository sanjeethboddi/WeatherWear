import React from 'react';
import { motion } from 'framer-motion';
import { useUnits } from '../contexts/UnitContext';
import { Thermometer, Compass } from 'lucide-react';

const UnitToggle: React.FC = () => {
  const { isCelsius, isKilometers, toggleTemperature, toggleDistance } = useUnits();

  return (
    <div className="flex space-x-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTemperature}
        className="flex items-center px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
        title="Toggle temperature unit"
      >
        <Thermometer size={16} className="mr-2 text-red-300" />
        <span className="text-white/90 text-sm font-medium">
          {isCelsius ? '°C' : '°F'}
        </span>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDistance}
        className="flex items-center px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors"
        title="Toggle distance unit"
      >
        <Compass size={16} className="mr-2 text-blue-300" />
        <span className="text-white/90 text-sm font-medium">
          {isKilometers ? 'km/h' : 'mph'}
        </span>
      </motion.button>
    </div>
  );
};

export default UnitToggle;