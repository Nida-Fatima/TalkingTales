import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { StoryPractice } from './pages/StoryPractice';
import { SavedStories } from './pages/SavedStories';
import { VocabularyJournal } from './pages/VocabularyJournal';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { CloudStoriesProvider } from './contexts/CloudStoriesContext';
import { CloudVocabularyProvider } from './contexts/CloudVocabularyContext';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <LanguageProvider>
          <CloudVocabularyProvider>
            <CloudStoriesProvider>
              <Router>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                  <Navigation />
                  <main className="pt-20">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/practice" element={<StoryPractice />} />
                      <Route path="/stories" element={<SavedStories />} />
                      <Route path="/vocabulary" element={<VocabularyJournal />} />
                    </Routes>
                  </main>
                </div>
              </Router>
            </CloudStoriesProvider>
          </CloudVocabularyProvider>
        </LanguageProvider>
      </AuthGuard>
    </AuthProvider>
  );
}

export default App;