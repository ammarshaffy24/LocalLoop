import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[1000]">
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg transition-all duration-300 ease-out hover:scale-110 hover:shadow-xl btn-hover"
      >
        <Plus className="h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:rotate-90" />
        
        {/* Ripple effect */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 bg-emerald-500/20 ${isHovered ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`} />

        {/* Tooltip - Only show on desktop */}
        <div className={`hidden sm:block absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap transition-all duration-200 pointer-events-none ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'}`}>
          Drop a Tip
          <div className="absolute top-1/2 left-full w-0 h-0 border-l-4 border-r-0 border-t-4 border-b-4 border-transparent border-l-gray-900 -translate-y-1/2" />
        </div>
      </button>

      {/* Mobile label - Show on tap/touch */}
      <div className="sm:hidden absolute bottom-full mb-3 left-1/2 transform -translate-x-1/2 px-3 py-2 bg-white/90 backdrop-blur-sm text-gray-800 text-sm rounded-lg whitespace-nowrap transition-all duration-200 pointer-events-none border border-gray-200 opacity-0">
        Drop a Tip
        <div className="absolute top-full left-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-b-0 border-transparent border-t-white/90 -translate-x-1/2" />
      </div>
    </div>
  );
};

export default FloatingButton;