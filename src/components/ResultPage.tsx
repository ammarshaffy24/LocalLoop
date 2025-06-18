import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, RotateCcw, Crown, Heart, Zap, Skull, Paintbrush, Users, Palette, FileText, Sparkles } from 'lucide-react';
import { QuizResult, Character } from '../types';

interface ResultPageProps {
  result: QuizResult;
  onRestart: () => void;
  onNavigate: (state: string) => void;
  character: Character | null;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  crown: Crown,
  heart: Heart,
  zap: Zap,
  skull: Skull,
  paintbrush: Paintbrush,
  users: Users,
};

const ResultPage: React.FC<ResultPageProps> = ({ result, onRestart, onNavigate, character }) => {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const shareText = `I just discovered I'm "${result.title}" on Actstraveganza! ${result.quote}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Actstraveganza Result',
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch (err) {
        console.log('Error copying to clipboard:', err);
      }
    }
  };

  const IconComponent = iconMap[result.icon] || Crown;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Spotlight effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${result.color}20 0%, transparent 70%)`,
          }}
        />

        {/* Curtain reveal */}
        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          {/* Character poster */}
          <motion.div
            className={`relative mx-auto mb-8 w-80 h-96 bg-gradient-to-br ${result.color} rounded-2xl shadow-2xl overflow-hidden`}
            initial={{ y: 50, rotateY: -15 }}
            animate={{ y: 0, rotateY: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="text-8xl"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
              >
                <IconComponent className="w-32 h-32 text-white drop-shadow-lg" />
              </motion.div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-playfair font-bold mb-2">{result.archetype}</h2>
              <p className="text-lg opacity-90">{result.title}</p>
            </div>
            
            {/* Decorative frame */}
            <div className="absolute inset-4 border-4 border-yellow-400 border-opacity-30 rounded-xl" />
          </motion.div>

          {/* Character title */}
          <motion.h1
            className="text-5xl md:text-6xl font-playfair font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-400 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {result.title}
          </motion.h1>

          {/* Description */}
          <motion.div
            className="max-w-2xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <p className="text-xl text-gray-300 font-crimson leading-relaxed mb-6">
              {result.description}
            </p>
            
            <blockquote className="text-2xl font-playfair italic text-yellow-300 border-l-4 border-yellow-400 pl-6 py-4">
              "{result.quote}"
            </blockquote>
          </motion.div>

          {/* Costume suggestion */}
          <motion.div
            className="bg-slate-800 bg-opacity-50 rounded-xl p-6 mb-8 max-w-lg mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <h3 className="text-xl font-playfair font-semibold text-yellow-400 mb-3">
              Your Perfect Costume
            </h3>
            <p className="text-gray-300 font-crimson">{result.costume}</p>
          </motion.div>

          {/* Next steps */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <motion.button
              onClick={() => onNavigate('costume')}
              className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Palette className="w-5 h-5" />
              Dress Up
            </motion.button>

            <motion.button
              onClick={() => onNavigate('script')}
              className="flex items-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText className="w-5 h-5" />
              Get Script
            </motion.button>

            <motion.button
              onClick={() => onNavigate('finalblow')}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Sparkles className="w-5 h-5" />
              Final Bow
            </motion.button>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.6 }}
          >
            <motion.button
              onClick={handleShare}
              className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5" />
              {shared ? 'Copied to Clipboard!' : 'Share Your Drama'}
            </motion.button>

            <motion.button
              onClick={onRestart}
              className="flex items-center gap-3 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-5 h-5" />
              Take Another Bow
            </motion.button>
          </motion.div>

          {/* Floating confetti */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-yellow-400 rounded-full"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${20 + Math.random() * 60}%`,
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
        </motion.div>
      </div>
    </div>
  );
};

export default ResultPage;