import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Brain, RotateCcw, Shuffle } from 'lucide-react';
import { useCloudVocabulary } from '../contexts/CloudVocabularyContext';

interface ReviewQuizModalProps {
  onClose: () => void;
}

interface ReviewQuestion {
  id: string;
  word: any;
  question: string;
  options: string[];
  correctAnswer: string;
}

export function ReviewQuizModal({ onClose }: ReviewQuizModalProps) {
  const { getRandomWordsForReview, markWordAsLearned, markWordAsIncorrect } = useCloudVocabulary();
  const [questions, setQuestions] = useState<ReviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const generateReviewQuestions = () => {
      const wordsToReview = getRandomWordsForReview(5);
      
      if (wordsToReview.length === 0) {
        setIsComplete(true);
        return;
      }

      const reviewQuestions: ReviewQuestion[] = wordsToReview.map((word, index) => {
        // Create wrong options from other learned words
        const allWords = getRandomWordsForReview(20);
        const wrongOptions = allWords
          .filter(w => w.text !== word.text)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.translation);
        
        const options = [word.translation, ...wrongOptions].sort(() => Math.random() - 0.5);

        return {
          id: `review-${index}`,
          word,
          question: `What does "${word.text}" mean?`,
          options,
          correctAnswer: word.translation
        };
      });

      setQuestions(reviewQuestions);
    };

    generateReviewQuestions();
  }, [getRandomWordsForReview]);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      markWordAsLearned(currentQuestion.word, currentQuestion.word.storyId);
    } else {
      markWordAsIncorrect(currentQuestion.word.text);
    }

    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    } else {
      setIsComplete(true);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowFeedback(false);
    setScore(0);
    setIsComplete(false);
    
    // Generate new questions
    const wordsToReview = getRandomWordsForReview(5);
    const reviewQuestions: ReviewQuestion[] = wordsToReview.map((word, index) => {
      const allWords = getRandomWordsForReview(20);
      const wrongOptions = allWords
        .filter(w => w.text !== word.text)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.translation);
      
      const options = [word.translation, ...wrongOptions].sort(() => Math.random() - 0.5);

      return {
        id: `review-${index}`,
        word,
        question: `What does "${word.text}" mean?`,
        options,
        correctAnswer: word.translation
      };
    });

    setQuestions(reviewQuestions);
  };

  if (questions.length === 0 && !isComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Brain className="h-12 w-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Words to Review
            </h3>
            <p className="text-gray-600 mb-4">
              You need to learn some words first before you can review them!
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const getScoreEmoji = () => {
      const percentage = (score / questions.length) * 100;
      if (percentage >= 90) return '🏆';
      if (percentage >= 80) return '🎉';
      if (percentage >= 70) return '👍';
      if (percentage >= 60) return '😊';
      return '💪';
    };

    const getScoreMessage = () => {
      const percentage = (score / questions.length) * 100;
      if (percentage >= 90) return 'Perfect review! Your memory is excellent!';
      if (percentage >= 80) return 'Great review! You remember most words well!';
      if (percentage >= 70) return 'Good review! Keep practicing regularly!';
      if (percentage >= 60) return 'Nice effort! Some words need more practice!';
      return 'Keep reviewing! Regular practice helps memory!';
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Review Complete!</h3>
            <p className="text-lg text-gray-600 mb-4">{getScoreMessage()}</p>
            
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {score} out of {questions.length}
              </div>
              <div className="text-sm text-purple-700">
                {Math.round((score / questions.length) * 100)}% remembered
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleRetakeQuiz}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                <Shuffle className="h-4 w-4" />
                New Words
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-800">Review Quiz</h3>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-lg text-sm font-medium">
              {currentQuestionIndex + 1}/{questions.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-700">Progress:</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Word Info */}
        <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{currentQuestion.word.emoji}</span>
            <div>
              <div className="text-sm text-purple-700">
                Learned from: {currentQuestion.word.storyId}
              </div>
              <div className="text-xs text-purple-600">
                Correct: {currentQuestion.word.timesCorrect}x | 
                Incorrect: {currentQuestion.word.timesIncorrect}x
              </div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            {currentQuestion.question}
          </h4>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                disabled={showFeedback}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                } ${showFeedback ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              selectedAnswer === currentQuestion.correctAnswer
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  selectedAnswer === currentQuestion.correctAnswer
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {selectedAnswer === currentQuestion.correctAnswer
                    ? 'Correct! You remember this word! 🎉'
                    : 'Not quite right. Keep practicing! 💪'
                  }
                </span>
              </div>
              <p className={`text-sm ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {currentQuestion.word.emoji} "{currentQuestion.word.text}" means "{currentQuestion.word.translation}"
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Review'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}