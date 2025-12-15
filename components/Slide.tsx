import React from 'react';
import { SlideData } from '../types';
import { motion } from 'framer-motion';

interface SlideProps {
  data: SlideData;
}

export const Slide: React.FC<SlideProps> = ({ data }) => {
  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden shadow-2xl">
      {/* Visual Side */}
      <div className={`w-full md:w-1/2 h-64 md:h-full relative ${data.themeColor}`}>
        <img 
            src={data.imageUrl} 
            alt={data.title} 
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        <div className="relative z-10 p-8 h-full flex flex-col justify-center text-white">
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold mb-4 leading-tight shadow-black drop-shadow-md"
            >
                {data.title}
            </motion.h1>
            {data.subtitle && (
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-2xl md:text-3xl font-medium opacity-90"
                >
                    {data.subtitle}
                </motion.h2>
            )}
        </div>
      </div>

      {/* Content Side */}
      <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
        <ul className="space-y-6">
            {data.content.map((point, index) => (
                <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + (index * 0.2) }}
                    className="flex items-start gap-4"
                >
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full ${data.themeColor} text-white flex items-center justify-center font-bold text-lg mt-1`}>
                        {index + 1}
                    </span>
                    <span className="text-2xl md:text-3xl text-gray-700 font-medium leading-relaxed">
                        {point}
                    </span>
                </motion.li>
            ))}
        </ul>
      </div>
    </div>
  );
};