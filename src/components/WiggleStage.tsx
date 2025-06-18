import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface WiggleStageProps {
  onExit: () => void;
}

const WiggleStage: React.FC<WiggleStageProps> = ({ onExit }) => {
  const [wiggleIntensity, setWiggleIntensity] = useState(0);
  const [exploded, setExploded] = useState(false);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const shakeCount = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = Math.abs(e.clientX - lastMousePos.current.x);
      const deltaY = Math.abs(e.clientY - lastMousePos.current.y);
      const movement = deltaX + deltaY;

      if (movement > 20) {
        shakeCount.current += 1;
        setWiggleIntensity(prev => Math.min(prev + movement * 0.1, 100));
        
        if (shakeCount.current > 50) {
          setExploded(true);
          setTimeout(() => {
            onExit();
          }, 3000);
        }
      }

      lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);

    // Start music effect
    setMusicPlaying(true);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [onExit]);

  // Decay wiggle intensity over time
  useEffect(() => {
    const interval = setInterval(() => {
      setWiggleIntensity(prev => Math.max(prev - 2, 0));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden cursor-none"
    >
      {/* Spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
        }}
        animate={{
          background: [
            'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
            'radial-gradient(circle at 50% 50%, rgba(255, 255, 0, 0.4) 0%, transparent 40%)',
            'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 40%)',
          ],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />

      {/* Exit button */}
      <motion.button
        onClick={onExit}
        className="absolute top-8 right-8 z-50 p-3 bg-red-600 rounded-full text-white hover:bg-red-500 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <X className="w-6 h-6" />
      </motion.button>

      {/* Instructions */}
      <motion.div
        className="absolute top-8 left-8 text-white text-lg font-crimson z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Shake your mouse to make the puppet dance!</p>
        <p className="text-sm text-gray-400 mt-2">Warning: Too much shaking causes explosion! 💥</p>
      </motion.div>

      <AnimatePresence>
        {!exploded ? (
          /* Sock Puppet */
          <motion.div
            className="relative"
            animate={{
              rotate: [-10 + wiggleIntensity * 0.5, 10 + wiggleIntensity * 0.5],
              scale: [1, 1 + wiggleIntensity * 0.01],
              x: [-wiggleIntensity * 0.3, wiggleIntensity * 0.3],
              y: [-wiggleIntensity * 0.2, wiggleIntensity * 0.2],
            }}
            transition={{ 
              duration: 0.1 + wiggleIntensity * 0.005,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
          >
            {/* Puppet body */}
            <div className="relative w-32 h-48 bg-gradient-to-b from-purple-600 to-purple-800 rounded-t-full rounded-b-lg shadow-2xl">
              {/* Eyes */}
              <motion.div
                className="absolute top-8 left-6 w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, wiggleIntensity * 2, 0],
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
              >
                <div className="w-4 h-4 bg-black rounded-full m-1 relative">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-0.5 left-0.5" />
                </div>
              </motion.div>
              
              <motion.div
                className="absolute top-8 right-6 w-6 h-6 bg-white rounded-full shadow-lg"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -wiggleIntensity * 2, 0],
                }}
                transition={{ duration: 0.3, repeat: Infinity, delay: 0.1 }}
              >
                <div className="w-4 h-4 bg-black rounded-full m-1 relative">
                  <div className="w-2 h-2 bg-white rounded-full absolute top-0.5 left-0.5" />
                </div>
              </motion.div>

              {/* Mouth */}
              <motion.div
                className="absolute top-20 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-red-600 rounded-full"
                animate={{
                  scaleY: [1, 1 + wiggleIntensity * 0.02, 1],
                  scaleX: [1, 1 + wiggleIntensity * 0.01, 1],
                }}
                transition={{ duration: 0.2, repeat: Infinity }}
              />

              {/* Arms */}
              <motion.div
                className="absolute top-16 -left-8 w-16 h-4 bg-purple-700 rounded-full origin-right"
                animate={{
                  rotate: [-30 - wiggleIntensity * 0.5, 30 + wiggleIntensity * 0.5],
                }}
                transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }}
              />
              
              <motion.div
                className="absolute top-16 -right-8 w-16 h-4 bg-purple-700 rounded-full origin-left"
                animate={{
                  rotate: [30 + wiggleIntensity * 0.5, -30 - wiggleIntensity * 0.5],
                }}
                transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }}
              />

              {/* Decorative stripes */}
              <div className="absolute top-32 left-0 right-0 h-2 bg-yellow-400 opacity-70" />
              <div className="absolute top-36 left-0 right-0 h-2 bg-pink-400 opacity-70" />
            </div>

            {/* Shadow */}
            <motion.div
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-black opacity-30 rounded-full blur-lg"
              animate={{
                scaleX: [1, 1 + wiggleIntensity * 0.02, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 0.3, repeat: Infinity }}
            />
          </motion.div>
        ) : (
          /* Explosion Effect */
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Glitter explosion */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB'][i % 5],
                }}
                initial={{
                  x: 0,
                  y: 0,
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  x: (Math.random() - 0.5) * 800,
                  y: (Math.random() - 0.5) * 600,
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2,
                  ease: 'easeOut',
                  delay: i * 0.05,
                }}
              />
            ))}
            
            {/* Explosion text */}
            <motion.div
              className="text-8xl font-bold text-yellow-400 z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1.5, 1],
                opacity: [0, 1, 1],
                rotate: [0, 10, -10, 0],
              }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              💥 BOOM! 💥
            </motion.div>

            {/* Curtain fall */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-full bg-red-900"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              transition={{ delay: 2, duration: 1, ease: 'easeInOut' }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-yellow-600 to-yellow-500 opacity-70" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl font-playfair text-yellow-400 text-center">
                <p>The End.</p>
                <p className="text-2xl mt-4 text-gray-300">You broke the puppet! 🎭</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wiggle intensity indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
        <div className="bg-black bg-opacity-50 rounded-lg p-4">
          <p className="text-sm mb-2">Wiggle Power</p>
          <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full"
              style={{ width: `${wiggleIntensity}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-xs mt-2 text-gray-400">
            {wiggleIntensity > 80 ? 'DANGER ZONE!' : wiggleIntensity > 50 ? 'Getting Wild!' : 'Keep Shaking!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WiggleStage;