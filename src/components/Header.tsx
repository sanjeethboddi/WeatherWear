import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import UnitToggle from './UnitToggle';
import {Location} from '../types/weather';
import { set } from 'date-fns';

interface HeaderProps {
  location: Location;
  onLocationChange: (location: Location) => void;
  weatherIcon: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ location, onLocationChange, weatherIcon }) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  useEffect(() => {
    const searchLocations = async () => {
      if (searchInput.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchInput)}&count=5&language=en&format=json`
        );
        const data = await response.json();
        setSearchResults(data.results || []);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(searchLocations, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: Location) => {
    setSearchInput('');
    setSearchResults([]);
    setIsDropdownOpen(false);
    // Format the location as "City, Country" for consistency

    onLocationChange({
                  ...location, 
                  name: location.name,
                  admin1: location.admin1,
                  country: location.country
                });

  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      // If the input doesn't contain a comma, try to find a matching location
      if (!searchInput.includes(',')) {
        const matchingLocation = searchResults[0];
        if (matchingLocation) {
          handleLocationSelect(matchingLocation);
          return;
        }
      }
      // Otherwise, use the input as is
      onLocationChange(searchInput);
      setSearchInput('');
      setSearchResults([]);
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
          <h1 className="text-2xl font-semibold text-white">Weather Wear</h1>
        </motion.div>
        
        <div className="flex items-center space-x-4">
          <UnitToggle />
          <form onSubmit={handleSubmit} className="w-full md:w-auto relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search location..."
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setIsDropdownOpen(true);
                }}
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
            
            {isDropdownOpen && searchResults.length > 0 && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white/20 backdrop-blur-lg rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                {isLoading ? (
                  <div className="p-2 text-white/70 text-center">Loading...</div>
                ) : (
                  searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleLocationSelect(result)}
                      className="w-full text-left px-4 py-2 hover:bg-white/10 text-white/90 transition-colors"
                    >
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-white/60">
                        {result.admin1 ? `${result.admin1}, ` : ''}{result.country}
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
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
          {location.name || 'Current Location'}{location.admin1 ? `, ${location.admin1}` : ''}{location.country ? `, ${location.country}` : ''}
        </motion.h2>
      </div>
    </motion.header>
  );
};

export default Header;