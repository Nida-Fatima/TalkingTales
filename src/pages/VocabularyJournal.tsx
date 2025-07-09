import React, { useState } from 'react';
import { Brain, Search, Calendar, TrendingUp, BookOpen, Filter, Trophy, Shuffle, Volume2 } from 'lucide-react';
import { useCloudVocabulary } from '../contexts/CloudVocabularyContext';
import { ReviewQuizModal } from '../components/ReviewQuizModal';

export function VocabularyJournal() {
  const { 
    vocabulary, 
    learnedWords, 
    getTotalWordsLearned, 
    getRecentWords, 
    getMilestoneProgress 
  } = useCloudVocabulary();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'alphabetical' | 'recent' | 'frequency'>('recent');
  const [activeTab, setActiveTab] = useState<'encountered' | 'learned'>('learned');
  const [showReviewQuiz, setShowReviewQuiz] = useState(false);

  // Filter and sort encountered vocabulary
  const filteredVocabulary = vocabulary
    .filter(word =>
      word.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'recent':
          return new Date(b.firstSeenAt).getTime() - new Date(a.firstSeenAt).getTime();
        case 'frequency':
          return b.timesEncountered - a.timesEncountered;
        default:
          return 0;
      }
    });

  // Filter and sort learned vocabulary
  const filteredLearnedWords = learnedWords
    .filter(word =>
      word.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      word.translation.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        case 'recent':
          return new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime();
        case 'frequency':
          return b.timesCorrect - a.timesCorrect;
        default:
          return 0;
      }
    });

  const totalWords = vocabulary.length;
  const totalLearnedWords = getTotalWordsLearned();
  const wordsThisWeek = getRecentWords(7).length;
  const { current, nextMilestone } = getMilestoneProgress();

  const mostFrequentWords = vocabulary
    .sort((a, b) => b.timesEncountered - a.timesEncountered)
    .slice(0, 5);

  const playWordPronunciation = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
              <Brain className="h-8 w-8 text-white" />
            </div>
            Vocabulary Journal
          </h1>
          <p className="text-gray-600 mb-6">
            Your personal German dictionary - track encountered and learned words
          </p>
          
          {/* How Your Dictionary is Built */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              🏗️ How Your Dictionary is Built
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">👆</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">1. Click Words</h3>
                <p className="text-sm text-gray-600">
                  Activate vocabulary mode and click on German words in stories to add them to your list
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🧠</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">2. Take Quizzes</h3>
                <p className="text-sm text-gray-600">
                  Test your knowledge with quizzes. Words you answer correctly move to "Learned Words"
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">3. Build Dictionary</h3>
                <p className="text-sm text-gray-600">
                  Your personal dictionary grows as you learn. Review and practice to strengthen memory
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Stats & Controls */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Your Progress
              </h2>
              
              <div className="space-y-4">
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{totalLearnedWords}</div>
                  <div className="text-sm text-purple-700">Words Learned</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{totalWords}</div>
                  <div className="text-sm text-blue-700">Words Encountered</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{wordsThisWeek}</div>
                  <div className="text-sm text-green-700">This Week</div>
                </div>
              </div>
            </div>

            {/* Milestone Progress */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Next Milestone
              </h2>
              
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="text-lg font-bold text-gray-800 mb-2">
                  {current} / {nextMilestone}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div 
                    className="bg-yellow-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(current / nextMilestone) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-600">
                  {nextMilestone - current} words to go!
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shuffle className="h-5 w-5 text-purple-600" />
                Review Practice
              </h2>
              
              <button
                onClick={() => setShowReviewQuiz(true)}
                disabled={totalLearnedWords < 5}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <Shuffle className="h-4 w-4" />
                🔁 Review 5 Words
              </button>
              
              {totalLearnedWords < 5 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Learn 5 words to unlock review mode
                </p>
              )}
            </div>

            {/* Most Frequent Words */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                Most Encountered
              </h2>
              
              {mostFrequentWords.length > 0 ? (
                <div className="space-y-3">
                  {mostFrequentWords.map((word, index) => (
                    <div key={word.text} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{word.text}</div>
                        <div className="text-xs text-gray-600">{word.timesEncountered}x</div>
                      </div>
                      <span className="text-lg">{word.emoji}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Start practicing to see your most frequent words!
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Vocabulary List */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setActiveTab('learned')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                    activeTab === 'learned'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  📚 Learned Words ({totalLearnedWords})
                </button>
                <button
                  onClick={() => setActiveTab('encountered')}
                  className={`px-4 py-2 rounded-xl font-medium transition-colors duration-200 ${
                    activeTab === 'encountered'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  👀 Encountered Words ({totalWords})
                </button>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search vocabulary..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  />
                </div>
                
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="frequency">Most Frequent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Vocabulary Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  {activeTab === 'learned' ? 'Learned' : 'Encountered'} Words ({
                    activeTab === 'learned' ? filteredLearnedWords.length : filteredVocabulary.length
                  })
                </h2>
              </div>

              {(activeTab === 'learned' ? filteredLearnedWords : filteredVocabulary).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Word
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Meaning
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {activeTab === 'learned' ? 'Learned' : 'First Seen'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {activeTab === 'learned' ? 'Success Rate' : 'Times Seen'}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Audio
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(activeTab === 'learned' ? filteredLearnedWords : filteredVocabulary).map((word) => (
                        <tr key={word.text} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{word.emoji}</span>
                              <div className="font-medium text-gray-900">{word.text}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-700">{word.translation}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(
                                activeTab === 'learned' 
                                  ? (word as any).learnedAt 
                                  : word.firstSeenAt
                              ).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {activeTab === 'learned' ? (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  ✓ {(word as any).timesCorrect}
                                </span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  ✗ {(word as any).timesIncorrect}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {word.timesEncountered}x
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => playWordPronunciation(word.text)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                              title="Play pronunciation"
                            >
                              <Volume2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Brain className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? 'No words match your search' 
                      : activeTab === 'learned'
                        ? 'No learned words yet'
                        : 'No vocabulary words yet'
                    }
                  </p>
                  {!searchTerm && (
                    <a
                      href="/practice"
                      className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
                    >
                      <BookOpen className="h-4 w-4" />
                      Start learning words
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Quiz Modal */}
      {showReviewQuiz && (
        <ReviewQuizModal onClose={() => setShowReviewQuiz(false)} />
      )}
    </>
  );
}