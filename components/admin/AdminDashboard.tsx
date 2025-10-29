import React, { useState, useContext, useRef } from 'react';
import { AppContext, View } from '../../context/AppContext';
import { InventoryItem, Order } from '../../types';
import { GoogleGenAI, Modality } from "@google/genai";


// Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M15 21a3 3 0 01-3-3V11a3 3 0 013-3h2M9 3a3 3 0 00-3 3v1m0 11v1a3 3 0 003 3" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const FinanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;


const EditItemModal: React.FC<{
    item: InventoryItem;
    onClose: () => void;
    onSave: (item: InventoryItem) => void;
}> = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState<InventoryItem>(item);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({
            ...prev!,
            [name]: isNumber ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData(prev => ({ ...prev!, imageUrl: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGenerateImage = async () => {
        if (!formData.name) {
            alert('Por favor, introduce un nombre para el producto antes de generar una imagen.');
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Fotografía de producto de alta calidad de "${formData.name}", sobre un fondo blanco limpio y minimalista.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            if (response?.candidates?.[0]?.content?.parts) {
                let imageFound = false;
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes = part.inlineData.data;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        setFormData(prev => ({ ...prev!, imageUrl }));
                        imageFound = true;
                        break; 
                    }
                }
                if (!imageFound) {
                    console.error("Image data not found in response parts:", response);
                    alert("La respuesta de la IA no contenía datos de imagen. Inténtalo de nuevo.");
                }
            } else {
                console.error("Invalid response structure from image generation API:", response);
                alert("No se pudo generar la imagen. La respuesta de la IA fue inválida, posiblemente debido a filtros de seguridad. Inténtalo con otro nombre.");
            }
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Hubo un error de conexión al generar la imagen. Revisa tu conexión y la consola para más detalles.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-fade-in-up">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                     <h3 className="text-xl font-bold text-stone-800">{formData.id ? 'Editar Producto' : 'Añadir Nuevo Producto'}</h3>
                     <button onClick={onClose} className="text-stone-500 hover:text-stone-800 text-2xl leading-none">&times;</button>
                </div>
                <div className="w-full h-48 bg-stone-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {isGenerating ? (
                        <div className="text-stone-500">Generando imagen...</div>
                    ) : formData.imageUrl ? (
                        <img src={formData.imageUrl} alt={formData.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-stone-500">Sin imagen</div>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/png, image/jpeg, image/webp"
                    style={{ display: 'none' }}
                />
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-400">
                        {isGenerating ? 'Generando...' : 'Generar con IA'}
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700 transition-colors">
                        Subir de Galería
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="name">
                            Nombre del Producto
                        </label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                    </div>
                    <div>
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="type">
                            Tipo de Producto
                        </label>
                        <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
                            <option value="base">Base</option>
                            <option value="filling">Relleno</option>
                            <option value="frosting">Frosting</option>
                            <option value="topping">Topping</option>
                            <option value="decoration">Decoración</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="price">Precio</label>
                            <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" step="0.01" required />
                        </div>
                        <div>
                           <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="quantity">Cantidad</label>
                            <input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                        </div>
                    </div>
                     <div>
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="lowStockThreshold">Alerta de Stock Bajo</label>
                        <input id="lowStockThreshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                        <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors">Guardar Cambios</button>
                    </div>
                </form>
            </div>
             <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

const AdminDashboard: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('inventory');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    
    // State for settings
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [newPhoneNumber, setNewPhoneNumber] = useState('');
    const [phoneChangePassword, setPhoneChangePassword] = useState('');
    const [birthdayOfferText, setBirthdayOfferText] = useState(state.birthdayOffer.description);
    const [deliveryFee, setDeliveryFee] = useState(state.deliveryFee);
    const [adminCardNumber, setAdminCardNumber] = useState(state.adminCardNumber);


    const { users, orders, inventory, financials } = state;
    const netProfit = financials.revenue - financials.investment;

    const tabs = [
        { id: 'orders', label: 'Pedidos', icon: <OrdersIcon/> },
        { id: 'finances', label: 'Finanzas', icon: <FinanceIcon/> },
        { id: 'inventory', label: 'Inventario', icon: <InventoryIcon/> },
        { id: 'users', label: 'Usuarios', icon: <UsersIcon/> },
        { id: 'settings', label: 'Ajustes', icon: <SettingsIcon/> },
    ];
    
    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Las nuevas contraseñas no coinciden.', type: 'error' } });
            return;
        }
        if (newPassword.length < 4) {
             dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'La nueva contraseña debe tener al menos 4 caracteres.', type: 'error' } });
            return;
        }
        
        if (window.confirm('¿Estás seguro de que quieres cambiar tu contraseña?')) {
            dispatch({ type: 'UPDATE_ADMIN_PASSWORD', payload: { currentPassword, newPassword } });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
    };

    const handlePhoneChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPhoneNumber || !phoneChangePassword) {
             dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Por favor, completa todos los campos.', type: 'error' } });
             return;
        }
        dispatch({ type: 'UPDATE_ADMIN_PHONE', payload: { newPhone: newPhoneNumber, password: phoneChangePassword } });
        setNewPhoneNumber('');
        setPhoneChangePassword('');
    }
    
    const handleDeliveryFeeChange = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'UPDATE_DELIVERY_FEE', payload: deliveryFee });
    };

    const handleBirthdayOfferChange = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'UPDATE_BIRTHDAY_OFFER', payload: birthdayOfferText });
    };
    
    const handleCardNumberChange = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'UPDATE_ADMIN_CARD_NUMBER', payload: adminCardNumber });
    };

    const handleEditClick = (item: InventoryItem) => {
        setEditingItem(item);
    };

    const handleAddItem = () => {
        const newItemTemplate: InventoryItem = {
            id: '', // Empty id signifies a new item
            name: '',
            type: 'base', // default type
            price: 0,
            quantity: 0,
            lowStockThreshold: 5,
            imageUrl: '',
        };
        setEditingItem(newItemTemplate);
    };

    const handleDeleteItem = (itemId: string) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
            dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: { itemId } });
        }
    };

    const handleUpdateItem = (updatedItem: InventoryItem) => {
        if (updatedItem.id) {
            dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: updatedItem });
        } else {
            const { id, ...newItemData } = updatedItem;
            dispatch({ type: 'ADD_INVENTORY_ITEM', payload: newItemData });
        }
        setEditingItem(null);
    };
    
    const handleUpdateStatus = (order: Order, status: Order['status']) => {
        dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status } });

        if (status === 'ready') {
            const customer = users.find(u => u.id === order.userId);
            if (!customer) return;

            const message = order.deliveryMethod === 'pickup'
                ? `¡Hola, ${customer.name.split(' ')[0]}! 😊 Tu pedido #${order.id.slice(-6)} de MiniDonuts Betty está listo. ¡Ya puedes pasar a recogerlo!`
                : `¡Hola, ${customer.name.split(' ')[0]}! 😊 Tu pedido #${order.id.slice(-6)} de MiniDonuts Betty ha sido enviado y va en camino. 🚚`;
            
            const customerPhone = customer.phone.replace(/\D/g, '');
            const finalPhone = customerPhone.startsWith('52') ? `521${customerPhone.substring(2)}` : `521${customerPhone}`;
            const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    const handleConfirmOrder = (order: Order) => {
        if (!estimatedTime) {
            alert("Por favor, introduce un tiempo estimado.");
            return;
        }

        const customer = users.find(u => u.id === order.userId);
        if (!customer) {
            alert("No se pudo encontrar al cliente para este pedido.");
            return;
        }
        
        const customerPhone = customer.phone.replace(/\D/g, '');
        const finalPhone = customerPhone.startsWith('52') ? `521${customerPhone.substring(2)}` : `521${customerPhone}`;
        const message = `¡Hola, ${customer.name.split(' ')[0]}! Tu pedido en MiniDonuts Betty ha sido confirmado. Estará listo en aproximadamente: ${estimatedTime}. ¡Gracias por tu compra!`;
        const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        dispatch({ type: 'UPDATE_ORDER_ESTIMATE', payload: { orderId: order.id, estimatedTime } });
        setSelectedOrder(null);
        setEstimatedTime('');
    };

    const renderOrders = () => {
        const pendingOrders = state.orders.filter(o => o.status === 'pending').sort((a,b) => a.orderDate.getTime() - b.orderDate.getTime());
        const activeOrders = state.orders.filter(o => o.status === 'confirmed' || o.status === 'in_progress').sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime());
        const completedOrders = state.orders.filter(o => o.status === 'ready').sort((a,b) => b.orderDate.getTime() - a.orderDate.getTime());
        
        const renderOrderCard = (order: Order) => {
            const user = state.users.find(u => u.id === order.userId);
            return (
                 <div key={order.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex flex-wrap justify-between gap-4">
                        <div>
                            <p className="font-bold">Pedido #{order.id.slice(-6)} - {user?.name}</p>
                            <div className="text-sm text-stone-600">
                                <p>{user?.address}</p>
                                <p>Tel: {user?.phone}</p>
                                <p>Entrega: <span className="font-semibold capitalize">{order.deliveryMethod === 'pickup' ? 'Recoge' : 'A Domicilio'}</span></p>
                                <p>Pago: <span className="font-semibold capitalize">{order.paymentMethod}</span></p>
                                {order.paymentMethod === 'transfer' && (
                                    <p className="text-xs bg-blue-100 p-1 rounded font-mono">Transferencia a: {state.adminCardNumber}</p>
                                )}
                            </div>
                            <ul className="text-sm list-disc list-inside pl-2 mt-2 space-y-1">
                                {order.items.map((item, idx) => (
                                    <li key={idx}>
                                        <span className="font-semibold">{item.name}</span>
                                        {item.isCustom && (
                                            <ul className="text-xs list-['-_'] list-inside pl-4 text-stone-500">
                                                <li>Base: {item.base.name}</li>
                                                {item.filling && <li>Relleno: {item.filling.name}</li>}
                                                <li>Frosting: {item.frosting.name}</li>
                                                {item.toppings.length > 0 && <li>Toppings: {item.toppings.map(t => t.name).join(', ')}</li>}
                                                {item.decorations.length > 0 && <li>Decoraciones: {item.decorations.map(d => d.name).join(', ')}</li>}
                                            </ul>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                            <p className="text-xs text-stone-500">{order.orderDate.toLocaleString()}</p>
                        </div>
                    </div>
                    {order.status === 'pending' && (
                        selectedOrder?.id === order.id ? (
                            <div className="mt-4 pt-4 border-t flex gap-2 items-center flex-wrap">
                                <input type="text" value={estimatedTime} onChange={(e) => setEstimatedTime(e.target.value)} placeholder="Ej: 30 minutos, 1 hora" className="flex-grow px-3 py-2 border rounded" />
                                <button onClick={() => handleConfirmOrder(order)} className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600">Confirmar</button>
                                <button onClick={() => setSelectedOrder(null)} className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500">Cancelar</button>
                            </div>
                        ) : (
                            <div className="mt-2 text-right">
                                <button onClick={() => { setSelectedOrder(order); setEstimatedTime(''); }} className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">
                                    Confirmar Pedido
                                </button>
                            </div>
                        )
                    )}
                    {(order.status === 'confirmed' || order.status === 'in_progress') && (
                         <div className="mt-4 pt-4 border-t text-right">
                            <p className="text-sm text-stone-600 mb-2">Tiempo estimado: <strong>{order.estimatedTime}</strong></p>
                            <button onClick={() => handleUpdateStatus(order, 'ready')} className="bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600">
                                Marcar como Listo y Notificar
                            </button>
                        </div>
                    )}
                    {order.status === 'ready' && (
                        <div className="mt-4 pt-4 border-t text-right">
                            <p className="text-green-600 font-bold">¡Pedido listo y notificado!</p>
                        </div>
                    )}
                </div>
            )
        }
        return (
            <div>
                <h3 className="text-xl font-bold mb-4">Pedidos Pendientes de Confirmación</h3>
                {pendingOrders.length > 0 ? <div className="space-y-4">{pendingOrders.map(renderOrderCard)}</div> : <p className="text-stone-500 bg-white p-4 rounded-lg shadow">No hay pedidos pendientes.</p>}
                
                <h3 className="text-xl font-bold mt-8 mb-4">Pedidos en Proceso</h3>
                {activeOrders.length > 0 ? <div className="space-y-4">{activeOrders.map(renderOrderCard)}</div> : <p className="text-stone-500 bg-white p-4 rounded-lg shadow">No hay pedidos en proceso.</p>}

                <h3 className="text-xl font-bold mt-8 mb-4">Historial de Pedidos Listos</h3>
                {completedOrders.length > 0 ? <div className="space-y-4">{completedOrders.map(renderOrderCard)}</div> : <p className="text-stone-500 bg-white p-4 rounded-lg shadow">No hay pedidos completados.</p>}
            </div>
        );
    };

    const renderFinances = () => (
        <div>
            <h3 className="text-xl font-bold mb-4">Resumen Financiero</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-stone-500">Ingresos Totales</p><p className="text-2xl font-bold">${financials.revenue.toFixed(2)}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-stone-500">Inversión Total</p><p className="text-2xl font-bold">${financials.investment.toFixed(2)}</p></div>
                <div className="bg-white p-4 rounded-lg shadow"><p className="text-sm text-stone-500">Ganancia Neta</p><p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>${netProfit.toFixed(2)}</p></div>
            </div>
        </div>
    );
    
    const renderUsers = () => (
        <div>
            <h3 className="text-xl font-bold mb-4">Clientes Registrados</h3>
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full"><thead className="bg-stone-100"><tr><th className="py-2 px-4 text-left">Nombre</th><th className="py-2 px-4 text-left">Email</th><th className="py-2 px-4 text-left">Teléfono</th></tr></thead>
                    <tbody>{users.map(user => (<tr key={user.id} className="border-b hover:bg-amber-50"><td className="py-2 px-4">{user.name}</td><td className="py-2 px-4">{user.email}</td><td className="py-2 px-4">{user.phone}</td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );

    const renderInventory = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gestión de Inventario</h3>
                <button onClick={handleAddItem} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors">
                    Añadir Producto
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                    <thead className="bg-stone-100"><tr><th className="py-3 px-4 text-left w-16">Imagen</th><th className="py-3 px-4 text-left">Nombre</th><th className="py-3 px-4 text-left">Tipo</th><th className="py-3 px-4 text-right">Precio</th><th className="py-3 px-4 text-right">Cantidad</th><th className="py-3 px-4 text-right">Alerta Stock</th><th className="py-3 px-4 text-center">Acciones</th></tr></thead>
                    <tbody>
                        {inventory.map((item) => {
                            const isLowStock = item.quantity <= item.lowStockThreshold;
                            return (
                                <tr key={item.id} className="border-b hover:bg-amber-50">
                                    <td className="py-2 px-4">
                                        <div className="w-12 h-12 bg-stone-200 rounded-md flex items-center justify-center overflow-hidden">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-xs text-stone-500">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">{item.name}</td>
                                    <td className="py-3 px-4 capitalize">{item.type}</td>
                                    <td className="py-3 px-4 text-right">${item.price.toFixed(2)}</td>
                                    <td className={`py-3 px-4 text-right font-semibold ${isLowStock ? 'text-red-500' : 'text-green-600'}`}>{item.quantity}</td>
                                    <td className="py-3 px-4 text-right">{item.lowStockThreshold}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => handleEditClick(item)} className="bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 text-sm">Editar</button>
                                        <button onClick={() => handleDeleteItem(item.id)} className="ml-2 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm">Eliminar</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderSettings = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="font-semibold mb-4 text-lg border-b pb-2">Cambiar Contraseña</h4>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Contraseña Actual</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Nueva Contraseña</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Confirmar Nueva Contraseña</label>
                            <input type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Guardar Contraseña</button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="font-semibold mb-4 text-lg border-b pb-2">Actualizar Teléfono de Contacto</h4>
                    <p className="text-sm text-stone-600 mb-4">Este es el número al que se enviarán los mensajes de WhatsApp. Actual: <strong>{state.adminPhoneNumber}</strong></p>
                    <form onSubmit={handlePhoneChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Nuevo Número de Teléfono</label>
                            <input type="tel" value={newPhoneNumber} onChange={(e) => setNewPhoneNumber(e.target.value)} placeholder="Ej: 5216361234567" required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Confirmar con Contraseña</label>
                            <input type="password" value={phoneChangePassword} onChange={(e) => setPhoneChangePassword(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Actualizar Teléfono</button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="font-semibold mb-4 text-lg border-b pb-2">Tarjeta para Transferencias</h4>
                    <form onSubmit={handleCardNumberChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Número de Tarjeta</label>
                            <input type="text" value={adminCardNumber} onChange={(e) => setAdminCardNumber(e.target.value)} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Guardar Tarjeta</button>
                        </div>
                    </form>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="font-semibold mb-4 text-lg border-b pb-2">Tarifa de Envío a Domicilio</h4>
                    <form onSubmit={handleDeliveryFeeChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Costo del envío ($)</label>
                            <input type="number" step="0.01" value={deliveryFee} onChange={(e) => setDeliveryFee(parseFloat(e.target.value))} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Guardar Tarifa</button>
                        </div>
                    </form>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="font-semibold mb-4 text-lg border-b pb-2">Gestionar Oferta de Cumpleaños</h4>
                    <p className="text-sm text-stone-600 mb-4">Este es el mensaje que verán los clientes en su cumpleaños.</p>
                    <form onSubmit={handleBirthdayOfferChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Descripción de la Oferta</label>
                            <textarea value={birthdayOfferText} onChange={(e) => setBirthdayOfferText(e.target.value)} rows={3} required className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-stone-500 focus:border-stone-500" />
                        </div>
                        <div className="text-right">
                            <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Guardar Oferta</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );


    return (
        <div className="min-h-screen bg-amber-50">
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <h2 className="text-2xl font-pacifico text-amber-900">Admin</h2>
                        </div>
                        
                        <nav className="flex-grow flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                            {tabs.map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === tab.id ? 'bg-stone-200 text-stone-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'}`}
                                    aria-current={activeTab === tab.id ? 'page' : undefined}
                                >
                                    {tab.icon}
                                    <span className="hidden sm:inline">{tab.label}</span>
                                </button>
                            ))}
                        </nav>

                        <div className="flex-shrink-0">
                            <button 
                                onClick={() => dispatch({ type: 'SET_VIEW', payload: View.LANDING })} 
                                className="flex items-center gap-2 ml-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-md text-sm transition-colors"
                                title="Salir"
                            >
                                <LogoutIcon/>
                                <span className="hidden lg:inline">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-stone-800 capitalize">{tabs.find(t => t.id === activeTab)?.label}</h1>
                </header>
                <div>
                    {activeTab === 'orders' && renderOrders()}
                    {activeTab === 'finances' && renderFinances()}
                    {activeTab === 'users' && renderUsers()}
                    {activeTab === 'inventory' && renderInventory()}
                    {activeTab === 'settings' && renderSettings()}
                </div>
                 {editingItem && (<EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleUpdateItem} />)}
            </main>
        </div>
    );
};

export default AdminDashboard;