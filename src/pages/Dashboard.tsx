import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mic, Brain, TrendingUp, Clock, Star, ChevronRight } from 'lucide-react';
import { useCloudStories } from '../contexts/CloudStoriesContext';
import { useCloudVocabulary } from '../contexts/CloudVocabularyContext';
import { debugUserTables } from '../utils/databaseDebug';

export function Dashboard() {
  const { savedStories } = useCloudStories();
  const { vocabulary, getTotalWordsLearned, getRecentWords, getMilestoneProgress } = useCloudVocabulary();

  // Add debug button in development
  const handleDebug = () => {
    debugUserTables();
  };

  const recentStories = savedStories.slice(-3).reverse();
  const totalWords = vocabulary.length;
  const totalLearnedWords = getTotalWordsLearned();
  const wordsThisWeek = getRecentWords(7).length;
  const storiesCompleted = savedStories.length;
  const { current, nextMilestone } = getMilestoneProgress();

  const quickActions = [
    {
      title: 'Practice a Story',
      description: 'Generate new dialogues to practice',
      icon: BookOpen,
      path: '/practice',
      color: 'from-blue-500 to-blue-600',
      emoji: '📖'
    },
    {
      title: 'Speak Dialogue',
      description: 'Practice pronunciation with audio',
      icon: Mic,
      path: '/practice',
      color: 'from-green-500 to-green-600',
      emoji: '🗣'
    },
    {
      title: 'Review Vocabulary',
      description: 'Browse your learned words',
      icon: Brain,
      path: '/vocabulary',
      color: 'from-purple-500 to-purple-600',
      emoji: '📚'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Willkommen zurück! 👋
        </h1>
        <p className="text-gray-600">
          Ready to continue your German learning journey?
        </p>
        
        {/* Debug button - only show in development */}
        {import.meta.env.DEV && (
          <button
            onClick={handleDebug}
            className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200"
          >
            🐛 Debug Database
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={index}
                    to={action.path}
                    className="group relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-gray-200 hover:border-gray-300"
                  >
                    <div className="flex flex-col items-center text-center space-y-3">
                      <div className={`p-3 bg-gradient-to-r ${action.color} rounded-xl text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {action.emoji} {action.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="absolute top-4 right-4 h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Your Progress
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {totalLearnedWords}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800">Learned</h3>
                <p className="text-sm text-gray-600">Words mastered</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Brain className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {totalWords}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800">Encountered</h3>
                <p className="text-sm text-gray-600">Words seen</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {storiesCompleted}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800">Stories</h3>
                <p className="text-sm text-gray-600">Completed</p>
              </div>

              <div className="text-center">
                <div className="relative w-20 h-20 mx-auto mb-3">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Star className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="absolute -top-1 -right-1 bg-yellow-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {wordsThisWeek}
                  </div>
                </div>
                <h3 className="font-semibold text-gray-800">This Week</h3>
                <p className="text-sm text-gray-600">New words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Stories & Milestone */}
        <div className="space-y-6">
          {/* Milestone Progress */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              🏆 Next Milestone
            </h2>
            <p className="text-yellow-100 mb-4">
              You're {nextMilestone - current} words away from {nextMilestone} learned words!
            </p>
            <div className="bg-white bg-opacity-20 rounded-xl p-3 mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{current}/{nextMilestone} words</span>
              </div>
              <div className="w-full bg-white bg-opacity-30 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${(current / nextMilestone) * 100}%` }}
                ></div>
              </div>
            </div>
            <Link
              to="/vocabulary"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-4 py-2 rounded-xl font-medium hover:bg-orange-50 transition-colors duration-200"
            >
              View Dictionary
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Recent Stories */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Recent Stories
              </h2>
              <Link
                to="/stories"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            {recentStories.length > 0 ? (
              <div className="space-y-3">
                {recentStories.map((story) => (
                  <Link
                    key={story.id}
                    to="/practice"
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200 border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                        {story.situation.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">
                          {story.situation.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {story.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">No stories yet</p>
                <Link
                  to="/practice"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                >
                  <BookOpen className="h-4 w-4" />
                  Create your first story
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}