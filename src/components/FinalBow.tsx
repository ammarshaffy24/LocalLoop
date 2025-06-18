import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Star } from 'lucide-react';

interface FinalBowProps {
  onNavigate: (state: string) => void;
}

const FinalBow: React.FC<FinalBowProps> = ({ onNavigate }) => {
  const [showFireworks, setShowFireworks] = useState(false);
  const [showQuote, setShowQuote] = useState(false);
  const [curtainFalling, setCurtainFalling] = useState(false);

  useEffect(() => {
    // Sequence the final bow animation
    const timer1 = setTimeout(() => setShowFireworks(true), 1000);
    const timer2 = setTimeout(() => setShowQuote(true), 3000);
    const timer3 = setTimeout(() => setCurtainFalling(true), 8000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const quotes = [
    "All the world's a stage — and you, the most dramatic of them all.",
    "The curtain falls, but your story has only just begun.",
    "Every ending is a new beginning in disguise.",
    "You've discovered not just a character, but a part of your soul.",
    "The spotlight may dim, but your inner light burns eternal."
  ];

  const selectedQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Back button */}
      <motion.button
        onClick={() => onNavigate('result')}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 10 }}
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Results
      </motion.button>

      {/* Spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.3) 0%, transparent 60%)',
        }}
      />

      {/* Main content */}
      <div className="flex items-center justify-center min-h-screen relative z-10">
        <motion.div
          className="text-center px-8 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          {/* Bow gesture */}
          <motion.div
            className="mb-12"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: [0, 30, 0] }}
            transition={{ duration: 2, delay: 0.5 }}
          >
            <motion.div
              className="text-8xl mb-8"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              🎭
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-6xl md:text-8xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 mb-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, duration: 1.2 }}
            style={{
              backgroundSize: '200% 200%',
            }}
          >
            Final Bow
          </motion.h1>

          {/* Quote */}
          <AnimatePresence>
            {showQuote && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5 }}
                className="mb-12"
              >
                <motion.blockquote
                  className="text-3xl md:text-4xl font-playfair italic text-yellow-300 leading-relaxed"
                  animate={{ 
                    textShadow: [
                      '0 0 20px rgba(255, 215, 0, 0.5)',
                      '0 0 40px rgba(255, 215, 0, 0.8)',
                      '0 0 20px rgba(255, 215, 0, 0.5)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  "{selectedQuote}"
                </motion.blockquote>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Thank you message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 5, duration: 1 }}
            className="mb-8"
          >
            <p className="text-xl md:text-2xl text-gray-300 font-crimson">
              Thank you for joining us on this theatrical journey.
            </p>
            <p className="text-lg text-gray-400 font-crimson mt-2">
              Your performance has been... magnificent.
            </p>
          </motion.div>

          {/* Navigation buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 6, duration: 0.8 }}
          >
            <motion.button
              onClick={() => onNavigate('landing')}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Star className="w-5 h-5" />
              Return to Stage
            </motion.button>

            <motion.button
              onClick={() => onNavigate('cast')}
              className="flex items-center gap-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              View Your Cast
            </motion.button>
          </motion.div>
        </motion.div>
      </div>

      {/* Fireworks */}
      <AnimatePresence>
        {showFireworks && (
          <>
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-4 h-4 rounded-full"
                style={{
                  background: ['#FFD700', '#FF69B4', '#00CED1', '#FF6347', '#9370DB', '#32CD32'][i % 6],
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                }}
                initial={{
                  scale: 0,
                  opacity: 1,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [1, 1, 0],
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 3,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2,
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Confetti */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={`confetti-${i}`}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-5, 5, -5],
            rotate: [0, 360],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Curtain fall */}
      <AnimatePresence>
        {curtainFalling && (
          <motion.div
            className="absolute inset-0 bg-red-900 z-40"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 3, ease: 'easeInOut' }}
          >
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-yellow-600 to-yellow-500 opacity-70" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 1 }}
              >
                <h2 className="text-6xl font-playfair text-yellow-400 mb-4">The End</h2>
                <p className="text-2xl text-gray-300 font-crimson italic">
                  ...or is it just the beginning?
                </p>
                
                <motion.button
                  onClick={() => onNavigate('landing')}
                  className="mt-8 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-8 py-3 rounded-full font-bold text-lg hover:from-yellow-500 hover:to-yellow-400 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 3 }}
                >
                  Encore Performance
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Applause indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: 2 }}
      >
        <div className="text-4xl mb-2">👏</div>
        <p className="text-gray-400 font-crimson text-sm">
          *Thunderous Applause*
        </p>
      </motion.div>
    </div>
  );
};

export default FinalBow;