import React, { useState, useEffect } from 'react';
import { X, BarChart3, TrendingUp, MapPin, Users, Calendar, Award, Target } from 'lucide-react';
import { supabase, type Tip } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StatsData {
  totalTips: number;
  userTips: number;
  totalConfirmations: number;
  averageConfirmations: number;
  topCategories: { category: string; count: number }[];
  recentActivity: { date: string; count: number }[];
  topAreas: { lat: number; lng: number; count: number }[];
  userRank: number;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await getCurrentUser();
      
      // Load all tips for analysis
      const { data: tips, error: tipsError } = await supabase
        .from('tips')
        .select('*')
        .order('created_at', { ascending: false });

      if (tipsError) throw tipsError;

      if (!tips) {
        setStats({
          totalTips: 0,
          userTips: 0,
          totalConfirmations: 0,
          averageConfirmations: 0,
          topCategories: [],
          recentActivity: [],
          topAreas: [],
          userRank: 0
        });
        return;
      }

      // Calculate statistics
      const totalTips = tips.length;
      const userTips = user ? tips.filter(tip => tip.user_id === user.id).length : 0;
      const totalConfirmations = tips.reduce((sum, tip) => sum + tip.confirmations, 0);
      const averageConfirmations = totalTips > 0 ? totalConfirmations / totalTips : 0;

      // Top categories
      const categoryCount: { [key: string]: number } = {};
      tips.forEach(tip => {
        categoryCount[tip.category] = (categoryCount[tip.category] || 0) + 1;
      });
      const topCategories = Object.entries(categoryCount)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent activity (last 7 days)
      const now = new Date();
      const recentActivity = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const count = tips.filter(tip => {
          const tipDate = new Date(tip.created_at).toISOString().split('T')[0];
          return tipDate === dateStr;
        }).length;
        
        recentActivity.push({ date: dateStr, count });
      }

      // Top areas (simplified - group by rounded coordinates)
      const areaCount: { [key: string]: { lat: number; lng: number; count: number } } = {};
      tips.forEach(tip => {
        const roundedLat = Math.round(tip.lat * 100) / 100;
        const roundedLng = Math.round(tip.lng * 100) / 100;
        const key = `${roundedLat},${roundedLng}`;
        
        if (areaCount[key]) {
          areaCount[key].count++;
        } else {
          areaCount[key] = { lat: roundedLat, lng: roundedLng, count: 1 };
        }
      });
      const topAreas = Object.values(areaCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // User rank (based on number of tips created)
      const userCounts = tips.reduce((acc, tip) => {
        if (tip.user_id) {
          acc[tip.user_id] = (acc[tip.user_id] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number });
      
      const sortedUsers = Object.entries(userCounts)
        .sort(([, a], [, b]) => b - a);
      
      const userRank = user ? sortedUsers.findIndex(([userId]) => userId === user.id) + 1 : 0;

      setStats({
        totalTips,
        userTips,
        totalConfirmations,
        averageConfirmations,
        topCategories,
        recentActivity,
        topAreas,
        userRank
      });

    } catch (error) {
      console.error('Error loading stats:', error);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Community Statistics</h2>
              <p className="text-purple-100 text-sm">Insights and trends from LocalLoop</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={loadStats}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-3 rounded-xl">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalTips}</p>
                      <p className="text-blue-700 text-sm font-medium">Total Tips</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-2xl border border-emerald-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500 p-3 rounded-xl">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-emerald-900">{stats.totalConfirmations}</p>
                      <p className="text-emerald-700 text-sm font-medium">Total Confirmations</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-500 p-3 rounded-xl">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-900">{stats.averageConfirmations.toFixed(1)}</p>
                      <p className="text-purple-700 text-sm font-medium">Avg. Confirmations</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-3 rounded-xl">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-orange-900">{stats.userTips}</p>
                      <p className="text-orange-700 text-sm font-medium">Your Tips</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts and Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Categories */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Target className="h-5 w-5 text-indigo-500" />
                    <span>Popular Categories</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.topCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500' :
                            index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-orange-500' :
                            'bg-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="font-medium text-gray-900">{category.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-indigo-500 h-2 rounded-full"
                              style={{ width: `${(category.count / stats.totalTips) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold text-gray-600">{category.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-emerald-500" />
                    <span>Recent Activity (7 days)</span>
                  </h3>
                  <div className="space-y-3">
                    {stats.recentActivity.map((day, index) => {
                      const date = new Date(day.date);
                      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                      const maxCount = Math.max(...stats.recentActivity.map(d => d.count));
                      
                      return (
                        <div key={day.date} className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 w-12">{dayName}</span>
                          <div className="flex-1 mx-3">
                            <div className="w-full bg-gray-200 rounded-full h-3">
                              <div 
                                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: maxCount > 0 ? `${(day.count / maxCount) * 100}%` : '0%' }}
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-600 w-8 text-right">{day.count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* User Rank */}
              {stats.userRank > 0 && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl shadow-lg">
                      <Award className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-yellow-900">Your Community Rank</h3>
                      <p className="text-yellow-700">
                        You're ranked #{stats.userRank} among contributors with {stats.userTips} tips shared!
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;