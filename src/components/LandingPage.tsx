import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Theater, Sparkles, Music, Users, Palette, FileText, Gamepad2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onWiggleActivate: () => void;
  wiggleAlreadyActivated: boolean;
  onNavigate: (state: string) => void;
  hasCharacters: boolean;
}

const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onWiggleActivate, 
  wiggleAlreadyActivated, 
  onNavigate,
  hasCharacters 
}) => {
  const [curtainsOpen, setCurtainsOpen] = useState(false);
  const [musicEnabled, setMusicEnabled] = useState(false);
  const [clickCount, setClickCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setCurtainsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleBackstageClick = () => {
    if (wiggleAlreadyActivated) return; // Don't allow if already activated
    
    setClickCount(prev => prev + 1);
    if (clickCount >= 4) {
      onWiggleActivate();
      setClickCount(0);
    }
  };

  const navigationButtons = [
    { 
      icon: Users, 
      label: 'Cast of You', 
      action: () => onNavigate('cast'),
      show: hasCharacters,
      color: 'from-purple-600 to-pink-600'
    },
    { 
      icon: Palette, 
      label: 'Costume Room', 
      action: () => onNavigate('costume'),
      show: hasCharacters,
      color: 'from-blue-600 to-cyan-600'
    },
    { 
      icon: FileText, 
      label: 'Script Generator', 
      action: () => onNavigate('script'),
      show: hasCharacters,
      color: 'from-green-600 to-emerald-600'
    },
    { 
      icon: Gamepad2, 
      label: 'Green Room', 
      action: () => onNavigate('greenroom'),
      show: true,
      color: 'from-orange-600 to-red-600'
    }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Spotlight effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          background: [
            'radial-gradient(circle at 50% 30%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
            'radial-gradient(circle at 60% 40%, rgba(255, 215, 0, 0.15) 0%, transparent 50%)',
            'radial-gradient(circle at 40% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)',
          ],
        }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'reverse' }}
      />

      {/* Navigation menu */}
      <motion.div
        className="absolute top-8 left-8 flex flex-col gap-3"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 0.8 }}
      >
        {navigationButtons.filter(btn => btn.show).map((button, index) => (
          <motion.button
            key={button.label}
            onClick={button.action}
            className={`flex items-center gap-3 px-4 py-2 bg-gradient-to-r ${button.color} bg-opacity-80 hover:bg-opacity-100 text-white rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-sm`}
            whileHover={{ scale: 1.05, x: 10 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 2.2 + index * 0.1 }}
          >
            <button.icon className="w-4 h-4" />
            {button.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Curtains */}
      <motion.div
        className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-red-900 to-red-800 z-10"
        initial={{ x: 0 }}
        animate={{ x: curtainsOpen ? '-100%' : 0 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      >
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-yellow-600 to-yellow-500 opacity-70" />
      </motion.div>
      
      <motion.div
        className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900 to-red-800 z-10"
        initial={{ x: 0 }}
        animate={{ x: curtainsOpen ? '100%' : 0 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      >
        <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-l from-yellow-600 to-yellow-500 opacity-70" />
      </motion.div>

      {/* Main content */}
      <motion.div
        className="text-center z-20 px-8 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: curtainsOpen ? 1 : 0, y: curtainsOpen ? 0 : 50 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          className="flex justify-center mb-8"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          <Theater className="w-24 h-24 text-yellow-400" />
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-red-400 to-pink-400 mb-6"
          animate={{ 
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{ backgroundSize: '200% 200%' }}
        >
          Actstraveganza
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-8 font-crimson italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          "All the world's a stage, and you're about to discover your role..."
        </motion.p>

        <motion.p
          className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto font-crimson"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5, duration: 1 }}
        >
          Embark on a theatrical journey to uncover your inner performer. 
          Are you the brooding villain, the hopeless romantic, or perhaps something more... unexpected?
        </motion.p>

        <motion.button
          onClick={onStart}
          className="group relative bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white px-12 py-4 rounded-full text-xl font-semibold shadow-2xl transition-all duration-300 transform hover:scale-105"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3, duration: 0.8 }}
        >
          <span className="relative z-10 flex items-center gap-3">
            <Sparkles className="w-6 h-6" />
            {hasCharacters ? 'Create Another Character' : 'Take the Stage'}
            <Sparkles className="w-6 h-6" />
          </span>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full blur-lg opacity-0 group-hover:opacity-30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>

        {/* Hidden backstage door for easter egg - only show if not already activated */}
        {!wiggleAlreadyActivated && (
          <motion.div
            className="absolute bottom-8 right-8 w-16 h-20 bg-gradient-to-b from-amber-900 to-amber-800 rounded-t-lg cursor-pointer opacity-20 hover:opacity-40 transition-opacity"
            onClick={handleBackstageClick}
            whileHover={{ scale: 1.05 }}
            title="Backstage Door"
          >
            <div className="w-2 h-2 bg-yellow-600 rounded-full absolute top-8 right-2" />
            <div className="text-xs text-amber-200 absolute bottom-1 left-1 right-1 text-center">STAGE</div>
          </motion.div>
        )}

        {/* Music toggle */}
        <motion.button
          onClick={() => setMusicEnabled(!musicEnabled)}
          className="absolute top-8 right-8 p-3 bg-slate-800 bg-opacity-50 rounded-full text-gray-400 hover:text-yellow-400 transition-colors"
          whileHover={{ scale: 1.1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5 }}
        >
          <Music className={`w-6 h-6 ${musicEnabled ? 'text-yellow-400' : ''}`} />
        </motion.button>
      </motion.div>

      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            opacity: [0.3, 0.7, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </div>
  );
};

export default LandingPage;