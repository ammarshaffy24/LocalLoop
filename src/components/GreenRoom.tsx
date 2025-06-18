import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Target, Zap, Brain, Trophy, RotateCcw } from 'lucide-react';

interface GreenRoomProps {
  onNavigate: (state: string) => void;
}

type Game = 'spotlight' | 'props' | 'cues' | null;

const GreenRoom: React.FC<GreenRoomProps> = ({ onNavigate }) => {
  const [currentGame, setCurrentGame] = useState<Game>(null);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);

  // Spotlight Dodge Game
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });
  const [playerPos, setPlayerPos] = useState({ x: 25, y: 25 });
  const [spotlightSpeed, setSpotlightSpeed] = useState(1);

  // Prop Panic Game
  const [fallingProps, setFallingProps] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);
  const [caughtProps, setCaughtProps] = useState(0);
  const [playerX, setPlayerX] = useState(50);

  // Cue Card Chaos Game
  const [currentCue, setCurrentCue] = useState<{ line: string; reactions: string[]; correct: number } | null>(null);
  const [cueScore, setCueScore] = useState(0);

  const cueCards = [
    { line: "To be or not to be...", reactions: ["😢", "😂", "😍", "🤔"], correct: 3 },
    { line: "Romeo, Romeo, wherefore art thou Romeo?", reactions: ["💕", "😡", "😴", "🤪"], correct: 0 },
    { line: "Et tu, Brute?", reactions: ["😱", "😂", "💕", "😴"], correct: 0 },
    { line: "All the world's a stage...", reactions: ["🎭", "🍕", "🚗", "📱"], correct: 0 },
  ];

  useEffect(() => {
    if (currentGame === 'spotlight' && gameActive) {
      const interval = setInterval(() => {
        setSpotlightPos(prev => ({
          x: Math.max(0, Math.min(100, prev.x + (Math.random() - 0.5) * spotlightSpeed * 4)),
          y: Math.max(0, Math.min(100, prev.y + (Math.random() - 0.5) * spotlightSpeed * 4))
        }));
        setSpotlightSpeed(prev => prev + 0.01);
      }, 100);

      return () => clearInterval(interval);
    }
  }, [currentGame, gameActive, spotlightSpeed]);

  useEffect(() => {
    if (currentGame === 'props' && gameActive) {
      const interval = setInterval(() => {
        const props = ['🎭', '🎪', '🎨', '🎵', '⭐', '🌟', '✨', '🎊'];
        setFallingProps(prev => [
          ...prev,
          {
            id: Date.now(),
            x: Math.random() * 90,
            y: -5,
            emoji: props[Math.floor(Math.random() * props.length)]
          }
        ]);
      }, 800);

      return () => clearInterval(interval);
    }
  }, [currentGame, gameActive]);

  useEffect(() => {
    if (currentGame === 'props' && gameActive) {
      const interval = setInterval(() => {
        setFallingProps(prev => 
          prev.map(prop => ({ ...prop, y: prop.y + 2 }))
            .filter(prop => {
              if (prop.y > 85 && Math.abs(prop.x - playerX) < 10) {
                setCaughtProps(c => c + 1);
                return false;
              }
              return prop.y < 100;
            })
        );
      }, 50);

      return () => clearInterval(interval);
    }
  }, [currentGame, gameActive, playerX]);

  const startGame = (game: Game) => {
    setCurrentGame(game);
    setGameActive(true);
    setScore(0);
    
    if (game === 'spotlight') {
      setSpotlightPos({ x: 50, y: 50 });
      setPlayerPos({ x: 25, y: 25 });
      setSpotlightSpeed(1);
    } else if (game === 'props') {
      setFallingProps([]);
      setCaughtProps(0);
      setPlayerX(50);
    } else if (game === 'cues') {
      setCueScore(0);
      setCurrentCue(cueCards[0]);
    }

    // Auto-end games after 30 seconds
    setTimeout(() => {
      setGameActive(false);
    }, 30000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (currentGame === 'spotlight' && gameActive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPlayerPos({ x, y });

      // Check if caught by spotlight
      const distance = Math.sqrt(
        Math.pow(x - spotlightPos.x, 2) + Math.pow(y - spotlightPos.y, 2)
      );
      if (distance < 15) {
        setGameActive(false);
      } else {
        setScore(prev => prev + 1);
      }
    } else if (currentGame === 'props' && gameActive) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      setPlayerX(x);
    }
  };

  const handleCueAnswer = (answerIndex: number) => {
    if (!currentCue) return;
    
    if (answerIndex === currentCue.correct) {
      setCueScore(prev => prev + 1);
    }
    
    const nextIndex = cueCards.findIndex(c => c.line === currentCue.line) + 1;
    if (nextIndex < cueCards.length) {
      setCurrentCue(cueCards[nextIndex]);
    } else {
      setGameActive(false);
      setScore(cueScore + (answerIndex === currentCue.correct ? 1 : 0));
    }
  };

  const games = [
    {
      id: 'spotlight',
      name: 'Spotlight Dodge',
      description: 'Avoid the chasing spotlight!',
      icon: Target,
      color: 'from-yellow-500 to-orange-600'
    },
    {
      id: 'props',
      name: 'Prop Panic',
      description: 'Catch falling theater props!',
      icon: Zap,
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'cues',
      name: 'Cue Card Chaos',
      description: 'Match lines to reactions!',
      icon: Brain,
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
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
            Green Room Games
          </h1>
          
          <div className="w-20" />
        </motion.div>

        <AnimatePresence mode="wait">
          {!currentGame ? (
            /* Game Selection */
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <motion.p
                className="text-xl text-gray-300 font-crimson mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Take a break from the drama with these quick theater-themed mini-games!
              </motion.p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {games.map((game, index) => (
                  <motion.button
                    key={game.id}
                    onClick={() => startGame(game.id as Game)}
                    className={`p-6 rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-2xl transition-all duration-300 hover:scale-105`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <game.icon className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-xl font-playfair font-bold mb-2">{game.name}</h3>
                    <p className="text-sm opacity-90">{game.description}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Game Area */
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentGame(null)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Games
                </button>
                
                <div className="text-center">
                  <h2 className="text-2xl font-playfair font-bold text-yellow-400">
                    {games.find(g => g.id === currentGame)?.name}
                  </h2>
                  <p className="text-gray-300">
                    Score: {currentGame === 'props' ? caughtProps : score}
                  </p>
                </div>
                
                <button
                  onClick={() => startGame(currentGame)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restart
                </button>
              </div>

              {/* Game Content */}
              <div className="bg-slate-800 bg-opacity-50 rounded-2xl p-8 min-h-96 relative overflow-hidden">
                {currentGame === 'spotlight' && (
                  <div
                    className="w-full h-80 relative cursor-none bg-black rounded-lg"
                    onMouseMove={handleMouseMove}
                  >
                    {/* Spotlight */}
                    <motion.div
                      className="absolute w-32 h-32 bg-yellow-400 rounded-full opacity-30 pointer-events-none"
                      style={{
                        left: `${spotlightPos.x}%`,
                        top: `${spotlightPos.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    />
                    
                    {/* Player */}
                    <motion.div
                      className="absolute w-8 h-8 bg-red-500 rounded-full"
                      style={{
                        left: `${playerPos.x}%`,
                        top: `${playerPos.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    />
                    
                    {!gameActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                          <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
                          <p>You dodged for {score} points!</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentGame === 'props' && (
                  <div
                    className="w-full h-80 relative bg-gradient-to-b from-blue-900 to-blue-700 rounded-lg overflow-hidden"
                    onMouseMove={handleMouseMove}
                  >
                    {/* Falling Props */}
                    {fallingProps.map(prop => (
                      <motion.div
                        key={prop.id}
                        className="absolute text-4xl"
                        style={{
                          left: `${prop.x}%`,
                          top: `${prop.y}%`
                        }}
                      >
                        {prop.emoji}
                      </motion.div>
                    ))}
                    
                    {/* Player Basket */}
                    <div
                      className="absolute bottom-4 w-16 h-8 bg-yellow-600 rounded-full"
                      style={{
                        left: `${playerX}%`,
                        transform: 'translateX(-50%)'
                      }}
                    />
                    
                    {!gameActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="text-center text-white">
                          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                          <h3 className="text-2xl font-bold mb-2">Time's Up!</h3>
                          <p>You caught {caughtProps} props!</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {currentGame === 'cues' && currentCue && (
                  <div className="text-center">
                    <div className="bg-white text-black p-6 rounded-lg mb-6 max-w-md mx-auto">
                      <h3 className="text-xl font-bold mb-2">Famous Line:</h3>
                      <p className="text-lg font-crimson italic">"{currentCue.line}"</p>
                    </div>
                    
                    <p className="text-white mb-4">Choose the best reaction:</p>
                    
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                      {currentCue.reactions.map((reaction, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleCueAnswer(index)}
                          className="text-6xl p-4 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {reaction}
                        </motion.button>
                      ))}
                    </div>
                    
                    {!gameActive && (
                      <div className="mt-8">
                        <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
                        <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
                        <p className="text-gray-300">You got {score} out of {cueCards.length} correct!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GreenRoom;