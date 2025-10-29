
import React, { useState, useContext } from 'react';
import { AppContext, View } from '../../context/AppContext';

const ClientRegister: React.FC = () => {
  const { dispatch } = useContext(AppContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthday: '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd hash the password.
    dispatch({ type: 'REGISTER_USER', payload: { ...formData, passwordHash: formData.password } });
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-10 border border-amber-200/50">
        <h2 className="text-4xl text-center text-amber-900 mb-2 font-pacifico">Crea tu Cuenta</h2>
        <p className="text-center text-stone-600 mb-8">¡Únete a nuestra dulce comunidad!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <input name="password" type="password" onChange={handleChange} required className="input-style" />
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
            <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors shadow-rose-200 shadow-md hover:shadow-lg">
              Registrarme
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