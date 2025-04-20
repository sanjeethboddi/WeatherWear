import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { WeatherData } from '../types/weather';
import { getRecommendations } from '../services/recommendationService';
import { Shirt as TShirt, Briefcase, Umbrella, Droplets } from 'lucide-react';

interface RecommendationsProps {
  weather: WeatherData;
}

const Recommendations: React.FC<RecommendationsProps> = ({ weather }) => {
  const [attireType, setAttireType] = useState<'formal' | 'informal'>('informal');
  const recommendations = getRecommendations(weather);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Today's Recommendations</h3>
        
        <div className="flex bg-white/5 rounded-lg p-1">
          <button
            onClick={() => setAttireType('informal')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${
              attireType === 'informal' 
                ? 'bg-white/15 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <TShirt size={16} className="mr-1" />
              <span>Casual</span>
            </div>
          </button>
          <button
            onClick={() => setAttireType('formal')}
            className={`px-3 py-1 rounded-md text-sm transition-all ${
              attireType === 'formal' 
                ? 'bg-white/15 text-white' 
                : 'text-white/60 hover:text-white'
            }`}
          >
            <div className="flex items-center">
              <Briefcase size={16} className="mr-1" />
              <span>Formal</span>
            </div>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          className="bg-white/5 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center mb-3">
            {attireType === 'formal' ? (
              <Briefcase className="mr-2 text-amber-300" size={20} />
            ) : (
              <TShirt className="mr-2 text-green-300" size={20} />
            )}
            <h4 className="font-medium text-white">What to Wear</h4>
          </div>
          
          <ul className="space-y-2">
            {recommendations.attire[attireType].map((item, index) => (
              <li key={index} className="text-white/80 text-sm flex items-start">
                <span className="mr-2 text-white/40">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div 
          className="bg-white/5 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center mb-3">
            <Umbrella className="mr-2 text-blue-300" size={20} />
            <h4 className="font-medium text-white">What to Carry</h4>
          </div>
          
          <ul className="space-y-2">
            {recommendations.items.map((item, index) => (
              <li key={index} className="text-white/80 text-sm flex items-start">
                <span className="mr-2 text-white/40">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
        
        <motion.div 
          className="bg-white/5 rounded-lg p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center mb-3">
            <Droplets className="mr-2 text-pink-300" size={20} />
            <h4 className="font-medium text-white">Skincare</h4>
          </div>
          
          <ul className="space-y-2">
            {recommendations.skincare.map((item, index) => (
              <li key={index} className="text-white/80 text-sm flex items-start">
                <span className="mr-2 text-white/40">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Recommendations;