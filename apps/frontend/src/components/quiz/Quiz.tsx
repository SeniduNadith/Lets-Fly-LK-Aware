import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  id: number;
  title: string;
  description: string;
  questions: Question[];
  passingScore: number;
  timeLimit: number; // in minutes
}

const Quiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [score, setScore] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quiz data
  const { data: quiz, isLoading, error } = useQuery<QuizData>(['quiz', id], async () => {
    const response = await fetch(`/api/quizzes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch quiz');
    const json = await response.json();
    const raw: any = json?.data ?? json;

    const normalizedQuestions = Array.isArray(raw?.questions)
      ? raw.questions.map((q: any) => {
          if (Array.isArray(q?.options)) {
            return q;
          }
          const optionKeys = ['a', 'b', 'c', 'd'];
          const options = optionKeys
            .map((k) => q?.[`option_${k}`])
            .filter((v) => typeof v === 'string' && v.length > 0);
          const correctIndex =
            typeof q?.correctAnswer === 'number'
              ? q.correctAnswer
              : typeof q?.correct_option_index === 'number'
              ? q.correct_option_index
              : typeof q?.correct_option === 'string'
              ? ['A', 'B', 'C', 'D'].indexOf(q.correct_option)
              : undefined;
          return {
            id: q?.id ?? q?.question_id ?? 0,
            question: q?.question ?? q?.question_text ?? '',
            options: options.length ? options : Array.isArray(q?.options) ? q.options : [],
            correctAnswer: correctIndex ?? 0,
            explanation: q?.explanation ?? ''
          } as Question;
        })
      : [];

    const normalized: QuizData = {
      id: raw?.id ?? Number(id),
      title: raw?.title ?? 'Quiz',
      description: raw?.description ?? '',
      questions: normalizedQuestions,
      passingScore: raw?.passingScore ?? raw?.passing_score ?? 70,
      timeLimit: raw?.timeLimit ?? raw?.time_limit ?? 30
    };

    return normalized;
  });

  // Set up timer
  useEffect(() => {
    if (!quiz) return;
    
    const minutes = (quiz.timeLimit ?? 30); // default 30min
    setTimeLeft(minutes * 60);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quiz]);

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];
  const totalQuestions = quiz?.questions?.length || 0;
  const progress = totalQuestions ? ((currentQuestionIndex + 1) / totalQuestions) * 100 : 0;

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(answers[currentQuestionIndex + 1] ?? null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setSelectedOption(answers[currentQuestionIndex - 1] ?? null);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // In a real app, you would submit to your API
      const correctAnswers = quiz?.questions.reduce((acc, question, index) => {
        return acc + (answers[index] === question.correctAnswer ? 1 : 0);
      }, 0) || 0;
      
      const calculatedScore = Math.round((correctAnswers / totalQuestions) * 100);
      setScore(calculatedScore);
      
      // Save quiz result
      await fetch('/api/quiz-results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // No auth token needed in simplified mode
        },
        body: JSON.stringify({
          quizId: id,
          score: calculatedScore,
          passed: calculatedScore >= (quiz?.passingScore || 70),
          answers
        })
      });
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Failed to load quiz. Please try again later.
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Retry
        </button>
      </div>
    );
  }

  if (score !== null) {
    const passed = score >= (quiz?.passingScore || 70);
    
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className={`p-8 rounded-lg text-center ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-white mb-4">
            {passed ? (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600" />
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {passed ? 'Quiz Completed!' : 'Quiz Failed'}
          </h2>
          <p className="text-gray-600 mb-6">
            Your score: <span className={`font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
              {score}%
            </span>
          </p>
          <p className="text-gray-600 mb-8">
            {passed 
              ? `Congratulations! You passed the ${quiz?.title} quiz.`
              : `You need at least ${quiz?.passingScore}% to pass. Please review the material and try again.`}
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Dashboard
            </button>
            {!passed && (
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{quiz?.title}</h1>
          <p className="text-gray-600">{quiz?.description}</p>
        </div>
        <div className="ml-auto bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="mb-6 bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <h2 className="text-xl font-semibold text-gray-900 mt-1">
            {currentQuestion?.question}
          </h2>
        </div>

        <div className="space-y-3">
          {(currentQuestion?.options ?? []).map((option, index) => (
            <button
              key={index}
              className={`w-full text-left p-4 rounded-lg border ${
                selectedOption === index 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              } transition-colors`}
              onClick={() => handleOptionSelect(index)}
            >
              <div className="flex items-center">
                <div className={`flex items-center justify-center h-5 w-5 rounded-full border mr-3 ${
                  selectedOption === index 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-400'
                }`}>
                  {selectedOption === index && (
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-800">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className={`px-4 py-2 rounded-md ${
            currentQuestionIndex === 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:bg-blue-50'
          }`}
        >
          Previous
        </button>
        
        {currentQuestionIndex < totalQuestions - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={selectedOption === null}
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            disabled={selectedOption === null || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;
