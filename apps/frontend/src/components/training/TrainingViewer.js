import React, { useEffect, useState } from 'react';
import { trainingAPI } from '../../services/api.js';
import { LoadingSpinner } from '../common/LoadingSpinner.js';
import { ErrorMessage } from '../common/ErrorMessage.js';
import TrainingPlayer from './TrainingPlayer.js';

const TrainingViewer = () => {
	const [trainings, setTrainings] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({ category: '', difficulty: '', status: '' });
	const [activeTraining, setActiveTraining] = useState(null);

	const fetchTrainings = async () => {
		try {
			setLoading(true);
			const list = await trainingAPI.getAll(filters);
			setTrainings(Array.isArray(list) ? list : []);
			setError(null);
		} catch (err) {
			console.error('Error fetching trainings:', err);
			setError('Failed to load trainings. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTrainings();
	}, [filters]);

	const handleStartTraining = async (training) => {
		try {
			const res = await trainingAPI.startTraining(training.id);
			setActiveTraining({ ...training, sessionId: res?.session_id });
		} catch (err) {
			console.error('Error starting training:', err);
			setError('Failed to start training. Please try again.');
		}
	};

	const handleCompleteTraining = async () => {
		try {
			if (activeTraining?.id) {
				await trainingAPI.completeTraining(activeTraining.id);
			}
			setActiveTraining(null);
			fetchTrainings();
		} catch (err) {
			console.error('Error completing training:', err);
			setError('Failed to complete training.');
		}
	};

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} onRetry={fetchTrainings} />;

	if (activeTraining) {
		return (
			<TrainingPlayer
				training={activeTraining}
				onComplete={handleCompleteTraining}
				onCancel={() => setActiveTraining(null)}
			/>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">Security Training Modules</h1>
					<p className="text-gray-600">Browse and start available trainings</p>
				</div>

				<div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
							<select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option value="">All Categories</option>
								<option value="General Security">General Security</option>
								<option value="Data Protection">Data Protection</option>
								<option value="Access Control">Access Control</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
							<select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option value="">All Difficulties</option>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
							<select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
								<option value="">All Status</option>
								<option value="active">Active</option>
								<option value="draft">Draft</option>
								<option value="archived">Archived</option>
							</select>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{trainings.map((t) => (
						<div key={t.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">{t.title || 'Untitled Training'}</h3>
										<div className="flex gap-2 text-xs">
											<span className="px-2 py-1 rounded bg-green-100 text-green-800">{(t.difficulty || 'beginner').toUpperCase()}</span>
											<span className="px-2 py-1 rounded bg-blue-100 text-blue-800">{t.category || 'General Security'}</span>
											{t.duration ? <span className="px-2 py-1 rounded bg-gray-100 text-gray-800">{t.duration} min</span> : null}
										</div>
									</div>
								</div>
								{t.description ? (
									<p className="text-gray-600 text-sm mb-4">{t.description}</p>
								) : null}

								<div className="flex justify-between">
									<button onClick={() => handleStartTraining(t)} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700">Start Training</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default TrainingViewer;
