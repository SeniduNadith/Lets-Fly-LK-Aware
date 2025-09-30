import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const CreateAccount: React.FC = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // role_id is required by schema; use a default general role id = 3 (enduser)
      await axios.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        role_id: 3,
        department: form.department || 'General'
      });

      navigate('/login');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Account creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md bg-white shadow rounded-md p-6">
        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-6">Create account</h1>

        {error && (
          <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" htmlFor="username">Username</label>
            <input id="username" name="username" type="text" className="w-full border rounded px-3 py-2" value={form.username} onChange={onChange} required/>
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="w-full border rounded px-3 py-2" value={form.email} onChange={onChange} required/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1" htmlFor="first_name">First name</label>
              <input id="first_name" name="first_name" type="text" className="w-full border rounded px-3 py-2" value={form.first_name} onChange={onChange} required/>
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="last_name">Last name</label>
              <input id="last_name" name="last_name" type="text" className="w-full border rounded px-3 py-2" value={form.last_name} onChange={onChange} required/>
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="department">Department</label>
            <input id="department" name="department" type="text" className="w-full border rounded px-3 py-2" value={form.department} onChange={onChange} placeholder="e.g., Sales"/>
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="password">Password</label>
            <input id="password" name="password" type="password" className="w-full border rounded px-3 py-2" value={form.password} onChange={onChange} required/>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;
