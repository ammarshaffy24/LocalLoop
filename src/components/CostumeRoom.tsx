import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, ArrowLeft, Download, Palette, Crown, Heart, Zap, Skull, Paintbrush, Users } from 'lucide-react';
import { Character } from '../types';

interface CostumeRoomProps {
  character: Character;
  onSave: (character: Character) => void;
  onNavigate: (state: string) => void;
}

const iconMap: { [key: string]: React.ComponentType<any> } = {
  crown: Crown,
  heart: Heart,
  zap: Zap,
  skull: Skull,
  paintbrush: Paintbrush,
  users: Users,
};

const costumes = {
  hats: ['🎩', '👑', '🧢', '🎓', '🪖', '👒', '🎭'],
  tops: ['👔', '👗', '🥼', '🦺', '👘', '🥻', '👚'],
  accessories: ['🎀', '👓', '🕶️', '⌚', '💍', '🎪', '🔮'],
  props: ['🗡️', '🏹', '🪄', '📜', '🌹', '💀', '⚡']
};

const CostumeRoom: React.FC<CostumeRoomProps> = ({ character, onSave, onNavigate }) => {
  const [selectedOutfit, setSelectedOutfit] = useState<string[]>(character.outfit || []);
  const [selectedProps, setSelectedProps] = useState<string[]>(character.props || []);
  const [activeCategory, setActiveCategory] = useState<keyof typeof costumes>('hats');

  const handleItemClick = (item: string, category: keyof typeof costumes) => {
    if (category === 'props') {
      setSelectedProps(prev => 
        prev.includes(item) 
          ? prev.filter(p => p !== item)
          : [...prev, item]
      );
    } else {
      setSelectedOutfit(prev => 
        prev.includes(item) 
          ? prev.filter(o => o !== item)
          : [...prev, item]
      );
    }
  };

  const handleSave = () => {
    const updatedCharacter: Character = {
      ...character,
      outfit: selectedOutfit,
      props: selectedProps
    };
    onSave(updatedCharacter);
  };

  const handleDownload = () => {
    // Create a simple character poster for download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 600;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 600);

    // Character info
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 24px serif';
    ctx.textAlign = 'center';
    ctx.fillText(character.result.title, 200, 50);

    // Outfit and props
    ctx.font = '48px serif';
    const allItems = [...selectedOutfit, ...selectedProps];
    allItems.forEach((item, index) => {
      const x = 100 + (index % 4) * 50;
      const y = 150 + Math.floor(index / 4) * 60;
      ctx.fillText(item, x, y);
    });

    // Download
    const link = document.createElement('a');
    link.download = `${character.name}-costume.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const IconComponent = iconMap[character.result.icon] || Crown;

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
            onClick={() => onNavigate('result')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Results
          </button>
          
          <h1 className="text-4xl font-playfair font-bold text-yellow-400">
            Costume Room
          </h1>
          
          <div className="flex gap-2">
            <motion.button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4" />
              Download
            </motion.button>
            
            <motion.button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Save className="w-4 h-4" />
              Save Look
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Character Preview */}
          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={`bg-gradient-to-br ${character.result.color} rounded-2xl p-8 text-center shadow-2xl`}>
              <motion.div
                className="text-6xl mb-4"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <IconComponent className="w-24 h-24 text-white mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-playfair font-bold text-white mb-2">
                {character.result.title}
              </h2>
              
              {/* Outfit Display */}
              <div className="mt-6 space-y-4">
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Current Outfit</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedOutfit.map((item, index) => (
                      <motion.span
                        key={index}
                        className="text-3xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
                
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Props</h3>
                  <div className="flex flex-wrap justify-center gap-2">
                    {selectedProps.map((item, index) => (
                      <motion.span
                        key={index}
                        className="text-3xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Costume Selection */}
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* Category Tabs */}
            <div className="flex gap-2 mb-6">
              {Object.keys(costumes).map((category) => (
                <motion.button
                  key={category}
                  onClick={() => setActiveCategory(category as keyof typeof costumes)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeCategory === category
                      ? 'bg-yellow-400 text-black'
                      : 'bg-slate-700 text-white hover:bg-slate-600'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Items Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {costumes[activeCategory].map((item, index) => {
                  const isSelected = activeCategory === 'props' 
                    ? selectedProps.includes(item)
                    : selectedOutfit.includes(item);
                  
                  return (
                    <motion.button
                      key={item}
                      onClick={() => handleItemClick(item, activeCategory)}
                      className={`aspect-square rounded-lg text-4xl flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-yellow-400 scale-110 shadow-lg'
                          : 'bg-slate-700 hover:bg-slate-600 hover:scale-105'
                      }`}
                      whileHover={{ scale: isSelected ? 1.15 : 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item}
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {/* Instructions */}
            <motion.div
              className="mt-8 bg-slate-800 bg-opacity-50 rounded-lg p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-5 h-5 text-yellow-400" />
                <h3 className="text-white font-semibold">Styling Tips</h3>
              </div>
              <p className="text-gray-300 text-sm">
                Click items to add or remove them from your character's look. 
                Mix and match to create the perfect theatrical ensemble!
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default CostumeRoom;