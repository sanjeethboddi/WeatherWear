import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import UnitToggle from './UnitToggle';

interface HeaderProps {
  location: string;
  onLocationChange: (location: string) => void;
  weatherIcon: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ location, onLocationChange, weatherIcon }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onLocationChange(searchInput);
      setSearchInput('');
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <motion.div 
          className="flex items-center mb-4 md:mb-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="mr-3">
            {weatherIcon}
          </div>
          <h1 className="text-2xl font-semibold text-white">Attire Weather</h1>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <UnitToggle />
          <form onSubmit={handleSubmit} className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search location..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 pr-4 py-2 w-full md:w-64 rounded-full bg-white/20 backdrop-blur-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
              />
              <button 
                type="submit" 
                className="absolute left-0 top-0 h-full flex items-center justify-center w-10 text-white/70"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="text-center md:text-left">
        <motion.h2 
          className="text-3xl md:text-4xl font-bold text-white mb-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {location}
        </motion.h2>
      </div>
    </motion.header>
  );
};

export default Header;