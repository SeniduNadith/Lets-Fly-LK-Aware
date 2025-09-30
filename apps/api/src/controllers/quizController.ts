import { Request, Response } from 'express';
import { executeQuery, getConnection, executeTransaction } from '../config/database';
import { logger } from '../config/logger';
import { asyncHandler } from '../middleware/errorHandler';
import '../middleware/auth'; // Import to get the Request type extension

interface Quiz {
  id: number;
  title: string;
  description: string;
  role_id: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  time_limit: number;
  passing_score: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

interface QuizQuestion {
  id: number;
  quiz_id: number;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank';
  points: number;
  order_index: number;
}

interface QuizAnswer {
  id: number;
  question_id: number;
  answer_text: string;
  is_correct: boolean;
  order_index: number;
}

interface QuizAttempt {
  id: number;
  user_id: number;
  quiz_id: number;
  started_at: Date;
  completed_at?: Date;
  score?: number;
  max_score?: number;
  passed?: boolean;
  time_taken?: number;
  answers: any;
}

// Get all quizzes with filtering
export const getQuizzes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { category, difficulty, role_id, search } = req.query;
  const userId = req.user?.id;

  let query = `
    SELECT q.*, r.name as role_name,
           CASE WHEN qa.user_id IS NOT NULL THEN TRUE ELSE FALSE END as attempted,
           qa.score as best_score,
           qa.passed as best_result
    FROM quizzes q
    LEFT JOIN roles r ON q.role_id = r.id
    LEFT JOIN (
      SELECT user_id, quiz_id, MAX(score) as score, MAX(passed) as passed
      FROM quiz_attempts 
      WHERE user_id = ?
      GROUP BY user_id, quiz_id
    ) qa ON q.id = qa.quiz_id
    WHERE q.is_active = TRUE
  `;
  
  const params: any[] = [userId];

  if (category) {
    query += ' AND q.category = ?';
    params.push(category);
  }

  if (difficulty) {
    query += ' AND q.difficulty = ?';
    params.push(difficulty);
  }

  if (role_id) {
    query += ' AND q.role_id = ?';
    params.push(role_id);
  }

  if (search) {
    query += ' AND (q.title LIKE ? OR q.description LIKE ?)';
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm);
  }

  query += ' ORDER BY q.difficulty ASC, q.created_at DESC';

  try {
    const quizzes = await executeQuery<any[]>(query, params);
    
    logger.info(`Retrieved ${quizzes.length} quizzes for user ${userId}`);
    
    res.json({
      success: true,
      data: quizzes,
      count: quizzes.length
    });
  } catch (error) {
    logger.error('Error retrieving quizzes:', error);
    res.status(500).json({ error: 'Failed to retrieve quizzes' });
  }
});

// Get quiz by ID with questions and answers
export const getQuizById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Get quiz details
    const quizzes = await executeQuery<Quiz[]>(`
      SELECT q.*, r.name as role_name
      FROM quizzes q
      LEFT JOIN roles r ON q.role_id = r.id
      WHERE q.id = ? AND q.is_active = TRUE
    `, [id]);

    if (quizzes.length === 0) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    const quiz = quizzes[0];

    // Get questions
    const questions = await executeQuery<QuizQuestion[]>(`
      SELECT * FROM quiz_questions 
      WHERE quiz_id = ? 
      ORDER BY order_index ASC
    `, [id]);

    // Get answers for each question
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const answers = await executeQuery<QuizAnswer[]>(`
          SELECT * FROM quiz_answers 
          WHERE question_id = ? 
          ORDER BY order_index ASC
        `, [question.id]);
        
        return {
          ...question,
          answers: answers
        };
      })
    );

    // Get user's previous attempts
    const attempts = await executeQuery<QuizAttempt[]>(`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? AND quiz_id = ?
      ORDER BY started_at DESC
    `, [userId, id]);

    logger.info(`Retrieved quiz ${id} for user ${userId}`);

    res.json({
      success: true,
      data: {
        ...quiz,
        questions: questionsWithAnswers,
        previous_attempts: attempts
      }
    });
  } catch (error) {
    logger.error('Error retrieving quiz:', error);
    res.status(500).json({ error: 'Failed to retrieve quiz' });
  }
});

