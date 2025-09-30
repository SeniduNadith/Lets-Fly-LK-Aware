"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteQuiz = exports.clearIncompleteAttempts = exports.updateQuiz = exports.createQuiz = exports.getQuizResults = exports.submitQuiz = exports.startQuiz = exports.getQuizById = exports.getQuizzes = void 0;
const database_1 = require("../config/database");
const logger_1 = require("../config/logger");
const errorHandler_1 = require("../middleware/errorHandler");
require("../middleware/auth");
exports.getQuizzes = (0, errorHandler_1.asyncHandler)(async (req, res) => {
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
    const params = [userId];
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
        const quizzes = await (0, database_1.executeQuery)(query, params);
        logger_1.logger.info(`Retrieved ${quizzes.length} quizzes for user ${userId}`);
        res.json({
            success: true,
            data: quizzes,
            count: quizzes.length
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving quizzes:', error);
        res.status(500).json({ error: 'Failed to retrieve quizzes' });
    }
});
exports.getQuizById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const quizzes = await (0, database_1.executeQuery)(`
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
        const questions = await (0, database_1.executeQuery)(`
      SELECT * FROM quiz_questions 
      WHERE quiz_id = ? 
      ORDER BY order_index ASC
    `, [id]);
        const questionsWithAnswers = await Promise.all(questions.map(async (question) => {
            const answers = await (0, database_1.executeQuery)(`
          SELECT * FROM quiz_answers 
          WHERE question_id = ? 
          ORDER BY order_index ASC
        `, [question.id]);
            return {
                ...question,
                answers: answers
            };
        }));
        const attempts = await (0, database_1.executeQuery)(`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? AND quiz_id = ?
      ORDER BY started_at DESC
    `, [userId, id]);
        logger_1.logger.info(`Retrieved quiz ${id} for user ${userId}`);
        res.json({
            success: true,
            data: {
                ...quiz,
                questions: questionsWithAnswers,
                previous_attempts: attempts
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving quiz:', error);
        res.status(500).json({ error: 'Failed to retrieve quiz' });
    }
});
exports.startQuiz = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const quizzes = await (0, database_1.executeQuery)(`
      SELECT * FROM quizzes WHERE id = ? AND is_active = TRUE
    `, [id]);
        if (quizzes.length === 0) {
            res.status(404).json({ error: 'Quiz not found or inactive' });
            return;
        }
        const incompleteAttempts = await (0, database_1.executeQuery)(`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? AND quiz_id = ? AND completed_at IS NULL
    `, [userId, id]);
        if (incompleteAttempts.length > 0) {
            await (0, database_1.executeQuery)(`
        DELETE FROM quiz_attempts 
        WHERE user_id = ? AND quiz_id = ? AND completed_at IS NULL
      `, [userId, id]);
            logger_1.logger.info(`Cleared ${incompleteAttempts.length} incomplete attempts for user ${userId}, quiz ${id}`);
        }
        const result = await (0, database_1.executeQuery)(`
      INSERT INTO quiz_attempts (user_id, quiz_id, started_at)
      VALUES (?, ?, NOW())
    `, [userId, id]);
        logger_1.logger.info(`Quiz ${id} started by user ${userId}`);
        res.json({
            success: true,
            message: 'Quiz started successfully',
            attempt_id: result.insertId
        });
    }
    catch (error) {
        logger_1.logger.error('Error starting quiz:', error);
        res.status(500).json({ error: 'Failed to start quiz' });
    }
});
exports.submitQuiz = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { attempt_id, answers, time_taken } = req.body;
    const userId = req.user?.id;
    try {
        const attempts = await (0, database_1.executeQuery)(`
      SELECT * FROM quiz_attempts 
      WHERE id = ? AND user_id = ? AND quiz_id = ? AND completed_at IS NULL
    `, [attempt_id, userId, id]);
        if (attempts.length === 0) {
            res.status(400).json({ error: 'Invalid or completed attempt' });
            return;
        }
        const quiz = await (0, database_1.executeQuery)(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);
        const questions = await (0, database_1.executeQuery)(`
      SELECT * FROM quiz_questions WHERE quiz_id = ?
    `, [id]);
        let score = 0;
        let maxScore = 0;
        for (const question of questions) {
            maxScore += question.points;
            if (answers[question.id]) {
                const correctAnswers = await (0, database_1.executeQuery)(`
          SELECT * FROM quiz_answers 
          WHERE question_id = ? AND is_correct = TRUE
        `, [question.id]);
                const userAnswer = answers[question.id];
                const isCorrect = correctAnswers.some(correct => correct.answer_text === userAnswer ||
                    (Array.isArray(userAnswer) && userAnswer.includes(correct.answer_text)));
                if (isCorrect) {
                    score += question.points;
                }
            }
        }
        const passed = score >= quiz[0].passing_score;
        await (0, database_1.executeQuery)(`
      UPDATE quiz_attempts 
      SET completed_at = NOW(), score = ?, max_score = ?, passed = ?, 
          time_taken = ?, answers = ?
      WHERE id = ?
    `, [score, maxScore, passed, time_taken, JSON.stringify(answers), attempt_id]);
        logger_1.logger.info(`Quiz ${id} completed by user ${userId} with score ${score}/${maxScore}`);
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
    }
    catch (error) {
        logger_1.logger.error('Error submitting quiz:', error);
        res.status(500).json({ error: 'Failed to submit quiz' });
    }
});
exports.getQuizResults = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    try {
        const attempts = await (0, database_1.executeQuery)(`
      SELECT * FROM quiz_attempts 
      WHERE user_id = ? AND quiz_id = ? AND completed_at IS NOT NULL
      ORDER BY completed_at DESC
    `, [userId, id]);
        if (attempts.length === 0) {
            res.status(404).json({ error: 'No completed attempts found' });
            return;
        }
        const quiz = await (0, database_1.executeQuery)(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);
        logger_1.logger.info(`Quiz results retrieved for user ${userId}, quiz ${id}`);
        res.json({
            success: true,
            data: {
                quiz: quiz[0],
                attempts: attempts,
                best_score: Math.max(...attempts.map(a => a.score || 0)),
                total_attempts: attempts.length
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving quiz results:', error);
        res.status(500).json({ error: 'Failed to retrieve quiz results' });
    }
});
exports.createQuiz = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, role_id, category, difficulty, time_limit, passing_score, questions } = req.body;
    const createdBy = req.user?.id;
    const isProduction = (process.env.NODE_ENV || 'development') === 'production';
    const userRoleId = req.user?.role_id;
    try {
        if (!title || !role_id || !category) {
            if (!isProduction) {
                req.body.role_id = role_id || userRoleId || 1;
            }
            else {
                res.status(400).json({ error: 'Title, role_id, and category are required' });
                return;
            }
        }
        const safeQuestions = Array.isArray(questions) ? questions : (isProduction ? [] : []);
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
        if (safeQuestions.length > 0) {
        }
        const results = await (0, database_1.executeTransaction)(queries);
        const quizId = results[0].insertId;
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
                const questionResults = await (0, database_1.executeTransaction)(questionQueries);
                const questionId = questionResults[0].insertId;
                if (question.answers && Array.isArray(question.answers)) {
                    for (let j = 0; j < question.answers.length; j++) {
                        const answer = question.answers[j];
                        await (0, database_1.executeQuery)(`INSERT INTO quiz_answers (question_id, answer_text, is_correct, order_index) VALUES (?, ?, ?, ?)`, [questionId, answer.answer_text || '', answer.is_correct || false, j]);
                    }
                }
            }
        }
        logger_1.logger.info(`Quiz created with ID ${quizId} by user ${createdBy}`);
        res.status(201).json({
            success: true,
            message: 'Quiz created successfully',
            quiz_id: quizId
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating quiz:', error);
        res.status(500).json({ error: 'Failed to create quiz' });
    }
});
exports.updateQuiz = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { title, description, role_id, category, difficulty, time_limit, passing_score, is_active } = req.body;
    const updatedBy = req.user?.id;
    try {
        const existingQuizzes = await (0, database_1.executeQuery)(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);
        if (existingQuizzes.length === 0) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        const updateParams = [
            title || null,
            description || null,
            role_id || 1,
            category || 'General Security',
            difficulty || 'beginner',
            time_limit || 30,
            passing_score || 70,
            is_active !== undefined ? is_active : true,
            id
        ];
        await (0, database_1.executeQuery)(`
      UPDATE quizzes 
      SET title = ?, description = ?, role_id = ?, category = ?, difficulty = ?, 
          time_limit = ?, passing_score = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `, updateParams);
        logger_1.logger.info(`Quiz ${id} updated by user ${updatedBy}`);
        res.json({
            success: true,
            message: 'Quiz updated successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error updating quiz:', error);
        res.status(500).json({ error: 'Failed to update quiz' });
    }
});
exports.clearIncompleteAttempts = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const isDevelopment = (process.env.NODE_ENV || 'development') === 'development';
    if (!isDevelopment) {
        res.status(403).json({ error: 'This endpoint is only available in development mode' });
        return;
    }
    try {
        const result = await (0, database_1.executeQuery)(`
      DELETE FROM quiz_attempts 
      WHERE user_id = ? AND completed_at IS NULL
    `, [userId]);
        logger_1.logger.info(`Cleared ${result.affectedRows} incomplete attempts for user ${userId}`);
        res.json({
            success: true,
            message: `Cleared ${result.affectedRows} incomplete attempts`,
            cleared_count: result.affectedRows
        });
    }
    catch (error) {
        logger_1.logger.error('Error clearing incomplete attempts:', error);
        res.status(500).json({ error: 'Failed to clear incomplete attempts' });
    }
});
exports.deleteQuiz = (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const deletedBy = req.user?.id;
    try {
        const existingQuizzes = await (0, database_1.executeQuery)(`
      SELECT * FROM quizzes WHERE id = ?
    `, [id]);
        if (existingQuizzes.length === 0) {
            res.status(404).json({ error: 'Quiz not found' });
            return;
        }
        const attempts = await (0, database_1.executeQuery)(`
      SELECT COUNT(*) as count FROM quiz_attempts WHERE quiz_id = ?
    `, [id]);
        if (attempts[0].count > 0) {
            await (0, database_1.executeQuery)(`
        UPDATE quizzes SET is_active = FALSE, updated_at = NOW() WHERE id = ?
      `, [id]);
        }
        else {
            await (0, database_1.executeQuery)('DELETE FROM quiz_answers WHERE question_id IN (SELECT id FROM quiz_questions WHERE quiz_id = ?)', [id]);
            await (0, database_1.executeQuery)('DELETE FROM quiz_questions WHERE quiz_id = ?', [id]);
            await (0, database_1.executeQuery)('DELETE FROM quizzes WHERE id = ?', [id]);
        }
        logger_1.logger.info(`Quiz ${id} deleted by user ${deletedBy}`);
        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    }
    catch (error) {
        logger_1.logger.error('Error deleting quiz:', error);
        res.status(500).json({ error: 'Failed to delete quiz' });
    }
});
//# sourceMappingURL=quizController.js.map