import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; 

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username,
        password
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Сохраняем роль
        localStorage.setItem('isAdmin', response.data.is_staff.toString());
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Ошибка доступа. Проверьте логин и пароль.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 shadow-xl shadow-gray-200/50">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase">GRES.SYSTEM</h1>
          <p className="text-gray-400 mt-2 font-bold text-xs uppercase tracking-widest">Контроль производства</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Логин сотрудника</label>
            <input
              type="text"
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin / worker"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 ml-1 tracking-widest">Пароль</label>
            <input
              type={showPassword ? "text" : "password"}
              className="w-full px-5 py-4 rounded-2xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 bottom-4 text-gray-400 hover:text-blue-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-xs p-4 rounded-xl font-bold border border-red-100 animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-gray-200 active:scale-[0.97] uppercase tracking-widest text-xs"
          >
            Войти в систему
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;