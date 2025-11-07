import React, { useContext } from 'react';
import { AppContext, View } from '../context/AppContext';
import Logo from './Logo';

const LandingPage: React.FC = () => {
  const { dispatch } = useContext(AppContext);

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
                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_LOGIN })}
                className="w-full sm:w-auto bg-stone-700 hover:bg-stone-800 text-white font-bold py-3 px-8 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Entrar como Administrador
              </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default LandingPage;