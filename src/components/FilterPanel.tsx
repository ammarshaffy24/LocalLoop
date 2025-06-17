import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { type Tip } from '../lib/supabase';

interface FilterPanelProps {
  tips: Tip[];
  onFilterChange: (filteredTips: Tip[]) => void;
}

const categories = [
  'Shortcuts',
  'Free Stuff', 
  'Hidden Gems',
  'Food & Drink',
  'Shopping',
  'Nature',
  'Entertainment',
  'Services',
  'Events',
  'Other'
];

const getCategoryColor = (category: string) => {
  const colors: { [key: string]: string } = {
    'Shortcuts': 'bg-blue-500',
    'Free Stuff': 'bg-green-500',
    'Hidden Gems': 'bg-purple-500',
    'Food & Drink': 'bg-orange-500',
    'Shopping': 'bg-pink-500',
    'Nature': 'bg-emerald-500',
    'Entertainment': 'bg-yellow-500',
    'Services': 'bg-indigo-500',
    'Events': 'bg-red-500',
    'Other': 'bg-gray-500'
  };
  return colors[category] || 'bg-gray-500';
};

const FilterPanel: React.FC<FilterPanelProps> = ({ tips, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(categories));
  const [showExpiredTips, setShowExpiredTips] = useState(true);

  // Calculate category counts
  const categoryCounts = tips.reduce((acc, tip) => {
    acc[tip.category] = (acc[tip.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Filter tips based on current filters
  useEffect(() => {
    let filteredTips = tips;

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filteredTips = filteredTips.filter(tip =>
        tip.description.toLowerCase().includes(searchLower) ||
        tip.category.toLowerCase().includes(searchLower)
      );
    }

    // Filter by selected categories
    filteredTips = filteredTips.filter(tip =>
      selectedCategories.has(tip.category)
    );

    // Filter expired tips if needed
    if (!showExpiredTips) {
      filteredTips = filteredTips.filter(tip => {
        const daysSinceConfirmed = (Date.now() - new Date(tip.last_confirmed_at).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceConfirmed <= 7;
      });
    }

    onFilterChange(filteredTips);
  }, [tips, searchText, selectedCategories, showExpiredTips, onFilterChange]);

  const handleCategoryToggle = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedCategories(new Set(categories));
  };

  const handleSelectNone = () => {
    setSelectedCategories(new Set());
  };

  const handleClearSearch = () => {
    setSearchText('');
  };

  const activeFiltersCount = categories.length - selectedCategories.size + (searchText ? 1 : 0) + (!showExpiredTips ? 1 : 0);

  return (
    <div className="fixed top-20 sm:top-24 right-2 left-2 sm:left-auto sm:right-4 z-[1000] w-full sm:w-80 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)]">
      {/* Filter Toggle Button - Mobile optimized */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/95 hover:bg-white backdrop-blur-sm text-gray-800 rounded-xl shadow-lg border border-white/20 transition-all duration-200 hover:scale-105 btn-hover mb-2 text-base sm:text-sm"
      >
        <div className="flex items-center space-x-2">
          <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="text-xs sm:text-sm font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-emerald-500 text-white text-xs px-1.5 sm:px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4" />
        ) : (
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        )}
      </button>

      {/* Filter Panel - Mobile optimized */}
      {isExpanded && (
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/20 p-4 space-y-4 slide-in max-h-[70vh] overflow-y-auto">
          {/* Search Field */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-medium text-gray-700">Search Tips</label>
            <div className="relative">
              <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search descriptions or categories..."
                className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-xs sm:text-sm"
              />
              {searchText && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filters */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-medium text-gray-700">Categories</label>
              <div className="flex space-x-2">
                <button
                  onClick={handleSelectAll}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={handleSelectNone}
                  className="text-xs text-gray-600 hover:text-gray-700 font-medium"
                >
                  None
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
              {categories.map((category) => {
                const isSelected = selectedCategories.has(category);
                const count = categoryCounts[category] || 0;
                
                return (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${getCategoryColor(category)} ${!isSelected ? 'opacity-50' : ''}`} />
                      <span className="font-medium truncate">{category}</span>
                    </div>
                    <span className={`text-xs px-1 sm:px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Filters */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-xs sm:text-sm font-medium text-gray-700">Additional Options</label>
            <button
              onClick={() => setShowExpiredTips(!showExpiredTips)}
              className={`flex items-center justify-between w-full p-2 rounded-lg border transition-all duration-200 text-xs sm:text-sm ${
                showExpiredTips
                  ? 'bg-gray-50 border-gray-200 text-gray-600'
                  : 'bg-orange-50 border-orange-200 text-orange-700'
              }`}
            >
              <span>Show Expired Tips</span>
              <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center ${
                showExpiredTips ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
              }`}>
                {showExpiredTips && <div className="w-1 h-1 sm:w-2 sm:h-2 bg-white rounded-sm" />}
              </div>
            </button>
          </div>

          {/* Filter Summary */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {tips.filter(tip => {
                  const matchesSearch = !searchText.trim() || 
                    tip.description.toLowerCase().includes(searchText.toLowerCase()) ||
                    tip.category.toLowerCase().includes(searchText.toLowerCase());
                  const matchesCategory = selectedCategories.has(tip.category);
                  const matchesExpired = showExpiredTips || 
                    (Date.now() - new Date(tip.last_confirmed_at).getTime()) / (1000 * 60 * 60 * 24) <= 7;
                  return matchesSearch && matchesCategory && matchesExpired;
                }).length} of {tips.length} tips
              </span>
              {activeFiltersCount > 0 && (
                <button
                  onClick={() => {
                    setSearchText('');
                    setSelectedCategories(new Set(categories));
                    setShowExpiredTips(true);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;