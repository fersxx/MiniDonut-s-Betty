import React, { useState, useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { Ingredient, CustomDessert, BasicProduct, InventoryItem, ProductType } from '../../types';

const DessertCustomizer: React.FC = () => {
  const { state, dispatch } = useContext(AppContext);
  const { inventory, currentUser, settings, basicProducts } = state;

  const [selectedProduct, setSelectedProduct] = useState<BasicProduct | null>(null);
  const [base, setBase] = useState<Ingredient | null>(null);
  const [filling, setFilling] = useState<Ingredient | null>(null);
  const [frosting, setFrosting] = useState<Ingredient | null>(null);
  const [toppings, setToppings] = useState<Ingredient[]>([]);
  const [decorations, setDecorations] = useState<Ingredient[]>([]);
  const [quantity, setQuantity] = useState(1);
  
  const selectedProductType = selectedProduct?.productType;

  const isBirthday = (() => {
      if (!currentUser) return false;
      const today = new Date();
      const userBirthDate = new Date(currentUser.birthday + 'T00:00:00');
      return today.getMonth() === userBirthDate.getMonth() && today.getDate() === userBirthDate.getDate();
  })();

  const handleProductSelect = (product: BasicProduct) => {
    // If deselecting the current product
    if (selectedProduct?.id === product.id) {
        setSelectedProduct(null);
        setBase(null);
        setFilling(null);
        setFrosting(null);
        setToppings([]);
        setDecorations([]);
        setQuantity(1);
    } else { // If selecting a new product
        setSelectedProduct(product);
        // The selected product itself acts as the 'base' ingredient for the custom dessert
        setBase({
            id: product.id,
            name: product.name,
            price: product.price,
            type: 'base',
        });
        // Clear previous customizations as they might not be compatible
        setFilling(null);
        setFrosting(null);
        setToppings([]);
        setDecorations([]);
        setQuantity(1);
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
    if (!selectedProduct || !base) {
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Debes elegir un producto para empezar.', type: 'error' } });
        return;
    }

    const hasCustomizations = frosting || filling || toppings.length > 0 || decorations.length > 0;

    if (hasCustomizations) {
        const newDessert: CustomDessert = {
          id: `dessert-${Date.now()}`,
          name: `Personalización de ${base.name}`,
          isCustom: true,
          base,
          filling,
          frosting,
          toppings,
          decorations,
          price: total,
          quantity,
        };
        dispatch({type: 'ADD_TO_CART', payload: newDessert});
    } else {
        const newBasicProduct: BasicProduct = {
            ...selectedProduct,
            quantity,
        };
        dispatch({type: 'ADD_TO_CART', payload: newBasicProduct});
    }
    
    // Reset form
    setSelectedProduct(null);
    setBase(null);
    setFilling(null);
    setFrosting(null);
    setToppings([]);
    setDecorations([]);
    setQuantity(1);
  };

  const renderProductSelector = () => {
      return (
          <div className="mb-8">
              <h3 className="text-2xl font-semibold text-stone-700 mb-4">1. Elige tu Producto (requerido)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {basicProducts.map(product => {
                      const isSelected = selectedProduct?.id === product.id;
                      return (
                           <div
                              key={product.id}
                              onClick={() => handleProductSelect(product)}
                              className={`flex flex-col text-center border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden transform hover:scale-105 hover:shadow-lg ${isSelected ? 'border-rose-500 bg-rose-50/80' : 'bg-white border-stone-200/75'}`}
                            >
                              <div className="relative w-full h-24 bg-stone-100 flex items-center justify-center overflow-hidden">
                                  {product.imageUrl ?
                                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                      : <span className="text-stone-400 text-xs">Sin imagen</span>
                                  }
                              </div>
                              <div className="p-3 flex-grow flex flex-col min-h-[100px]">
                                <p className="font-semibold text-sm text-stone-800">{product.name}</p>
                                <p className="text-xs text-stone-500 my-1">{product.description}</p>
                                <p className="text-sm text-rose-700 font-bold mt-auto">desde ${product.price.toFixed(2)}</p>
                              </div>
                            </div>
                      )
                  })}
              </div>
          </div>
      )
  }

  const renderIngredientSelector = (
      type: 'frosting' | 'filling' | 'topping' | 'decoration',
      title: string,
      singleSelection = false
  ) => {
    if (!selectedProduct) return null;

    const ingredients: InventoryItem[] = inventory.filter(item => {
        // 1. Must be the correct type (e.g., 'frosting') and be in stock.
        if (item.type !== type || item.quantity <= 0) {
            return false;
        }

        // 2. Check if the ingredient is compatible with the selected product.
        const isCompatible = () => {
            // If an ingredient has no specific product types assigned, it's "universal" and compatible with everything.
            if (!item.productTypes || item.productTypes.length === 0) {
                return true;
            }
            // If a product is selected, check if the ingredient's allowed types includes the selected product's type.
            if (selectedProductType && item.productTypes.includes(selectedProductType)) {
                return true;
            }
            // Otherwise, it's a specific ingredient that doesn't match the current product.
            return false;
        };

        return isCompatible();
    });

    if (ingredients.length === 0) return null;

    const handleSelect = (item: Ingredient) => {
        switch (type) {
            case 'frosting':
                setFrosting(prev => (prev?.id === item.id ? null : item));
                break;
            case 'filling':
                setFilling(prev => (prev?.id === item.id ? null : item));
                break;
            case 'topping':
                setToppings(prev =>
                    prev.some(i => i.id === item.id)
                        ? prev.filter(i => i.id !== item.id)
                        : [...prev, item]
                );
                break;
            case 'decoration':
                setDecorations(prev =>
                    prev.some(i => i.id === item.id)
                        ? prev.filter(i => i.id !== item.id)
                        : [...prev, item]
                );
                break;
        }
    };

    const isSelected = (item: Ingredient): boolean => {
        switch (type) {
            case 'frosting':
                return frosting?.id === item.id;
            case 'filling':
                return filling?.id === item.id;
            case 'topping':
                return toppings.some(i => i.id === item.id);
            case 'decoration':
                return decorations.some(i => i.id === item.id);
            default:
                return false;
        }
    };

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-stone-700 mb-4">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {ingredients.map(item => {
            const isItemSelected = isSelected(item);
            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`flex flex-col text-center border-2 rounded-lg cursor-pointer transition-all duration-200 overflow-hidden transform hover:scale-105 hover:shadow-lg ${isItemSelected ? 'border-rose-500 bg-rose-50/80' : 'bg-white border-stone-200/75'}`}
              >
                <div className="w-full h-24 bg-stone-100 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-stone-400 text-xs">Sin imagen</span>
                  )}
                </div>
                <div className="p-3 flex-grow flex flex-col min-h-[80px]">
                  <p className="font-semibold text-sm text-stone-800">{item.name}</p>
                  <p className="text-sm text-rose-700 font-bold mt-auto">+${item.price.toFixed(2)}</p>
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
              <p>No olvides aprovechar tu oferta especial de hoy: <span className="font-semibold">{settings.birthdayOffer.description}</span></p>
          </div>
      )}
      <div className="text-center mb-12">
          <h1 className="text-5xl font-pacifico text-amber-900">Crea tu Postre</h1>
          <p className="text-stone-600 mt-2">¡Deja volar tu imaginación y crea el postre de tus sueños!</p>
      </div>

      <div className="lg:flex lg:gap-8">
        <div className="lg:w-3/4">
          {renderProductSelector()}
          {renderIngredientSelector('frosting', '2. Escoge una Cobertura (opcional)', true)}
          {renderIngredientSelector('filling', '3. Añade un Relleno (opcional)', true)}
          {renderIngredientSelector('topping', '4. Agrega Toppings / Extras', false)}
          {renderIngredientSelector('decoration', '5. Elige Decoraciones', false)}
        </div>
        
        <div className="lg:w-1/4">
            <div className="sticky top-24 bg-white/80 backdrop-blur-md p-6 rounded-xl shadow-lg border border-amber-200/50">
                <h3 className="text-xl font-bold mb-4 border-b border-stone-200 pb-2 text-stone-800">Tu Creación</h3>
                <div className="space-y-1 text-sm min-h-[100px]">
                    {!base && <p className="text-sm text-stone-500">Selecciona un producto para empezar.</p>}
                    {base && <p className="text-stone-700"><strong>Producto:</strong> {base.name}</p>}
                    {frosting && <p className="text-stone-700"><strong>Cobertura:</strong> {frosting.name}</p>}
                    {filling && <p className="text-stone-700"><strong>Relleno:</strong> {filling.name}</p>}
                    {toppings.length > 0 && <p className="text-stone-700"><strong>Extras:</strong> {toppings.map(t => t.name).join(', ')}</p>}
                    {decorations.length > 0 && <p className="text-stone-700"><strong>Decoraciones:</strong> {decorations.map(d => d.name).join(', ')}</p>}
                </div>
                <div className="mt-6 pt-4 border-t border-stone-200">
                    <div className="mb-4">
                        <label htmlFor="quantity" className="block text-sm font-medium text-stone-700 mb-1">Cantidad</label>
                        <input
                            id="quantity"
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            min="1"
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                            disabled={!base}
                        />
                    </div>
                    <p className="text-2xl font-bold text-right text-rose-800">Total: ${(total * quantity).toFixed(2)}</p>
                    <button 
                        onClick={handleAddToCart}
                        disabled={!base}
                        className="w-full mt-4 bg-rose-600 text-white font-bold py-3 rounded-lg hover:bg-rose-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed shadow-rose-200 shadow-md hover:shadow-lg disabled:shadow-none">
                        Añadir {quantity > 1 ? `${quantity} ` : ''}al Carrito
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