// Start a new quiz attempt
export const startQuiz = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    // Check if quiz exists and is active
    const quizzes = await executeQuery<Quiz[]>(`
      SELECT * FROM quizzes WHERE id = ? AND is_active = TRUE
    `, [id]);

    if (quizzes.length === 0) {
      res.status(404).json({ error: 'Quiz not found or inactive' });
      return;
    }

    // Check if user has an incomplete attempt
    const incompleteAttempts = await executeQuery<QuizAttempt[]>(`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? AND quiz_id = ? AND completed_at IS NULL
    `, [userId, id]);

    if (incompleteAttempts.length > 0) {
      // Always clear incomplete attempts for now to simplify development
      await executeQuery(`
        DELETE FROM quiz_attempts 
        WHERE user_id = ? AND quiz_id = ? AND completed_at IS NULL
      `, [userId, id]);
      
      logger.info(`Cleared ${incompleteAttempts.length} incomplete attempts for user ${userId}, quiz ${id}`);
    }

    // Create new attempt
    const result = await executeQuery<any>(`
      INSERT INTO quiz_attempts (user_id, quiz_id, started_at)
      VALUES (?, ?, NOW())
    `, [userId, id]);

    logger.info(`Quiz ${id} started by user ${userId}`);

    res.json({
      success: true,
      message: 'Quiz started successfully',
      attempt_id: result.insertId
    });
  } catch (error) {
    logger.error('Error starting quiz:', error);
    res.status(500).json({ error: 'Failed to start quiz' });
  }
});

// Submit quiz attempt
export const submitQuiz = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { attempt_id, answers, time_taken } = req.body;
  const userId = req.user?.id;

  try {
    // Validate attempt
    const attempts = await executeQuery<QuizAttempt[]>(`
      SELECT * FROM quiz_attempts 
      WHERE id = ? AND user_id = ? AND quiz_id = ? AND completed_at IS NULL
    `, [attempt_id, userId, id]);

    if (attempts.length === 0) {
      res.status(400).json({ error: 'Invalid or completed attempt' });
      return;
    }

    // Get quiz details and questions
    const quiz = await executeQuery<Quiz[]>(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);

    const questions = await executeQuery<QuizQuestion[]>(`
      SELECT * FROM quiz_questions WHERE quiz_id = ?
    `, [id]);

    // Calculate score
    let score = 0;
    let maxScore = 0;

    for (const question of questions) {
      maxScore += question.points;
      
      if (answers[question.id]) {
        const correctAnswers = await executeQuery<QuizAnswer[]>(`
          SELECT * FROM quiz_answers 
          WHERE question_id = ? AND is_correct = TRUE
        `, [question.id]);

        // Check if user's answer matches any correct answer
        const userAnswer = answers[question.id];
        const isCorrect = correctAnswers.some(correct => 
          correct.answer_text === userAnswer || 
          (Array.isArray(userAnswer) && userAnswer.includes(correct.answer_text))
        );

        if (isCorrect) {
          score += question.points;
        }
      }
    }

    const passed = score >= quiz[0].passing_score;

    // Update attempt
    await executeQuery(`
      UPDATE quiz_attempts 
      SET completed_at = NOW(), score = ?, max_score = ?, passed = ?, 
          time_taken = ?, answers = ?
      WHERE id = ?
    `, [score, maxScore, passed, time_taken, JSON.stringify(answers), attempt_id]);

    logger.info(`Quiz ${id} completed by user ${userId} with score ${score}/${maxScore}`);

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      data: {
        score,
        max_score: maxScore,
        percentage: Math.round((score / maxScore) * 100),
        passed,
        time_taken
      }
    });
  } catch (error) {
    logger.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

// Get quiz results
export const getQuizResults = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  try {
    const attempts = await executeQuery<QuizAttempt[]>(`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? AND quiz_id = ? AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
    `, [userId, id]);

    if (attempts.length === 0) {
      res.status(404).json({ error: 'No completed attempts found' });
      return;
    }

    const quiz = await executeQuery<Quiz[]>(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);

    logger.info(`Quiz results retrieved for user ${userId}, quiz ${id}`);

    res.json({
      success: true,
      data: {
        quiz: quiz[0],
        attempts: attempts,
        best_score: Math.max(...attempts.map(a => a.score || 0)),
        total_attempts: attempts.length
      }
    });
  } catch (error) {
    logger.error('Error retrieving quiz results:', error);
    res.status(500).json({ error: 'Failed to retrieve quiz results' });
  }
});

