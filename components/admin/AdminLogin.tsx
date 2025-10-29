import React, { useState, useContext } from 'react';
import { AppContext, View } from '../../context/AppContext';

const AdminLogin: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === state.adminPassword) {
      dispatch({ type: 'SET_VIEW', payload: View.ADMIN_DASHBOARD });
    } else {
      setError('Contraseña incorrecta');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-amber-50 p-4">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 border border-white">
        <h2 className="text-3xl font-bold text-center text-stone-800 mb-6">Acceso de Administrador</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-stone-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-shadow"
              placeholder="************"
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="w-full bg-stone-700 hover:bg-stone-800 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
              Entrar
            </button>
           <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.LANDING })}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
                Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;