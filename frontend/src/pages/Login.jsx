import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { login } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/trips');
    } catch (error) {
      showAlert(
        error.response?.data?.message || 'Login failed. Please try again.',
        'Login failed'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-1">Log In</h1>
        <p className="text-gray-500 mb-6">Welcome back!</p>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
        />
        <button type="submit" className="w-full bg-black text-white p-3 rounded-lg">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;
