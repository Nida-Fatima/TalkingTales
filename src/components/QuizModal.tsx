import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, Brain, Trophy, RotateCcw } from 'lucide-react';
import { Story, Word } from '../types';
import { useCloudVocabulary } from '../contexts/CloudVocabularyContext';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'emoji-clue' | 'fill-blank' | 'audio-challenge';
  question: string;
  options?: string[];
  correctAnswer: string;
  word: Word;
  explanation?: string;
}

interface QuizModalProps {
  story: Story;
  onClose: () => void;
}

export function QuizModal({ story, onClose }: QuizModalProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean; word: Word }[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [score, setScore] = useState(0);
  
  const { markWordAsLearned } = useCloudVocabulary();

  // Generate quiz questions from story vocabulary
  useEffect(() => {
    const generateQuestions = () => {
      const allWords = story.dialogue.flatMap(line => line.words);
      const uniqueWords = allWords.filter((word, index, self) => 
        self.findIndex(w => w.text.toLowerCase() === word.text.toLowerCase()) === index &&
        word.text.length > 2 && // Skip very short words
        !['der', 'die', 'das', 'und', 'ist', 'sind', 'haben', 'Sie', 'ich', 'wir'].includes(word.text)
      );
      
      // Select 5 random words for the quiz
      const selectedWords = uniqueWords
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(5, uniqueWords.length));

      const quizQuestions: QuizQuestion[] = selectedWords.map((word, index) => {
        const questionTypes: QuizQuestion['type'][] = ['multiple-choice', 'emoji-clue', 'fill-blank'];
        const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

        switch (randomType) {
          case 'multiple-choice':
            return generateMultipleChoiceQuestion(word, uniqueWords, index);
          case 'emoji-clue':
            return generateEmojiClueQuestion(word, index);
          case 'fill-blank':
            return generateFillBlankQuestion(word, story, index);
          default:
            return generateMultipleChoiceQuestion(word, uniqueWords, index);
        }
      });

      setQuestions(quizQuestions);
    };

    generateQuestions();
  }, [story]);

  const generateMultipleChoiceQuestion = (word: Word, allWords: Word[], index: number): QuizQuestion => {
    const otherWords = allWords.filter(w => w.text !== word.text);
    const wrongOptions = otherWords
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map(w => w.translation);
    
    const options = [word.translation, ...wrongOptions].sort(() => Math.random() - 0.5);

    return {
      id: `q${index}`,
      type: 'multiple-choice',
      question: `What does "${word.text}" mean?`,
      options,
      correctAnswer: word.translation,
      word,
      explanation: `"${word.text}" means "${word.translation}" ${word.emoji}`
    };
  };

  const generateEmojiClueQuestion = (word: Word, index: number): QuizQuestion => {
    return {
      id: `q${index}`,
      type: 'emoji-clue',
      question: `Which German word matches this clue: ${word.emoji} (${word.translation})?`,
      correctAnswer: word.text,
      word,
      explanation: `${word.emoji} "${word.text}" means "${word.translation}"`
    };
  };

  const generateFillBlankQuestion = (word: Word, story: Story, index: number): QuizQuestion => {
    // Find a sentence containing this word
    const sentenceWithWord = story.dialogue.find(line => 
      line.words.some(w => w.text.toLowerCase() === word.text.toLowerCase())
    );

    if (sentenceWithWord) {
      const sentence = sentenceWithWord.text.replace(
        new RegExp(`\\b${word.text}\\b`, 'gi'), 
        '____'
      );

      return {
        id: `q${index}`,
        type: 'fill-blank',
        question: `Fill in the blank: "${sentence}"`,
        correctAnswer: word.text,
        word,
        explanation: `The missing word is "${word.text}" which means "${word.translation}" ${word.emoji}`
      };
    }

    // Fallback to multiple choice if no sentence found
    return generateMultipleChoiceQuestion(word, [word], index);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      correct: isCorrect,
      word: currentQuestion.word
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowFeedback(true);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    } else {
      // Quiz complete
      setIsComplete(true);
      
      // Mark correctly answered words as learned
      for (const answer of answers) {
        if (answer.correct) {
          await markWordAsLearned(answer.word, story.id);
        }
      }
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowFeedback(false);
    setAnswers([]);
    setIsComplete(false);
    setScore(0);
  };

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
    if (percentage >= 90) return 'Outstanding! You\'re a German master!';
    if (percentage >= 80) return 'Excellent work! Keep it up!';
    if (percentage >= 70) return 'Good job! You\'re making great progress!';
    if (percentage >= 60) return 'Nice effort! Practice makes perfect!';
    return 'Keep practicing! You\'ll get there!';
  };

  if (questions.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <Brain className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Generating Quiz...
            </h3>
            <p className="text-gray-600">
              Creating questions from your story vocabulary.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="text-6xl mb-4">{getScoreEmoji()}</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Quiz Complete!</h3>
            <p className="text-lg text-gray-600 mb-4">{getScoreMessage()}</p>
            
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {score} out of {questions.length}
              </div>
              <div className="text-sm text-blue-700">
                {Math.round((score / questions.length) * 100)}% correct
              </div>
            </div>

            {score > 0 && (
              <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center gap-2 justify-center mb-2">
                  <Trophy className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Words Learned!</span>
                </div>
                <p className="text-sm text-green-700">
                  {score} new word{score !== 1 ? 's' : ''} added to your vocabulary dictionary
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleRetakeQuiz}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
              >
                <RotateCcw className="h-4 w-4" />
                Retake
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200"
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
            <h3 className="text-xl font-semibold text-gray-800">Mini Quiz</h3>
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

        {/* Question */}
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            {currentQuestion.question}
          </h4>

          {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
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
          )}

          {currentQuestion.type === 'emoji-clue' && (
            <div className="space-y-4">
              <div className="text-center p-6 bg-gray-50 rounded-xl">
                <div className="text-4xl mb-2">{currentQuestion.word.emoji}</div>
                <div className="text-gray-600">{currentQuestion.word.translation}</div>
              </div>
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Type the German word..."
                disabled={showFeedback}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          )}

          {currentQuestion.type === 'fill-blank' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-blue-900 font-medium text-lg">
                  {currentQuestion.question.replace('Fill in the blank: "', '').replace('"', '')}
                </p>
              </div>
              <input
                type="text"
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Fill in the blank..."
                disabled={showFeedback}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          )}
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className="mb-6">
            <div className={`p-4 rounded-xl border-2 ${
              selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim() ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
                    ? 'text-green-800'
                    : 'text-red-800'
                }`}>
                  {selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
                    ? 'Correct! 🎉'
                    : 'Not quite right 💪'
                  }
                </span>
              </div>
              <p className={`text-sm ${
                selectedAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim()
                  ? 'text-green-700'
                  : 'text-red-700'
              }`}>
                {currentQuestion.explanation}
              </p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          {!showFeedback ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer.trim()}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-purple-700 transition-colors duration-200"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}