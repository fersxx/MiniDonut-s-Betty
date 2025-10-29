
import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { CustomDessert, Order } from '../../types';

const OrderCard: React.FC<{ order: Order }> = ({ order }) => {
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
                                <p className="text-xs text-stone-600 pl-2">Base: {dessert.base.name}, Frosting: {dessert.frosting.name}</p>
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
            <p className="text-right font-bold mt-3 text-rose-800">Total: ${order.total.toFixed(2)}</p>
        </div>
    );
}

const UserProfile: React.FC = () => {
    const { state } = useContext(AppContext);
    const { currentUser, orders } = state;

    if (!currentUser) {
        return <p>Por favor, inicia sesión.</p>;
    }

    const userOrders = orders.filter(o => o.userId === currentUser.id).sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime());

    return (
        <div className="container mx-auto">
            <h2 className="text-4xl font-pacifico text-amber-900 mb-8 text-center">Mi Perfil</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-amber-200/50">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-stone-800">Mis Datos</h3>
                        <div className="space-y-3 text-stone-700">
                            <div><strong className="block text-sm text-stone-500">Nombre</strong>{currentUser.name}</div>
                            <div><strong className="block text-sm text-stone-500">Email</strong>{currentUser.email}</div>
                            <div><strong className="block text-sm text-stone-500">Teléfono</strong>{currentUser.phone}</div>
                            <div><strong className="block text-sm text-stone-500">Dirección</strong>{currentUser.address}</div>
                            <div><strong className="block text-sm text-stone-500">Cumpleaños</strong>{new Date(currentUser.birthday + 'T00:00:00').toLocaleDateString()}</div>
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2">
                     <div className="bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-amber-200/50">
                        <h3 className="text-xl font-bold mb-4 border-b pb-2 text-stone-800">Historial de Pedidos</h3>
                        {userOrders.length > 0 ? (
                           <div className="space-y-4 max-h-[28rem] overflow-y-auto pr-2 -mr-2">
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
