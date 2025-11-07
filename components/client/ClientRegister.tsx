import React, { useState, useContext } from 'react';
import { AppContext, View } from '../../context/AppContext';
import Logo from '../Logo';
import { User } from '../../types';

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


const ClientRegister: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: '',
    phone: '',
    address: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'La contraseña debe tener al menos 6 caracteres.', type: 'error' } });
        return;
    }
    
    setIsLoading(true);
    dispatch({ type: 'SET_NOTIFICATION', payload: null });
    
    // Simulate async operation
    setTimeout(() => {
        dispatch({ type: 'REGISTER_USER', payload: formData });
        // isLoading is managed locally; a successful registration will unmount this component.
        // An unsuccessful one will show a notification.
        setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 border border-amber-200/50">
        <div className="flex justify-center mb-4">
          <Logo className="h-20 w-20" />
        </div>
        <h2 className="text-4xl text-center text-amber-900 mb-2 font-pacifico">Crea tu Cuenta</h2>
        <p className="text-center text-stone-600 mb-8">¡Únete a nuestra dulce comunidad!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {state.notification && state.notification.type === 'error' && (
            <div className="bg-rose-100/50 border border-rose-400/50 text-rose-700 px-4 py-3 rounded-lg relative" role="alert">
                <span className="block sm:inline">{state.notification.message}</span>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="name">Nombre Completo</label>
              <input name="name" type="text" onChange={handleChange} required className="input-style" />
            </div>
            <div>
              <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="email">Correo Electrónico</label>
              <input name="email" type="email" onChange={handleChange} required className="input-style" />
            </div>
          </div>
          <div>
            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="password">Contraseña</label>
            <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} onChange={handleChange} required className="input-style pr-10" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="birthday">Fecha de Nacimiento</label>
              <input name="birthday" type="date" onChange={handleChange} required className="input-style" />
            </div>
            <div>
              <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="phone">Número de Teléfono</label>
              <input name="phone" type="tel" onChange={handleChange} required className="input-style" />
            </div>
          </div>
          <div>
            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="address">Dirección</label>
            <input name="address" type="text" onChange={handleChange} required className="input-style" />
          </div>
          <p className="text-xs text-stone-500 pt-2">
            Tu información de contacto se usará para coordinar los envíos a domicilio.
          </p>
          <div className="flex flex-col gap-4 pt-4">
            <button type="submit" disabled={isLoading} className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors shadow-rose-200 shadow-md hover:shadow-lg disabled:bg-rose-300">
              {isLoading ? 'Registrando...' : 'Registrarme'}
            </button>
            <button type="button" onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_LOGIN })} className="w-full text-center text-sm text-rose-600 hover:underline">
              ¿Ya tienes una cuenta? Inicia Sesión
            </button>
          </div>
        </form>
      </div>
       <style>{`.input-style { background-color: rgba(255, 255, 255, 0.8); border-radius: 0.5rem; width: 100%; padding: 0.75rem 1rem; color: #4a5568; line-height: 1.25; border: 1px solid rgba(214, 211, 209, 0.8); box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); transition: all 150ms ease-in-out; } .input-style:focus { outline: none; border-color: transparent; box-shadow: 0 0 0 2px #DB2777; }`}</style>
    </div>
  );
};

export default ClientRegister;