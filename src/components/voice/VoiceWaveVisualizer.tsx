'use client';

import React, { useEffect, useState } from 'react';

interface VoiceWaveVisualizerProps {
  isActive: boolean;
  color?: 'emerald' | 'cyan' | 'purple' | 'rose';
  mode?: 'listening' | 'speaking';
}

export const VoiceWaveVisualizer: React.FC<VoiceWaveVisualizerProps> = ({
  isActive,
  color = 'emerald',
  mode = 'listening',
}) => {
  const [bars, setBars] = useState<number[]>([20, 45, 75, 30, 90, 60, 40, 85, 55, 30, 70, 40]);

  useEffect(() => {
    if (!isActive) {
      setBars([15, 20, 15, 25, 20, 15, 20, 15, 25, 20, 15, 20]);
      return;
    }

    const interval = setInterval(() => {
      setBars(prev =>
        prev.map(() => {
          const min = mode === 'speaking' ? 30 : 20;
          const max = mode === 'speaking' ? 95 : 85;
          return Math.floor(Math.random() * (max - min + 1)) + min;
        })
      );
    }, 110);

    return () => clearInterval(interval);
  }, [isActive, mode]);

  const getColorClass = () => {
    switch (color) {
      case 'cyan':
        return 'bg-gradient-to-t from-cyan-500 to-blue-500 shadow-cyan-500/50';
      case 'purple':
        return 'bg-gradient-to-t from-purple-500 to-indigo-500 shadow-purple-500/50';
      case 'rose':
        return 'bg-gradient-to-t from-rose-500 to-amber-500 shadow-rose-500/50';
      default:
        return 'bg-gradient-to-t from-emerald-500 to-teal-400 shadow-emerald-500/50';
    }
  };

  return (
    <div className="flex items-center justify-center gap-1.5 h-16 px-4 py-2">
      {bars.map((height, idx) => (
        <div
          key={idx}
          className={`w-1.5 rounded-full transition-all duration-150 ease-out shadow-sm ${getColorClass()}`}
          style={{
            height: `${height}%`,
            opacity: isActive ? 0.9 : 0.25,
            transform: isActive ? 'scaleY(1)' : 'scaleY(0.4)',
          }}
        />
      ))}
    </div>
  );
};
