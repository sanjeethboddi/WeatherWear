import React from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="h-4 w-4 bg-white rounded-full"
            animate={{
              y: [0, -16, 0],
              opacity: [1, 0.5, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.2,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
      <motion.p 
        className="text-white/80 mt-4 text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Fetching weather data...
      </motion.p>
    </div>
  );
};

export default Loading;