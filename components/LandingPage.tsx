import React, { useContext } from 'react';
import { AppContext, View } from '../context/AppContext';

const RoleCard: React.FC<{
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  buttonColor: string;
}> = ({ title, description, buttonText, onClick, buttonColor }) => {
  return (
    <div
      onClick={onClick}
      className="group flex-1 bg-amber-50/50 rounded-xl p-8 flex flex-col items-center text-center cursor-pointer hover:shadow-xl hover:bg-white transition-all duration-300 border border-amber-200/50"
    >
      <h2 className="text-2xl font-bold text-stone-800 mb-4">{title}</h2>
      <p className="text-stone-600 text-sm flex-grow">{description}</p>
      <button
        className={`${buttonColor} text-white font-bold py-2 px-6 rounded-full shadow-md transform group-hover:scale-105 transition-all duration-300 mt-8`}
      >
        {buttonText}
      </button>
    </div>
  );
};


const LandingPage: React.FC = () => {
  const { dispatch } = useContext(AppContext);

  return (
    <main className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12 text-center border border-white">
        <h1 className="font-pacifico text-5xl md:text-6xl text-amber-900">
            MiniDonuts Betty
        </h1>
        <p className="mt-2 text-xl text-stone-700">
            ¿Cómo deseas ingresar?
        </p>

        <div className="mt-10 flex flex-col md:flex-row justify-center items-stretch gap-8">
            <RoleCard
              title="Soy Cliente"
              description="Explora un mundo de sabores y personaliza el postre perfecto para ti."
              buttonText="Entrar a la Tienda"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_LOGIN })}
              buttonColor="bg-rose-600 hover:bg-rose-700"
            />
            <RoleCard
              title="Administrador"
              description="Gestiona pedidos, inventario y todas las estadísticas de tu negocio."
              buttonText="Acceder al Panel"
              onClick={() => dispatch({ type: 'SET_VIEW', payload: View.ADMIN_LOGIN })}
              buttonColor="bg-stone-700 hover:bg-stone-800"
            />
        </div>
      </div>
    </main>
  );
};

export default LandingPage;