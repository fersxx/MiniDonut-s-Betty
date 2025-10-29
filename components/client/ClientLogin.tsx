
import React, { useState, useContext } from 'react';
import { AppContext, View } from '../../context/AppContext';

const ClientLogin: React.FC = () => {
  const { dispatch, state } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd hash the password before comparing or sending to a server.
    dispatch({ type: 'LOGIN_USER', payload: { email, passwordHash: password } });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 border border-amber-200/50">
        <h2 className="text-4xl text-center text-amber-900 mb-2 font-pacifico">Bienvenido</h2>
        <p className="text-center text-stone-600 mb-8">Inicia sesión para continuar</p>
        <form onSubmit={handleLogin}>
            {state.notification && state.notification.type === 'error' && (
                <div className="bg-rose-100/50 border border-rose-400/50 text-rose-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
                    <span className="block sm:inline">{state.notification.message}</span>
                </div>
            )}
          <div className="mb-4">
            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="email">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-stone-200/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-3 bg-white/80 border border-stone-200/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors shadow-rose-200 shadow-md hover:shadow-lg"
            >
              Iniciar Sesión
            </button>
             <button
              type="button"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_REGISTER })}
              className="w-full text-rose-600 font-bold py-2 px-4 rounded-lg border-2 border-rose-200/80 hover:bg-rose-100/70 hover:border-rose-300 transition-colors"
            >
              Crear una cuenta
            </button>
            <button
                type="button"
                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.LANDING })}
                className="w-full bg-stone-500/80 hover:bg-stone-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors"
            >
                Volver
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientLogin;