import React from 'react';

interface Props {
  message?: string;
}

export const LoadingOverlay: React.FC<Props> = ({ message = "Thinking..." }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
      <p className="font-medium text-lg animate-pulse">{message}</p>
    </div>
  );
};