
import React, { useContext, useState, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { CustomDessert, BasicProduct } from '../../types';

const ConfirmationModal: React.FC<{onConfirm: () => void; onCancel: () => void;}> = ({ onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center transform transition-all duration-300 scale-95 animate-fade-in-up">
                <h3 className="text-xl font-bold text-stone-800 mb-4">Confirmar Pedido</h3>
                <p className="text-stone-600 mb-6">
                    Se enviará un mensaje de WhatsApp al administrador con los detalles de tu pedido para su confirmación final.
                </p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-stone-300 text-stone-800 rounded-lg hover:bg-stone-400">
                        Cancelar
                    </button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700">
                        Confirmar y Enviar
                    </button>
                </div>
            </div>
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

const ShoppingCart: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { shoppingCart, currentUser, adminPhoneNumber, deliveryFee, adminCardNumber } = state;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'cash'>('transfer');
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery'>('pickup');


  const subtotal = useMemo(() => shoppingCart.reduce((sum, item) => sum + item.price, 0), [shoppingCart]);
  const finalTotal = useMemo(() => deliveryMethod === 'delivery' ? subtotal + deliveryFee : subtotal, [subtotal, deliveryMethod, deliveryFee]);

  const handlePlaceOrder = () => {
      if (!currentUser) return;
      
      const itemsText = shoppingCart.map(item => {
          if (item.isCustom) {
              const details = [
                  item.base.name,
                  item.filling?.name,
                  item.frosting.name,
                  item.toppings.length > 0 ? `Toppings: ${item.toppings.map(t => t.name).join(', ')}` : null,
                  item.decorations.length > 0 ? `Decoración: ${item.decorations.map(d => d.name).join(', ')}` : null
              ].filter(Boolean).join(' | ');
              return `- Postre Personalizado: (${details}) - $${item.price.toFixed(2)}`;
          }
          return `- ${item.name} - $${item.price.toFixed(2)}`;
      }).join('\n');

      const deliveryText = deliveryMethod === 'delivery' ? 
        `*Entrega:* Envío a domicilio (+$${deliveryFee.toFixed(2)})` : 
        `*Entrega:* Recoger en sucursal`;
      
      const paymentText = `*Pago:* ${paymentMethod === 'transfer' ? `Transferencia (a la tarjeta ${adminCardNumber})` : 'Efectivo'}`;

      const message = `¡Nuevo pedido de MiniDonuts Betty!

*Cliente:* ${currentUser.name}
*Dirección:* ${currentUser.address}
*Teléfono:* ${currentUser.phone}

*Pedido:*
${itemsText}

*Subtotal: $${subtotal.toFixed(2)}*
${deliveryText}
${paymentText}

*Total a Pagar: $${finalTotal.toFixed(2)}*

Por favor, confirma el tiempo de entrega.`;
      
      const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${encodeURIComponent(message)}`;

      window.open(whatsappUrl, '_blank');
      
      dispatch({type: 'PLACE_ORDER', payload: { paymentMethod, deliveryMethod }});
      setShowConfirmModal(false);
  };

  const renderCartItem = (item: CustomDessert | BasicProduct, index: number) => {
    return (
      <div key={index} className="flex justify-between items-start p-4 border-b border-stone-200/75">
          <div>
              <h4 className="font-bold text-stone-800">{item.name}</h4>
              {item.isCustom && (
                  <ul className="text-sm text-stone-600 list-disc list-inside">
                      <li>Base: {item.base.name}</li>
                      {item.filling && <li>Relleno: {item.filling.name}</li>}
                      <li>Frosting: {item.frosting.name}</li>
                      {item.toppings.length > 0 && <li>Toppings: {item.toppings.map(t => t.name).join(', ')}</li>}
                      {item.decorations.length > 0 && <li>Decoraciones: {item.decorations.map(d => d.name).join(', ')}</li>}
                  </ul>
              )}
          </div>
          <p className="font-semibold text-stone-800">${item.price.toFixed(2)}</p>
      </div>
    )
  };

  return (
    <div className="container mx-auto">
        <h2 className="text-4xl font-pacifico text-amber-900 mb-8 text-center">Finalizar Compra</h2>
        <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg max-w-2xl mx-auto border border-amber-200/50 overflow-hidden">
            {shoppingCart.length === 0 ? (
                <p className="p-8 text-center text-stone-500">Tu carrito está vacío.</p>
            ) : (
                <div>
                    {shoppingCart.map((item, index) => renderCartItem(item, index))}
                    
                    <div className="p-4 border-t border-stone-200/75">
                        <h3 className="font-bold mb-3 text-stone-800">Método de Entrega</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${deliveryMethod === 'pickup' ? 'border-rose-500 bg-rose-50/80' : 'bg-white border-stone-200/75'}`}>
                                <input type="radio" name="delivery" value="pickup" checked={deliveryMethod === 'pickup'} onChange={() => setDeliveryMethod('pickup')} className="w-4 h-4 mr-3 accent-rose-600" />
                                Recoger en sucursal
                            </label>
                             <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${deliveryMethod === 'delivery' ? 'border-rose-500 bg-rose-50/80' : 'bg-white border-stone-200/75'}`}>
                                <input type="radio" name="delivery" value="delivery" checked={deliveryMethod === 'delivery'} onChange={() => setDeliveryMethod('delivery')} className="w-4 h-4 mr-3 accent-rose-600" />
                                Envío a domicilio (+${deliveryFee.toFixed(2)})
                            </label>
                        </div>
                    </div>

                    <div className="p-4 border-t border-stone-200/75">
                        <h3 className="font-bold mb-3 text-stone-800">Método de Pago</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'transfer' ? 'border-rose-500 bg-rose-50/80' : 'bg-white border-stone-200/75'}`}>
                                <input type="radio" name="payment" value="transfer" checked={paymentMethod === 'transfer'} onChange={() => setPaymentMethod('transfer')} className="w-4 h-4 mr-3 accent-rose-600" />
                                Transferencia
                            </label>
                             <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cash' ? 'border-rose-500 bg-rose-50/80' : 'bg-white border-stone-200/75'}`}>
                                <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="w-4 h-4 mr-3 accent-rose-600" />
                                Efectivo
                            </label>
                        </div>
                         <div className="mt-4 text-sm p-3 rounded-md bg-amber-100 text-stone-800">
                            {paymentMethod === 'transfer' ? (
                                <p>Por favor, realiza la transferencia al siguiente número de tarjeta: <strong className="font-mono block text-center text-base mt-1">{adminCardNumber}</strong></p>
                            ) : (
                                <p>El pago se realiza al momento de recibir tu pedido.</p>
                            )}
                        </div>
                    </div>

                    <div className="p-4 bg-amber-50/50 space-y-2">
                        <div className="flex justify-between text-stone-700"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
                         {deliveryMethod === 'delivery' && (
                             <div className="flex justify-between text-stone-700"><span>Envío:</span><span>${deliveryFee.toFixed(2)}</span></div>
                         )}
                        <div className="flex justify-between items-center font-bold text-lg border-t border-stone-200 pt-2 text-rose-800">
                            <span>Total:</span>
                            <span>${finalTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="p-4">
                        <button 
                            onClick={() => setShowConfirmModal(true)}
                            className="w-full bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition-colors shadow-rose-200 shadow-md hover:shadow-lg">
                            Realizar Pedido
                        </button>
                    </div>
                </div>
            )}
        </div>
         {showConfirmModal && (
            <ConfirmationModal 
                onConfirm={handlePlaceOrder}
                onCancel={() => setShowConfirmModal(false)}
            />
        )}
    </div>
  );
};

export default ShoppingCart;
