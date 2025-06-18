import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { QuizQuestion, QuizResult } from '../types';
import { questions, getResult } from '../data/quizData';

interface QuizProps {
  onComplete: (result: QuizResult) => void;
}

const Quiz: React.FC<QuizProps> = ({ onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string>('');

  const handleAnswer = (archetype: string) => {
    const newAnswers = [...answers, archetype];
    setAnswers(newAnswers);
    setSelectedOption(archetype);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedOption('');
      } else {
        const result = getResult(newAnswers);
        onComplete(result);
      }
    }, 800);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto">
        {/* Stage lights progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-playfair text-yellow-400">
              Act {currentQuestion + 1} of {questions.length}
            </h2>
            <div className="text-gray-400">{Math.round(progress)}% Complete</div>
          </div>
          
          <div className="relative h-4 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-yellow-400 to-red-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            {/* Stage lights */}
            {[...Array(questions.length)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${
                  i <= currentQuestion ? 'bg-yellow-300' : 'bg-slate-600'
                }`}
                style={{ left: `${(i / (questions.length - 1)) * 100}%`, marginLeft: '-6px' }}
                animate={{ 
                  boxShadow: i <= currentQuestion 
                    ? ['0 0 0px rgba(255,255,0,0)', '0 0 20px rgba(255,255,0,0.8)', '0 0 0px rgba(255,255,0,0)']
                    : 'none'
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-700"
          >
            {/* Question illustration */}
            <motion.div
              className="mb-8 text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Lightbulb className="w-16 h-16 text-white" />
              </div>
              <div className="text-6xl mb-4">{questions[currentQuestion].image}</div>
            </motion.div>

            {/* Question text */}
            <motion.h3
              className="text-3xl font-playfair text-center mb-8 text-white leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {questions[currentQuestion].question}
            </motion.h3>

            {/* Options */}
            <div className="grid gap-4 md:grid-cols-2">
              {questions[currentQuestion].options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => handleAnswer(option.archetype)}
                  className={`group p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                    selectedOption === option.archetype
                      ? 'border-yellow-400 bg-yellow-400 bg-opacity-10 scale-105'
                      : 'border-slate-600 hover:border-slate-500 bg-slate-700 hover:bg-slate-600'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={selectedOption !== ''}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-crimson text-white group-hover:text-yellow-300 transition-colors">
                      {option.text}
                    </span>
                    <ChevronRight className={`w-6 h-6 transition-all duration-300 ${
                      selectedOption === option.archetype
                        ? 'text-yellow-400 translate-x-2'
                        : 'text-slate-400 group-hover:text-white group-hover:translate-x-1'
                    }`} />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dramatic quote */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <p className="text-gray-400 font-crimson italic text-lg">
            "The stage is set, the spotlight awaits your choice..."
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Quiz;