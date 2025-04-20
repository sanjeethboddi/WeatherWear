import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UnitContextType {
  isCelsius: boolean;
  isKilometers: boolean;
  toggleTemperature: () => void;
  toggleDistance: () => void;
}

const UnitContext = createContext<UnitContextType | undefined>(undefined);

export const UnitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isCelsius, setIsCelsius] = useState(false);
  const [isKilometers, setIsKilometers] = useState(false);

  const toggleTemperature = () => setIsCelsius(!isCelsius);
  const toggleDistance = () => setIsKilometers(!isKilometers);

  return (
    <UnitContext.Provider value={{ isCelsius, isKilometers, toggleTemperature, toggleDistance }}>
      {children}
    </UnitContext.Provider>
  );
};

export const useUnits = () => {
  const context = useContext(UnitContext);
  if (context === undefined) {
    throw new Error('useUnits must be used within a UnitProvider');
  }
  return context;
};