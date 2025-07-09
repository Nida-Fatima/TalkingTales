import React, { useState } from 'react';
import { Search, BookOpen, Trash2, Calendar, Play, Filter } from 'lucide-react';
import { useCloudStories } from '../contexts/CloudStoriesContext';
import { Story } from '../types';

export function SavedStories() {
  const { savedStories, removeStory } = useCloudStories();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const filteredStories = savedStories.filter(story =>
    story.situation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStorySelect = (story: Story) => {
    setSelectedStory(story);
  };

  const handleStoryDelete = (storyId: string) => {
    removeStory(storyId);
    if (selectedStory?.id === storyId) {
      setSelectedStory(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-xl">
            <BookOpen className="h-8 w-8 text-white" />
          </div>
          Saved Stories
        </h1>
        <p className="text-gray-600">
          Review and practice your saved German dialogues
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Story List */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>
          </div>

          {/* Story Cards */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                Your Stories ({filteredStories.length})
              </h2>
            </div>

            {filteredStories.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                {filteredStories.map((story) => (
                  <div
                    key={story.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                      selectedStory?.id === story.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleStorySelect(story)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {story.situation.title.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-800 truncate">
                          {story.situation.title}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {story.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Calendar className="h-3 w-3" />
                          {story.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStoryDelete(story.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">
                  {searchTerm ? 'No stories match your search' : 'No saved stories yet'}
                </p>
                {!searchTerm && (
                  <a
                    href="/practice"
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
                  >
                    <BookOpen className="h-4 w-4" />
                    Create your first story
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Story Preview */}
        <div className="lg:col-span-2">
          {selectedStory ? (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedStory.title}</h2>
                    <p className="text-blue-100 text-sm">
                      {selectedStory.language.flag} {selectedStory.language.name} • {selectedStory.situation.title}
                    </p>
                  </div>
                  <a
                    href="/practice"
                    className="flex items-center gap-2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-xl font-medium hover:bg-opacity-30 transition-all duration-200"
                  >
                    <Play className="h-4 w-4" />
                    Practice
                  </a>
                </div>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto custom-scrollbar">
                <div className="space-y-4">
                  {selectedStory.dialogue.map((line, index) => (
                    <div
                      key={line.id}
                      className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          index % 2 === 0
                            ? 'bg-gray-100 text-gray-800 rounded-bl-sm'
                            : 'bg-blue-600 text-white rounded-br-sm'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">{line.character.avatar}</span>
                          <span className="text-xs font-medium opacity-75">
                            {line.character.name} ({line.character.role})
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {line.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full">
                  <BookOpen className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Select a Story</h3>
                <p className="text-gray-600 max-w-md">
                  Choose a story from your saved collection to review the dialogue and practice again.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}