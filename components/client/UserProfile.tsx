import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { Order } from '../../types';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
    const { dispatch } = useContext(AppContext);
    const getStatusChip = (status: Order['status']) => {
        switch(status) {
            case 'pending':
                return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-800 bg-amber-200">Pendiente</span>;
            case 'confirmed':
            case 'in_progress':
                return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-800 bg-emerald-200">Confirmado</span>;
            case 'ready':
                 return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-sky-800 bg-sky-200">Listo</span>;
            default:
                return null;
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-stone-200/80">
            <div className="flex justify-between items-start border-b border-stone-200/80 pb-2 mb-2">
                 <div>
                    <h4 className="font-semibold text-stone-800">Pedido #{order.id.slice(-6)}</h4>
                    <span className="text-sm text-stone-500">{order.orderDate.toLocaleDateString()}</span>
                </div>
                {getStatusChip(order.status)}
            </div>
            <div className="space-y-2">
                {order.items.map((item, index) => {
                    if (item.isCustom) {
                        const dessert = item;
                        return (
                            <div key={index} className="text-sm">
                                <p className="font-medium text-stone-700">{dessert.name}</p>
                                <p className="text-xs text-stone-600 pl-2">Base: {dessert.base.name}{dessert.frosting ? `, Frosting: ${dessert.frosting.name}` : ''}</p>
                            </div>
                        );
                    }
                    return <p key={index} className="text-sm font-medium text-stone-700">{item.name}</p>;
                })}
            </div>
             <div className="text-xs text-stone-500 mt-2 pt-2 border-t border-stone-200/80">
                <p><strong>Entrega:</strong> <span className="capitalize">{order.deliveryMethod === 'pickup' ? 'Recoger en sucursal' : 'Envío a domicilio'}</span></p>
                <p><strong>Pago:</strong> <span className="capitalize">{order.paymentMethod}</span></p>
            </div>
             {(order.status === 'confirmed' || order.status === 'in_progress') && order.estimatedTime && (
                <p className="text-sm text-emerald-800 font-semibold bg-emerald-100 p-2 rounded-md mt-2">
                    Tiempo estimado: {order.estimatedTime}
                </p>
            )}
             {order.status === 'ready' && (
                <p className="text-sm text-sky-800 font-semibold bg-sky-100 p-2 rounded-md mt-2">
                   ¡Tu pedido está listo para recoger/enviar!
                </p>
            )}
            <div className="flex justify-between items-center mt-3">
                 <button
                  onClick={() => dispatch({ type: 'REORDER', payload: order.items })}
                  className="text-sm bg-stone-200 text-stone-800 font-semibold py-2 px-4 rounded-lg hover:bg-stone-300 transition-colors"
                >
                  Volver a encargar
                </button>
                <p className="text-right font-bold text-rose-800">Total: ${order.total.toFixed(2)}</p>
            </div>
        </div>
    );
}

const UserProfile: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { currentUser, orders } = state;

    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        address: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (currentUser) {
            setProfileData({
                name: currentUser.name,
                phone: currentUser.phone,
                address: currentUser.address,
            });
        }
    }, [currentUser]);


    if (!currentUser) {
        return <p>Por favor, inicia sesión.</p>;
    }

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({
            type: 'UPDATE_USER_PROFILE',
            payload: {
                id: currentUser.id,
                data: profileData
            }
        });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Perfil actualizado con éxito!', type: 'success' } });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Las nuevas contraseñas no coinciden.', type: 'error' } });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'La nueva contraseña debe tener al menos 6 caracteres.', type: 'error' } });
            return;
        }
        if (currentUser.password !== passwordData.currentPassword) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'La contraseña actual es incorrecta.', type: 'error' } });
            return;
        }

        dispatch({
            type: 'UPDATE_USER_PASSWORD',
            payload: {
                id: currentUser.id,
                newPassword: passwordData.newPassword
            }
        });

        dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Contraseña cambiada con éxito!', type: 'success' } });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const userOrders = orders.filter(o => o.userId === currentUser.id).sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime());

    return (
        <div className="container mx-auto">
            <h2 className="text-4xl font-pacifico text-amber-900 mb-8 text-center">Mi Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-amber-200/50">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-stone-800">Mis Datos</h3>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="space-y-3 text-stone-700 mb-4">
                                <div><strong className="block text-sm text-stone-500">Email (no se puede cambiar)</strong>{currentUser.email}</div>
                                <div><strong className="block text-sm text-stone-500">Cumpleaños (no se puede cambiar)</strong>{new Date(currentUser.birthday + 'T00:00:00').toLocaleDateString()}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700" htmlFor="name">Nombre</label>
                                <input type="text" id="name" name="name" value={profileData.name} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700" htmlFor="phone">Teléfono</label>
                                <input type="tel" id="phone" name="phone" value={profileData.phone} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700" htmlFor="address">Dirección</label>
                                <input type="text" id="address" name="address" value={profileData.address} onChange={handleProfileChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                            </div>
                            <div className="pt-2 text-right">
                                <button type="submit" className="bg-rose-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-rose-700 transition-colors">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-amber-200/50">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-stone-800">Cambiar Contraseña</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-stone-700" htmlFor="currentPassword">Contraseña Actual</label>
                                <input type="password" id="currentPassword" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700" htmlFor="newPassword">Nueva Contraseña</label>
                                <input type="password" id="newPassword" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700" htmlFor="confirmPassword">Confirmar Nueva Contraseña</label>
                                <input type="password" id="confirmPassword" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-rose-500 focus:border-rose-500" />
                            </div>
                             <div className="pt-2 text-right">
                                <button type="submit" className="bg-stone-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-stone-800 transition-colors">Cambiar Contraseña</button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="md:col-span-2">
                     <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-amber-200/50">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-stone-800">Historial de Pedidos</h3>
                        {userOrders.length > 0 ? (
                           <div className="space-y-4 max-h-[42rem] overflow-y-auto pr-2 -mr-2">
                               {userOrders.map(order => <OrderCard key={order.id} order={order} />)}
                           </div>
                        ) : (
                            <p className="text-stone-500 text-center py-8">Aún no has realizado ningún pedido.</p>
                        )}
                     </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;