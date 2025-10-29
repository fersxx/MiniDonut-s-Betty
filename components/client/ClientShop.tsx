
import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Ingredient, CustomDessert } from '../../types';

const DessertCustomizer: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { inventory, currentUser, birthdayOffer } = state;

  const [base, setBase] = useState<Ingredient | null>(null);
  const [filling, setFilling] = useState<Ingredient | null>(null);
  const [frosting, setFrosting] = useState<Ingredient | null>(null);
  const [toppings, setToppings] = useState<Ingredient[]>([]);
  const [decorations, setDecorations] = useState<Ingredient[]>([]);

  const isBirthday = (() => {
      if (!currentUser) return false;
      const today = new Date();
      const userBirthDate = new Date(currentUser.birthday + 'T00:00:00');
      return today.getMonth() === userBirthDate.getMonth() && today.getDate() === userBirthDate.getDate();
  })();

  const toggleSelection = (item: Ingredient, list: Ingredient[], setList: React.Dispatch<React.SetStateAction<Ingredient[]>>) => {
    if (list.find(i => i.id === item.id)) {
      setList(list.filter(i => i.id !== item.id));
    } else {
      setList([...list, item]);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    if (base) total += base.price;
    if (filling) total += filling.price;
    if (frosting) total += frosting.price;
    toppings.forEach(t => total += t.price);
    decorations.forEach(d => total += d.price);
    return total;
  };
  
  const total = calculateTotal();

  const handleAddToCart = () => {
    if (!base || !frosting) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Debes elegir al menos una base y un frosting.', type: 'error' } });
        return;
    }

    const newDessert: CustomDessert = {
      id: `dessert-${Date.now()}`,
      name: 'Postre Personalizado',
      isCustom: true,
      base,
      filling,
      frosting,
      toppings,
      decorations,
      price: total,
    };
    
    dispatch({type: 'ADD_TO_CART', payload: newDessert});
    // Reset form
    setBase(null);
    setFilling(null);
    setFrosting(null);
    setToppings([]);
    setDecorations([]);
  };

  const renderIngredientSelector = (type: Ingredient['type'], title: string, singleSelection = false) => {
    const items = inventory.filter(i => i.type === type && i.quantity > 0);
    if(items.length === 0) return null;

    const currentSelection = singleSelection ? 
      (type === 'base' ? base : type === 'filling' ? filling : frosting) : 
      (type === 'topping' ? toppings : decorations);

    const handleSelect = (item: Ingredient) => {
        if(singleSelection) {
             if(type === 'base') setBase(item.id === base?.id ? null : item);
             if(type === 'filling') setFilling(item.id === filling?.id ? null : item);
             if(type === 'frosting') setFrosting(item.id === frosting?.id ? null : item);
        } else {
            toggleSelection(item, type === 'topping' ? toppings : decorations, type === 'topping' ? setToppings : setDecorations);
        }
    }

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-stone-700 mb-4">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map(item => {
            const isSelected = singleSelection ? currentSelection?.id === item.id : !!(currentSelection as Ingredient[]).find(i => i.id === item.id);
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex flex-col text-center border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden transform hover:scale-105 hover:shadow-lg ${isSelected ? 'border-rose-500 bg-rose-50/80' : 'bg-white border-stone-200/75'}`}
              >
                <div className="w-full h-24 bg-stone-100 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover"/>
                    ) : (
                        <span className="text-stone-400 text-xs">Sin imagen</span>
                    )}
                </div>
                <div className="p-3 flex-grow flex flex-col justify-center">
                    <p className="font-semibold text-sm text-stone-800">{item.name}</p>
                    <p className="text-xs text-rose-700 font-bold">${item.price.toFixed(2)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto">
      {isBirthday && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 mb-8 rounded-md shadow-lg" role="alert">
              <p className="font-bold text-lg">¡Feliz Cumpleaños, {currentUser?.name.split(' ')[0]}! 🎂</p>
              <p>No olvides aprovechar tu oferta especial de hoy: <span className="font-semibold">{birthdayOffer.description}</span></p>
          </div>
      )}
      <div className="text-center mb-12">
          <h1 className="text-5xl font-pacifico text-amber-900">Crea tu Postre</h1>
          <p className="text-stone-600 mt-2">¡Deja volar tu imaginación y crea el postre de tus sueños!</p>
      </div>

      <div className="lg:flex lg:gap-8">
        <div className="lg:w-3/4">
          {renderIngredientSelector('base', '1. Elige tu Base (requerido)', true)}
          {renderIngredientSelector('filling', '2. Añade un Relleno (opcional)', true)}
          {renderIngredientSelector('frosting', '3. Escoge un Frosting (requerido)', true)}
          {renderIngredientSelector('topping', '4. Agrega Toppings', false)}
          {renderIngredientSelector('decoration', '5. Toque Final: Decoraciones', false)}
        </div>
        
        <div className="lg:w-1/4">
            <div className="sticky top-24 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-amber-200/50">
                <h3 className="text-xl font-bold mb-4 border-b border-stone-200 pb-2 text-stone-800">Tu Creación</h3>
                <div className="space-y-1 text-sm min-h-[100px]">
                    {!base && !frosting && !filling && toppings.length === 0 && decorations.length === 0 && <p className="text-sm text-stone-500">Selecciona ingredientes para empezar.</p>}
                    {base && <p className="text-stone-700"><strong>Base:</strong> {base.name}</p>}
                    {filling && <p className="text-stone-700"><strong>Relleno:</strong> {filling.name}</p>}
                    {frosting && <p className="text-stone-700"><strong>Frosting:</strong> {frosting.name}</p>}
                    {toppings.length > 0 && <p className="text-stone-700"><strong>Toppings:</strong> {toppings.map(t => t.name).join(', ')}</p>}
                    {decorations.length > 0 && <p className="text-stone-700"><strong>Decoración:</strong> {decorations.map(d => d.name).join(', ')}</p>}
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200">
                    <p className="text-2xl font-bold text-right text-rose-800">Total: ${total.toFixed(2)}</p>
                    <button 
                        onClick={handleAddToCart}
                        disabled={!base || !frosting}
                        className="w-full mt-4 bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed shadow-rose-200 shadow-md hover:shadow-lg disabled:shadow-none">
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

const ClientShop: React.FC = () => {
    return (
        <div>
            <DessertCustomizer />
        </div>
    );
};

export default ClientShop;