// Create new quiz (admin only)
export const createQuiz = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { title, description, role_id, category, difficulty, time_limit, passing_score, questions } = req.body;
  const createdBy = (req as any).user?.id;
  const isProduction = (process.env.NODE_ENV || 'development') === 'production';
  const userRoleId = (req as any).user?.role_id;

  try {
    // Validate required fields
    if (!title || !role_id || !category) {
      // Provide dev-friendly defaults
      if (!isProduction) {
        req.body.role_id = role_id || userRoleId || 1;
      } else {
        res.status(400).json({ error: 'Title, role_id, and category are required' });
        return;
      }
    }

    // In development, allow creating a quiz without questions
    const safeQuestions: any[] = Array.isArray(questions) ? questions : (isProduction ? [] : []);

    // Use executeTransaction instead of manual transaction handling
    const queries = [
      {
        query: `INSERT INTO quizzes (title, description, role_id, category, difficulty, time_limit, passing_score)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params: [
          title,
          description,
          role_id || userRoleId || 1,
          category,
          difficulty || 'beginner',
          time_limit || 0,
          passing_score || 70
        ]
      }
    ];

    // Add question queries if there are questions
    if (safeQuestions.length > 0) {
      // We'll need to handle this differently since we need the quiz ID
      // For now, create quiz without questions and handle questions separately
    }

    const results = await executeTransaction<any>(queries);
    const quizId = (results[0] as any).insertId;

    // Handle questions separately if any
    if (safeQuestions.length > 0) {
      for (let i = 0; i < safeQuestions.length; i++) {
        const question = safeQuestions[i];
        const questionQueries = [
          {
            query: `INSERT INTO quiz_questions (quiz_id, question_text, question_type, points, order_index)
                    VALUES (?, ?, ?, ?, ?)`,
            params: [quizId, question.question_text || '', question.question_type || 'multiple_choice', question.points || 1, i]
          }
        ];

        const questionResults = await executeTransaction<any>(questionQueries);
        const questionId = (questionResults[0] as any).insertId;

        if (question.answers && Array.isArray(question.answers)) {
          for (let j = 0; j < question.answers.length; j++) {
            const answer = question.answers[j];
            await executeQuery(
              `INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)`,
              [questionId, answer.answer_text || '', answer.is_correct || false, j]
            );
          }
        }
      }
    }

    logger.info(`Quiz created with ID ${quizId} by user ${createdBy}`);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz_id: quizId
    });
  } catch (error) {
    logger.error('Error creating quiz:', error);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
});

// Update quiz (admin only)
export const updateQuiz = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, role_id, category, difficulty, time_limit, passing_score, is_active } = req.body;
  const updatedBy = (req as any).user?.id;

  try {
    // Check if quiz exists
    const existingQuizzes = await executeQuery<Quiz[]>(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);

    if (existingQuizzes.length === 0) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Ensure no undefined values are passed to the database
    const updateParams = [
      title || null,
      description || null,
      role_id || 1, // Default to role_id 1 (admin) if not provided
      category || 'General Security', // Default category
      difficulty || 'beginner', // Default difficulty
      time_limit || 30, // Default time limit
      passing_score || 70, // Default passing score
      is_active !== undefined ? is_active : true, // Default to active if not specified
      id
    ];

    // Update quiz
    await executeQuery(`
      UPDATE quizzes 
      SET title = ?, description = ?, role_id = ?, category = ?, difficulty = ?, 
          time_limit = ?, passing_score = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, updateParams);

    logger.info(`Quiz ${id} updated by user ${updatedBy}`);

    res.json({
      success: true,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    logger.error('Error updating quiz:', error);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
});

// Clear incomplete attempts (development only)
export const clearIncompleteAttempts = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user?.id;
  const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';

  if (!isDevelopment) {
    res.status(403).json({ error: 'This endpoint is only available in development mode' });
    return;
  }

  try {
    const result = await executeQuery<any>(`
      DELETE FROM quiz_attempts 
      WHERE user_id = ? AND completed_at IS NULL
    `, [userId]);

    logger.info(`Cleared ${result.affectedRows} incomplete attempts for user ${userId}`);

    res.json({
      success: true,
      message: `Cleared ${result.affectedRows} incomplete attempts`,
      cleared_count: result.affectedRows
    });
  } catch (error) {
    logger.error('Error clearing incomplete attempts:', error);
    res.status(500).json({ error: 'Failed to clear incomplete attempts' });
  }
});

// Delete quiz (admin only)
export const deleteQuiz = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const deletedBy = (req as any).user?.id;

  try {
    // Check if quiz exists
    const existingQuizzes = await executeQuery<Quiz[]>(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);

    if (existingQuizzes.length === 0) {
      res.status(404).json({ error: 'Quiz not found' });
      return;
    }

    // Check if quiz has attempts
    const attempts = await executeQuery<any[]>(`
      SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ?
    `, [id]);

    if (attempts[0].count > 0) {
      // Soft delete by deactivating
      await executeQuery(`
        UPDATE quizzes SET is_active = FALSE, updated_at = NOW() WHERE id = ?
      `, [id]);
    } else {
      // Hard delete if no attempts
      await executeQuery('DELETE FROM quiz_answers WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ?)', [id]);
      await executeQuery('DELETE FROM quiz_questions WHERE quiz_id = ?', [id]);
      await executeQuery('DELETE FROM quizzes WHERE id = ?', [id]);
    }

    logger.info(`Quiz ${id} deleted by user ${deletedBy}`);

    res.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting quiz:', error);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
});
