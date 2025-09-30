// Mock data for testing frontend integration
export const mockDashboardStats = {
  total_policies: 12,
  total_quizzes: 8,
  total_games: 5,
  total_training_modules: 6,
  user_progress: {
    policies_acknowledged: 8,
    quizzes_completed: 5,
    games_played: 3,
    training_completed: 4
  }
};

export const mockDailyTip = "Always use strong, unique passwords for each account. Consider using a password manager to generate and store complex passwords securely.";

export const mockPolicies = [
  {
    id: 1,
    title: "Acceptable Use Policy",
    content: "This policy outlines the acceptable use of company resources...",
    category: "General",
    priority: "high",
    status: "published",
    acknowledged: false
  },
  {
    id: 2,
    title: "Password Policy",
    content: "Strong password requirements and management...",
    category: "Security",
    priority: "high",
    status: "published",
    acknowledged: true
  }
];

export const mockQuizzes = [
  {
    id: 1,
    title: "Basic Security Quiz",
    description: "Test your basic security knowledge",
    category: "General",
    difficulty: "beginner",
    time_limit: 30,
    passing_score: 70,
    questions_count: 10
  },
  {
    id: 2,
    title: "Phishing Awareness",
    description: "Learn to identify phishing attempts",
    category: "Social Engineering",
    difficulty: "intermediate",
    time_limit: 45,
    passing_score: 80,
    questions_count: 15
  }
];

export const mockGames = [
  {
    id: 1,
    title: "Phishing Spotter",
    description: "Identify phishing emails and scams",
    category: "Social Engineering",
    difficulty: "beginner",
    estimated_time: 10
  },
  {
    id: 2,
    title: "Password Strength Tester",
    description: "Test and improve password strength",
    category: "Authentication",
    difficulty: "beginner",
    estimated_time: 5
  }
];

export const mockTrainingModules = [
  {
    id: 1,
    title: "Security Fundamentals",
    description: "Basic security concepts and best practices",
    category: "General",
    duration: 30,
    prerequisites: [],
    status: "available"
  },
  {
    id: 2,
    title: "Data Protection",
    description: "Protecting sensitive company and customer data",
    category: "Data Security",
    duration: 45,
    prerequisites: ["Security Fundamentals"],
    status: "available"
  }
];
