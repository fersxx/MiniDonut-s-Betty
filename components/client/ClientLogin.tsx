import React, { useState, useContext } from 'react';
import { AppContext, View } from '../../context/AppContext';
import Logo from '../Logo';

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7 .527-1.666 1.415-3.15 2.535-4.35M9.875 9.875A3 3 0 1014.125 14.125M17.625 17.625L6.375 6.375" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5c.988 0 1.95.16 2.864.469m4.592 4.592C20.334 10.518 21.058 12 21.058 12c-1.274 4.057-5.064 7-9.542 7a10.015 10.015 0 01-1.32-.105" />
  </svg>
);

const ClientLogin: React.FC = () => {
  const { dispatch, state } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch({ type: 'SET_NOTIFICATION', payload: null });
    
    // Simulate async operation
    setTimeout(() => {
        dispatch({ type: 'LOGIN_USER', payload: { email, password } });
        // The isLoading state will be managed by the component, as a successful login will unmount it.
        // An unsuccessful login will be indicated by a notification, and we should stop loading.
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 border border-amber-200/50">
        <div className="flex justify-center mb-4">
          <Logo className="h-20 w-20" />
        </div>
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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 pr-10 bg-white/80 border border-stone-200/80 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                required
              />
               <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-stone-500 hover:text-stone-700"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors shadow-rose-200 shadow-md hover:shadow-lg disabled:bg-rose-300"
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
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