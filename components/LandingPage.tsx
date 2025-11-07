import React, { useContext, useState } from 'react';
import { AppContext, View } from '../context/AppContext';
import Logo from './Logo';

const AdminLoginModal: React.FC<{
  onClose: () => void;
  onSubmit: (password: string) => void;
}> = ({ onClose, onSubmit }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { state } = useContext(AppContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminUser = state.users.find(u => u.role === 'admin');
    const correctPassword = adminUser ? adminUser.password : 'fer123'; // Fallback for initial state

    if (password === correctPassword) {
      onSubmit(password);
    } else {
      setError('Contraseña incorrecta.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fade-in">
        <div 
          className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm transform transition-all duration-300 scale-95 animate-fade-in-up" 
          onClick={(e) => e.stopPropagation()}
        >
            <h3 className="text-xl font-bold text-stone-800 mb-4">Acceso de Administrador</h3>
            <form onSubmit={handleSubmit}>
                <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="admin-password">
                  Contraseña
                </label>
                <input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500"
                    autoFocus
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end gap-4 pt-6">
                    <button type="button" onClick={onClose} className="bg-stone-200 text-stone-800 px-4 py-2 rounded-lg hover:bg-stone-300 transition-colors">Cancelar</button>
                    <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors">Ingresar</button>
                </div>
            </form>
        </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } 
        .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } 
        .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};


const LandingPage: React.FC = () => {
  const { dispatch } = useContext(AppContext);
  const [showAdminModal, setShowAdminModal] = useState(false);

  const handleAdminLogin = (password: string) => {
    dispatch({ type: 'LOGIN_ADMIN', payload: password });
    setShowAdminModal(false);
  };

  return (
    <>
      <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 text-center border border-white">
          <div className="flex justify-center items-center gap-4 mb-2">
            <Logo className="h-16 w-16 md:h-20 md:w-20" />
            <h1 className="font-pacifico text-5xl md:text-6xl text-amber-900">
                MiniDonuts Betty
            </h1>
          </div>
          <p className="mt-4 text-xl text-stone-700 max-w-md mx-auto">
              El lugar donde tus antojos dulces se hacen realidad. Personaliza, ordena y disfruta.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_LOGIN })}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Entrar como Cliente
              </button>
              <button
                onClick={() => setShowAdminModal(true)}
                className="w-full sm:w-auto bg-stone-700 hover:bg-stone-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Entrar como Administrador
              </button>
          </div>
        </div>
      </main>
      {showAdminModal && (
        <AdminLoginModal
          onClose={() => setShowAdminModal(false)}
          onSubmit={handleAdminLogin}
        />
      )}
    </>
  );
};

export default LandingPage;