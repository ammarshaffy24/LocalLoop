import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Crown, Heart, Zap, Skull, Paintbrush, Download, Trash2 } from 'lucide-react';
import { Character } from '../types';

interface CastOfYouProps {
  characters: Character[];
  onNavigate: (state: string) => void;
  onSelectCharacter: (character: Character) => void;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  crown: Crown,
  heart: Heart,
  zap: Zap,
  skull: Skull,
  paintbrush: Paintbrush,
  users: Users,
};

const CastOfYou: React.FC<CastOfYouProps> = ({ characters, onNavigate, onSelectCharacter }) => {
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [stageMode, setStageMode] = useState(false);

  const handleCharacterClick = (character: Character) => {
    if (stageMode) {
      setSelectedCharacters(prev => 
        prev.includes(character.id) 
          ? prev.filter(id => id !== character.id)
          : [...prev, character.id]
      );
    } else {
      onSelectCharacter(character);
    }
  };

  const generateInteraction = () => {
    if (selectedCharacters.length < 2) return '';
    
    const selected = characters.filter(c => selectedCharacters.includes(c.id));
    const interactions = [
      `${selected[0].result.title} dramatically confronts ${selected[1].result.title} about their conflicting artistic visions.`,
      `${selected[1].result.title} tries to steal the spotlight from ${selected[0].result.title}, leading to theatrical chaos.`,
      `${selected[0].result.title} and ${selected[1].result.title} discover they're perfect scene partners despite their differences.`,
      `${selected[1].result.title} challenges ${selected[0].result.title} to an impromptu acting duel.`,
      `${selected[0].result.title} attempts to direct ${selected[1].result.title}, but creative differences ensue.`
    ];
    
    return interactions[Math.floor(Math.random() * interactions.length)];
  };

  const downloadTroupe = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 600;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 32px serif';
    ctx.textAlign = 'center';
    ctx.fillText('My Drama Squad', 400, 50);

    // Characters
    characters.forEach((character, index) => {
      const x = 100 + (index % 4) * 150;
      const y = 150 + Math.floor(index / 4) * 200;
      
      // Character name
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px serif';
      ctx.fillText(character.result.title, x, y);
      
      // Outfit
      ctx.font = '24px serif';
      const outfit = [...character.outfit, ...character.props].join(' ');
      ctx.fillText(outfit || '🎭', x, y + 30);
    });

    // Download
    const link = document.createElement('a');
    link.download = 'my-drama-squad.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Stage
          </button>
          
          <h1 className="text-4xl font-playfair font-bold text-yellow-400">
            Cast of You
          </h1>
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => setStageMode(!stageMode)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                stageMode 
                  ? 'bg-yellow-400 text-black' 
                  : 'bg-slate-700 text-white hover:bg-slate-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {stageMode ? 'Exit Stage' : 'Stage Mode'}
            </motion.button>
            
            <motion.button
              onClick={downloadTroupe}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Export Squad
            </motion.button>
          </div>
        </motion.div>

        {characters.length === 0 ? (
          /* Empty State */
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Users className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <h2 className="text-3xl font-playfair font-bold text-gray-400 mb-4">
              No Characters Yet
            </h2>
            <p className="text-gray-500 font-crimson text-lg mb-8">
              Take the quiz to create your first theatrical character!
            </p>
            <motion.button
              onClick={() => onNavigate('quiz')}
              className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Create Your First Character
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Instructions */}
            <motion.div
              className="bg-slate-800 bg-opacity-50 rounded-lg p-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-gray-300 font-crimson text-center">
                {stageMode 
                  ? 'Select characters to see how they interact on stage together!'
                  : 'Click on any character to customize them further or view their details.'
                }
              </p>
            </motion.div>

            {/* Characters Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {characters.map((character, index) => {
                const IconComponent = iconMap[character.result.icon] || Crown;
                const isSelected = selectedCharacters.includes(character.id);
                
                return (
                  <motion.div
                    key={character.id}
                    onClick={() => handleCharacterClick(character)}
                    className={`cursor-pointer transition-all duration-300 ${
                      isSelected ? 'scale-105' : 'hover:scale-102'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <div className={`relative bg-gradient-to-br ${character.result.color} rounded-2xl p-6 shadow-2xl overflow-hidden ${
                      isSelected ? 'ring-4 ring-yellow-400' : ''
                    }`}>
                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        >
                          <span className="text-black font-bold text-sm">✓</span>
                        </motion.div>
                      )}
                      
                      {/* Character Icon */}
                      <motion.div
                        className="text-center mb-4"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
                      >
                        <IconComponent className="w-16 h-16 text-white mx-auto" />
                      </motion.div>
                      
                      {/* Character Info */}
                      <div className="text-center text-white">
                        <h3 className="text-xl font-playfair font-bold mb-2">
                          {character.result.title}
                        </h3>
                        <p className="text-sm opacity-90 mb-4">
                          {character.result.archetype}
                        </p>
                        
                        {/* Outfit Preview */}
                        <div className="flex justify-center gap-1 mb-3">
                          {[...character.outfit, ...character.props].slice(0, 4).map((item, i) => (
                            <span key={i} className="text-lg">{item}</span>
                          ))}
                          {character.outfit.length + character.props.length > 4 && (
                            <span className="text-sm opacity-70">+{character.outfit.length + character.props.length - 4}</span>
                          )}
                        </div>
                        
                        {/* Creation Date */}
                        <p className="text-xs opacity-60">
                          Created {new Date(character.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white bg-opacity-10 rounded-full" />
                      <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-white bg-opacity-5 rounded-full" />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Stage Interaction */}
            <AnimatePresence>
              {stageMode && selectedCharacters.length > 0 && (
                <motion.div
                  className="bg-slate-800 bg-opacity-50 rounded-2xl p-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h3 className="text-2xl font-playfair font-bold text-yellow-400 mb-4 text-center">
                    On Stage Now
                  </h3>
                  
                  {/* Selected Characters */}
                  <div className="flex justify-center gap-8 mb-6">
                    {characters.filter(c => selectedCharacters.includes(c.id)).map((character) => {
                      const IconComponent = iconMap[character.result.icon] || Crown;
                      return (
                        <motion.div
                          key={character.id}
                          className="text-center"
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                        >
                          <div className={`w-20 h-20 bg-gradient-to-br ${character.result.color} rounded-full flex items-center justify-center mb-2`}>
                            <IconComponent className="w-10 h-10 text-white" />
                          </div>
                          <p className="text-white text-sm font-semibold">{character.result.title}</p>
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Interaction */}
                  {selectedCharacters.length >= 2 && (
                    <motion.div
                      className="bg-black bg-opacity-30 rounded-lg p-6 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <h4 className="text-lg font-playfair font-bold text-yellow-300 mb-3">
                        Scene: Backstage Drama
                      </h4>
                      <p className="text-gray-200 font-crimson italic">
                        {generateInteraction()}
                      </p>
                    </motion.div>
                  )}
                  
                  {selectedCharacters.length === 1 && (
                    <div className="text-center text-gray-400">
                      <p className="font-crimson italic">
                        Select another character to see them interact!
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
};

export default CastOfYou;