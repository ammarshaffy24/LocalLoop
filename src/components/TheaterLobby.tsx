import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Volume2, VolumeX } from 'lucide-react';

interface TheaterLobbyProps {
  onEnter: (seatNumber?: number) => void;
}

const TheaterLobby: React.FC<TheaterLobbyProps> = ({ onEnter }) => {
  const [ticketTorn, setTicketTorn] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [showSeating, setShowSeating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleTicketTear = () => {
    setTicketTorn(true);
    setTimeout(() => setShowSeating(true), 1500);
  };

  const handleSeatSelect = (seatNumber: number) => {
    setSelectedSeat(seatNumber);
    setTimeout(() => onEnter(seatNumber), 1000);
  };

  const handleSkipSeating = () => {
    onEnter();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-black flex items-center justify-center relative overflow-hidden">
      {/* Ambient theater sounds */}
      {soundEnabled && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Simulated ambient sound visualization */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-2 h-2 bg-yellow-400 rounded-full opacity-30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="absolute top-3/4 right-1/3 w-1 h-1 bg-white rounded-full opacity-20"
            animate={{ scale: [1, 2, 1], opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          />
        </div>
      )}

      {/* Sound toggle */}
      <motion.button
        onClick={() => setSoundEnabled(!soundEnabled)}
        className="absolute top-8 right-8 p-3 bg-black bg-opacity-30 rounded-full text-yellow-400 hover:bg-opacity-50 transition-all"
        whileHover={{ scale: 1.1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
      </motion.button>

      {/* Chandelier */}
      <motion.div
        className="absolute top-8 left-1/2 transform -translate-x-1/2"
        animate={{ rotate: [0, 2, -2, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      >
        <div className="w-32 h-24 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full opacity-60 relative">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-8 bg-yellow-300 rounded-full"
              style={{
                left: `${20 + i * 10}%`,
                bottom: '-20px',
                transformOrigin: 'top center'
              }}
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>

      {!showSeating ? (
        /* Ticket Entry */
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.h1
            className="text-6xl font-playfair font-bold text-yellow-400 mb-8"
            animate={{ 
              textShadow: [
                '0 0 20px rgba(255, 215, 0, 0.5)',
                '0 0 40px rgba(255, 215, 0, 0.8)',
                '0 0 20px rgba(255, 215, 0, 0.5)'
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            Welcome to the Theater
          </motion.h1>

          <motion.p
            className="text-xl text-gray-300 mb-12 font-crimson italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            "Your performance begins with a single tear..."
          </motion.p>

          {!ticketTorn ? (
            <motion.div
              className="relative cursor-pointer"
              onClick={handleTicketTear}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="w-80 h-48 bg-gradient-to-r from-red-700 to-red-600 rounded-lg shadow-2xl mx-auto relative overflow-hidden"
                animate={{ rotateY: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                {/* Ticket design */}
                <div className="absolute inset-4 border-2 border-yellow-400 border-dashed rounded-lg">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <Ticket className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-playfair font-bold text-white mb-2">
                        ADMIT ONE
                      </h3>
                      <p className="text-yellow-300 font-crimson">
                        Actstraveganza Experience
                      </p>
                      <div className="mt-4 text-sm text-gray-300">
                        Click to tear and enter
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perforated edge */}
                <div className="absolute right-1/3 top-0 bottom-0 w-1 bg-yellow-400 opacity-30">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 bg-red-700 rounded-full absolute -left-1"
                      style={{ top: `${i * 8 + 4}%` }}
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-20 transition-opacity duration-300"
                style={{ transform: 'skewX(-20deg)' }}
              />
            </motion.div>
          ) : (
            /* Torn ticket animation */
            <motion.div className="relative">
              <motion.div
                className="w-80 h-48 mx-auto relative"
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                {/* Left piece */}
                <motion.div
                  className="absolute left-0 w-2/3 h-full bg-gradient-to-r from-red-700 to-red-600 rounded-l-lg shadow-2xl"
                  animate={{ x: -100, rotate: -15 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <div className="absolute inset-4 border-2 border-yellow-400 border-dashed rounded-lg">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Ticket className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                        <h3 className="text-lg font-playfair font-bold text-white">
                          ADMIT
                        </h3>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Right piece */}
                <motion.div
                  className="absolute right-0 w-1/3 h-full bg-gradient-to-r from-red-600 to-red-500 rounded-r-lg shadow-2xl"
                  animate={{ x: 100, rotate: 15 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                >
                  <div className="absolute inset-4 border-2 border-yellow-400 border-dashed rounded-lg">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <h3 className="text-lg font-playfair font-bold text-white">
                          ONE
                        </h3>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.p
                className="text-yellow-400 text-xl font-crimson italic mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                The curtain rises...
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      ) : (
        /* Seat Selection */
        <motion.div
          className="text-center max-w-4xl mx-auto px-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2
            className="text-4xl font-playfair font-bold text-yellow-400 mb-8"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            Choose Your Seat
          </motion.h2>

          <motion.p
            className="text-lg text-gray-300 mb-8 font-crimson"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Your seat will influence your theatrical perspective...
          </motion.p>

          {/* Theater seating layout */}
          <div className="mb-8">
            {/* Stage */}
            <div className="w-full h-4 bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-full mb-8 relative">
              <div className="absolute inset-0 flex items-center justify-center text-black font-bold text-sm">
                STAGE
              </div>
            </div>

            {/* Seats */}
            <div className="space-y-4">
              {[...Array(5)].map((_, row) => (
                <div key={row} className="flex justify-center gap-2">
                  {[...Array(8)].map((_, seat) => {
                    const seatNumber = row * 8 + seat + 1;
                    const isSelected = selectedSeat === seatNumber;
                    
                    return (
                      <motion.button
                        key={seatNumber}
                        onClick={() => handleSeatSelect(seatNumber)}
                        className={`w-8 h-8 rounded-t-lg transition-all duration-300 ${
                          isSelected
                            ? 'bg-yellow-400 text-black'
                            : 'bg-red-700 hover:bg-red-600 text-white'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: row * 0.1 + seat * 0.02 }}
                      >
                        {seatNumber}
                      </motion.button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <motion.button
            onClick={handleSkipSeating}
            className="text-gray-400 hover:text-white transition-colors font-crimson underline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            Skip seat selection and enter
          </motion.button>
        </motion.div>
      )}

      {/* Velvet curtains */}
      <motion.div
        className="absolute top-0 left-0 w-1/4 h-full bg-gradient-to-r from-red-900 to-red-800 z-10"
        initial={{ x: 0 }}
        animate={{ x: showSeating && selectedSeat ? '-100%' : 0 }}
        transition={{ duration: 2, ease: 'easeInOut', delay: selectedSeat ? 0.5 : 0 }}
      >
        <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-r from-yellow-600 to-yellow-500 opacity-70" />
      </motion.div>
      
      <motion.div
        className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-red-900 to-red-800 z-10"
        initial={{ x: 0 }}
        animate={{ x: showSeating && selectedSeat ? '100%' : 0 }}
        transition={{ duration: 2, ease: 'easeInOut', delay: selectedSeat ? 0.5 : 0 }}
      >
        <div className="absolute left-0 top-0 h-full w-4 bg-gradient-to-l from-yellow-600 to-yellow-500 opacity-70" />
      </motion.div>
    </div>
  );
};

export default TheaterLobby;