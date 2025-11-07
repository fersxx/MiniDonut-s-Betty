import React, { useContext, useState, useEffect } from 'react';
import { AppContext, View } from '../../context/AppContext';
import Logo from '../Logo';

const ShopIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const GiftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;


const BirthdayModal: React.FC<{ onClose: () => void; offer: string; name: string; }> = ({ onClose, offer, name }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center transform transition-all duration-300 scale-95 animate-fade-in-up relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-contain bg-no-repeat opacity-10" style={{backgroundImage: "url('https://www.svgrepo.com/show/21199/confetti.svg')"}}></div>
                <h3 className="text-3xl font-pacifico text-amber-900 mb-4">¡Feliz Cumpleaños, {name}!</h3>
                <p className="text-stone-600 mb-2">Te deseamos un día increíble y lleno de dulzura.</p>
                <p className="text-amber-800 font-semibold bg-amber-100 border border-amber-300 p-3 rounded-lg mb-6">
                    Como regalo, tienes una oferta especial: <span className="font-bold">{offer}</span>
                </p>
                <button onClick={onClose} className="px-8 py-3 bg-rose-600 text-white font-bold rounded-full hover:bg-rose-700 transition-transform transform hover:scale-105">
                    ¡Gracias!
                </button>
            </div>
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

const ClientHeader: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { currentUser, shoppingCart, settings, offers } = state;
    const [showBirthdayModal, setShowBirthdayModal] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        if (state.notification) {
            setShowNotification(true);
            const timer = setTimeout(() => {
                setShowNotification(false);
                setTimeout(() => dispatch({ type: 'SET_NOTIFICATION', payload: null }), 500);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.notification, dispatch]);

    useEffect(() => {
        if (!currentUser) return;

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentDay = today.getDate();
        
        const userBirthDate = new Date(currentUser.birthday + 'T00:00:00');
        const userBirthMonth = userBirthDate.getMonth() + 1;
        const userBirthDay = userBirthDate.getDate();

        const isBirthday = currentMonth === userBirthMonth && currentDay === userBirthDay;
        const alreadyNotified = currentUser.lastBirthdayNotifiedYear === today.getFullYear();

        if (isBirthday && !alreadyNotified) {
            setShowBirthdayModal(true);
            dispatch({ type: 'MARK_BIRTHDAY_NOTIFIED', payload: { userId: currentUser.id, year: today.getFullYear() } });
        }

    }, [currentUser, settings.birthdayOffer, dispatch]);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT_USER' });
    }


    return (
        <header className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-amber-200/50 h-20">
            {showBirthdayModal && currentUser && (
                <BirthdayModal 
                    onClose={() => setShowBirthdayModal(false)} 
                    offer={settings.birthdayOffer.description}
                    name={currentUser.name.split(' ')[0]}
                />
            )}
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-full flex justify-between items-center">
                <div 
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_SHOP })}
                >
                    <Logo className="h-8 w-8" />
                    <span className="text-2xl font-pacifico text-amber-900 hidden sm:inline">MiniDonuts Betty</span>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                    <span className="hidden sm:block text-stone-700 font-medium">Hola, {currentUser?.name.split(' ')[0]}</span>
                    
                     <button title="Productos" onClick={() => dispatch({type: 'SET_VIEW', payload: View.CLIENT_SHOP})} className="p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-100/80 transition-colors">
                        <ShopIcon />
                    </button>
                    
                    <button title="Galería" onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_GALLERY })} className="p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-100/80 transition-colors">
                        <ImageIcon />
                    </button>

                    <button title="Ofertas" onClick={() => dispatch({ type: 'SET_VIEW', payload: View.CLIENT_OFFERS })} className="relative p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-100/80 transition-colors">
                        <GiftIcon />
                        {offers.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white animate-pulse">{offers.length}</span>
                        )}
                    </button>

                    <button title="Mi Perfil" onClick={() => dispatch({type: 'SET_VIEW', payload: View.CLIENT_PROFILE})} className="p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-100/80 transition-colors">
                        <UserIcon />
                    </button>
                    
                    <button title="Carrito" onClick={() => dispatch({type: 'SET_VIEW', payload: View.CLIENT_CART})} className="relative p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-100/80 transition-colors">
                        <CartIcon />
                        {shoppingCart.length > 0 && (
                            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">{shoppingCart.length}</span>
                        )}
                    </button>

                     <button title="Salir" onClick={handleLogout} className="p-2 rounded-full text-stone-700 hover:text-rose-600 hover:bg-rose-100/80 transition-colors">
                        <LogoutIcon />
                    </button>
                </div>
            </nav>
            {state.notification && (
                 <div className={`fixed top-24 right-5 p-4 rounded-lg shadow-lg text-white font-semibold ${state.notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} transition-all duration-300 ${showNotification ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}
                    style={{ zIndex: 1000 }}>
                    {state.notification.message}
                </div>
            )}
        </header>
    );
};

export default ClientHeader;