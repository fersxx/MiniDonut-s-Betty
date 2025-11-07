import React, { useState, useContext, useRef, useMemo, useEffect } from 'react';
import { AppContext, View } from '../../context/AppContext';
import { InventoryItem, Order, Offer, GalleryImage, ProductRecipe, User, AppSettings } from '../../types';
import { GoogleGenAI, Modality } from "@google/genai";
import Logo from '../Logo';

// Icons
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6a6 6 0 016 6v1h-3M15 21a3 3 0 01-3-3V11a3 3 0 013-3h2M9 3a3 3 0 00-3 3v1m0 11v1a3 3 0 003 3" /></svg>;
const InventoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>;
const FinanceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0 3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826 3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const OrdersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const TagIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-7-7A2 2 0 013 8V3a2 2 0 012-2h2z" /></svg>;
const ImageIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const RecipeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
import { ProductType } from '../../types';


const EditItemModal: React.FC<{
    item: InventoryItem;
    onClose: () => void;
    onSave: (item: InventoryItem) => void;
}> = ({ item, onClose, onSave }) => {
    const [formData, setFormData] = useState<InventoryItem>(item);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isRawMaterial = formData.type === 'materia_prima';
    const isClientFacing = !isRawMaterial;
    const PRODUCT_TYPES: ProductType[] = ['donita', 'pastel', 'cupcake'];

    useEffect(() => {
        if (isRawMaterial) {
            setFormData(prev => ({ ...prev, price: 0, productTypes: [] }));
        }
    }, [isRawMaterial]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({
            ...prev!,
            [name]: isNumber ? parseFloat(value) || 0 : value
        }));
    };
    
    const handleProductTypeChange = (type: ProductType) => {
        const currentTypes = formData.productTypes || [];
        const newTypes = currentTypes.includes(type)
            ? currentTypes.filter(t => t !== type)
            : [...currentTypes, type];
        setFormData(prev => ({ ...prev, productTypes: newTypes }));
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
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 scale-95 animate-fade-in-up">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                     <h3 className="text-xl font-bold text-stone-800">{formData.id ? 'Editar Ítem' : 'Añadir Nuevo Ítem'}</h3>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="name">Nombre del Ítem</label>
                            <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                        </div>
                        <div>
                            <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="type">Categoría</label>
                            <select id="type" name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
                                <option value="materia_prima">Materia Prima (Uso interno)</option>
                                <option value="frosting">Cobertura / Frosting (Para cliente)</option>
                                <option value="filling">Relleno (Para cliente)</option>
                                <option value="topping">Topping / Extra (Para cliente)</option>
                                <option value="decoration">Decoración (Para cliente)</option>
                            </select>
                        </div>
                    </div>
                     {isClientFacing && (
                        <div className="bg-stone-50 p-3 rounded-lg border">
                            <p className="text-sm font-semibold text-stone-600 mb-2">Aplica a Productos</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-2">
                                {PRODUCT_TYPES.map(type => (
                                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.productTypes?.includes(type) || false}
                                            onChange={() => handleProductTypeChange(type)}
                                            className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                                        />
                                        <span className="text-sm capitalize">{type}{type === 'cupcake' && ' / bollito'}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="bg-stone-50 p-3 rounded-lg border">
                        <p className="text-sm font-semibold text-stone-600 mb-2">Detalles de Costo de Compra</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-stone-700 text-xs font-bold mb-1" htmlFor="cost">Costo del Paquete</label>
                                <input id="cost" name="cost" type="number" value={formData.cost} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" step="0.01" required />
                            </div>
                            <div>
                                <label className="block text-stone-700 text-xs font-bold mb-1" htmlFor="packageSize">Tamaño del Paquete</label>
                                <input id="packageSize" name="packageSize" type="number" value={formData.packageSize} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                            </div>
                             <div>
                                <label className="block text-stone-700 text-xs font-bold mb-1" htmlFor="unit">Unidad</label>
                                <select id="unit" name="unit" value={formData.unit} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500">
                                    <option value="gr">Gramos (gr)</option>
                                    <option value="ml">Mililitros (ml)</option>
                                    <option value="unidad">Unidad(es)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                     <div className="bg-stone-50 p-3 rounded-lg border">
                        <p className="text-sm font-semibold text-stone-600 mb-2">Detalles de Inventario y Venta</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className={isClientFacing ? "lg:col-span-1" : "lg:col-span-2"}>
                                <label className="block text-stone-700 text-xs font-bold mb-1" htmlFor="price">
                                    Precio Venta (Cliente)
                                    {isRawMaterial && <span className="text-stone-400 font-normal"> (No aplica)</span>}
                                </label>
                                <input id="price" name="price" type="number" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500 disabled:bg-stone-100 disabled:text-stone-400" step="0.01" required disabled={isRawMaterial} />
                            </div>
                            {isClientFacing && (
                                <div className="lg:col-span-1">
                                    <label className="block text-stone-700 text-xs font-bold mb-1" htmlFor="servingSize">
                                        Uso por Porción <span className="font-normal">({formData.unit})</span>
                                    </label>
                                    <input id="servingSize" name="servingSize" type="number" value={formData.servingSize || ''} onChange={handleChange} placeholder="Ej: 15" className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" step="0.1" />
                                </div>
                            )}
                            <div className="lg:col-span-1">
                               <label className="block text-stone-700 text-xs font-bold mb-1" htmlFor="quantity">Cantidad en Stock</label>
                                <input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                            </div>
                             <div className="lg:col-span-1">
                                <label className="block text-stone-700 text-xs font-bold mb-1" htmlFor="lowStockThreshold">Alerta Stock Bajo</label>
                                <input id="lowStockThreshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                            </div>
                        </div>
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

const EditOfferModal: React.FC<{
    offer: Offer;
    onClose: () => void;
    onSave: (offer: Offer) => void;
}> = ({ offer, onClose, onSave }) => {
    const [formData, setFormData] = useState<Offer>(offer);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev!, [name]: value }));
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
        if (!formData.title) {
            alert('Por favor, introduce un título para la oferta antes de generar una imagen.');
            return;
        }
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = `Imagen publicitaria llamativa y atractiva para una oferta de postres llamada "${formData.title}". Estilo minimalista, colores pastel, enfocado en donas.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            if (response?.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes = part.inlineData.data;
                        const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                        setFormData(prev => ({ ...prev!, imageUrl }));
                        return;
                    }
                }
            }
             alert("No se pudo generar la imagen. La respuesta de la IA fue inválida, posiblemente debido a filtros de seguridad.");
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Hubo un error al generar la imagen. Revisa la consola para más detalles.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 scale-95 animate-fade-in-up">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                     <h3 className="text-xl font-bold text-stone-800">{formData.id ? 'Editar Oferta' : 'Añadir Nueva Oferta'}</h3>
                     <button onClick={onClose} className="text-stone-500 hover:text-stone-800 text-2xl leading-none">&times;</button>
                </div>
                <div className="w-full h-48 bg-stone-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {isGenerating ? (
                        <div className="text-stone-500">Generando imagen...</div>
                    ) : formData.imageUrl ? (
                        <img src={formData.imageUrl} alt={formData.title} className="w-full h-full object-cover" />
                    ) : (
                        <div className="text-stone-500">Sin imagen</div>
                    )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/png, image/jpeg, image/webp" style={{ display: 'none' }} />
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
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="title">Título de la Oferta</label>
                        <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                    </div>
                    <div>
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="description">Descripción</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" required />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancelar</button>
                        <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Guardar Cambios</button>
                    </div>
                </form>
            </div>
             <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

const AddGalleryImageModal: React.FC<{
    onClose: () => void;
    onSave: (imageData: Omit<GalleryImage, 'id' | 'likes'>) => void;
}> = ({ onClose, onSave }) => {
    const [caption, setCaption] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageUrl) {
            alert('Por favor, sube o genera una imagen.');
            return;
        }
        onSave({ caption, imageUrl });
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleGenerateImage = async () => {
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const prompt = caption 
                ? `Fotografía de producto de alta calidad de un postre: "${caption}", para la galería de MiniDonuts Betty, estilo brillante y apetitoso, sobre un fondo de colores pastel.`
                : `Fotografía de producto de alta calidad de una mini dona decorada creativamente para la galería de MiniDonuts Betty, sobre un fondo de colores pastel.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: prompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });

            if (response?.candidates?.[0]?.content?.parts) {
                for (const part of response.candidates[0].content.parts) {
                    if (part.inlineData) {
                        const base64ImageBytes = part.inlineData.data;
                        const generatedUrl = `data:image/png;base64,${base64ImageBytes}`;
                        setImageUrl(generatedUrl);
                        return;
                    }
                }
            }
            alert("No se pudo generar la imagen. La respuesta de la IA fue inválida, posiblemente debido a filtros de seguridad.");
        } catch (error) {
            console.error("Error generating image:", error);
            alert("Hubo un error al generar la imagen. Revisa la consola para más detalles.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md animate-fade-in-up">
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-stone-800">Añadir a Galería</h3>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800 text-2xl">&times;</button>
                </div>
                <div className="w-full h-48 bg-stone-100 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                    {isGenerating ? <div className="text-stone-500">Generando imagen...</div> : imageUrl ? <img src={imageUrl} alt="Vista previa" className="w-full h-full object-cover" /> : <div className="text-stone-500">Sin imagen</div>}
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-400">
                        {isGenerating ? 'Generando...' : 'Generar con IA'}
                    </button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-stone-600 text-white px-4 py-2 rounded-lg hover:bg-stone-700">
                        Subir de Galería
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-stone-700 text-sm font-bold mb-2" htmlFor="caption">Pie de Foto (opcional)</label>
                        <input id="caption" name="caption" type="text" value={caption} onChange={(e) => setCaption(e.target.value)} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-500" />
                    </div>
                    <div className="flex justify-end gap-4 pt-2">
                        <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">Cancelar</button>
                        <button type="submit" className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800">Guardar Imagen</button>
                    </div>
                </form>
            </div>
             <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

const ConfirmationModal: React.FC<{
    title: string;
    message: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    confirmButtonText?: string;
    cancelButtonText?: string;
    confirmButtonClass?: string;
}> = ({ title, message, onConfirm, onCancel, confirmButtonText = 'Confirmar', cancelButtonText = 'Cancelar', confirmButtonClass = 'bg-rose-600 hover:bg-rose-700' }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm text-center transform transition-all duration-300 scale-95 animate-fade-in-up">
                <h3 className="text-xl font-bold text-stone-800 mb-4">{title}</h3>
                <div className="text-stone-600 mb-6">{message}</div>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="px-6 py-2 bg-stone-300 text-stone-800 rounded-lg hover:bg-stone-400">
                        {cancelButtonText}
                    </button>
                    <button onClick={onConfirm} className={`px-6 py-2 text-white font-bold rounded-lg ${confirmButtonClass}`}>
                        {confirmButtonText}
                    </button>
                </div>
            </div>
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
};

const getStatusChip = (status: Order['status']) => {
    switch(status) {
        case 'pending': return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-800 bg-amber-200">Pendiente</span>;
        case 'confirmed':
        case 'in_progress': return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-800 bg-emerald-200">Confirmado</span>;
        case 'ready': return <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-sky-800 bg-sky-200">Listo</span>;
        default: return null;
    }
}

const ModalOrderCard: React.FC<{ order: Order }> = ({ order }) => {
    return (
         <div className="bg-stone-50 p-4 rounded-lg shadow-sm border border-stone-200/80">
            <div className="flex justify-between items-start border-b border-stone-200/80 pb-2 mb-2">
                 <div>
                    <h4 className="font-semibold text-stone-800">Pedido #{order.id.slice(-6)}</h4>
                    <span className="text-sm text-stone-500">{new Date(order.orderDate).toLocaleDateString()}</span>
                </div>
                {getStatusChip(order.status)}
            </div>
            <ul className="text-sm list-disc list-inside pl-2 mt-2 space-y-1">
                {order.items.map((item, idx) => (
                    <li key={idx}>
                        <span className="font-semibold">{item.name} ({item.quantity}x)</span>
                        {item.isCustom && (
                            <ul className="text-xs list-['-_'] list-inside pl-4 text-stone-500">
                                <li>Base: {item.base.name}</li>
                                {item.filling && <li>Relleno: {item.filling.name}</li>}
                                {item.frosting && <li>Frosting: {item.frosting.name}</li>}
                                {item.toppings.length > 0 && <li>Toppings: {item.toppings.map(t => t.name).join(', ')}</li>}
                                {item.decorations.length > 0 && <li>Decoraciones: {item.decorations.map(d => d.name).join(', ')}</li>}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
            <p className="text-right font-bold mt-3 text-rose-800">Total: ${order.total.toFixed(2)}</p>
        </div>
    );
};

const UserOrdersModal: React.FC<{ user: User; orders: Order[]; onClose: () => void }> = ({ user, orders, onClose }) => {
    const userOrders = orders.filter(o => o.userId === user.id).sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 scale-95 animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b pb-3 mb-4">
                    <h3 className="text-xl font-bold text-stone-800">Historial de Pedidos de {user.name}</h3>
                    <button onClick={onClose} className="text-stone-500 hover:text-stone-800 text-2xl leading-none">&times;</button>
                </div>
                {userOrders.length > 0 ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 -mr-2">
                        {userOrders.map(order => <ModalOrderCard key={order.id} order={order} />)}
                    </div>
                ) : (
                    <p className="text-stone-500 text-center py-8">Este usuario aún no ha realizado ningún pedido.</p>
                )}
            </div>
            <style>{`@keyframes fade-in-up { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }`}</style>
        </div>
    );
}

const AdminDashboard: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const [activeTab, setActiveTab] = useState('orders');
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
    const [isAddingImage, setIsAddingImage] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
    const [offerToDelete, setOfferToDelete] = useState<Offer | null>(null);
    const [recipeToDelete, setRecipeToDelete] = useState<ProductRecipe | null>(null);
    const [imageToDelete, setImageToDelete] = useState<GalleryImage | null>(null);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    
    const [localSettings, setLocalSettings] = useState<AppSettings | null>(null);
    const [adminProfile, setAdminProfile] = useState({ email: '', name: '' });
    const [adminPassword, setAdminPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        if (activeTab === 'settings' && state.settings && state.currentUser) {
            setLocalSettings(state.settings);
            setAdminProfile({ email: state.currentUser.email, name: state.currentUser.name });
        }
    }, [activeTab, state.settings, state.currentUser]);


    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!localSettings) return;
        const { name, value } = e.target;

        if (name === 'birthdayOfferDescription') {
            setLocalSettings(prev => prev ? {...prev, birthdayOffer: {description: value}} : null);
        } else {
            setLocalSettings(prev => prev ? { ...prev, [name]: name === 'deliveryFee' ? parseFloat(value) : value } : null);
        }
    };
    
    const handleSaveSettings = (e: React.FormEvent) => {
        e.preventDefault();
        if (!localSettings) return;
        dispatch({ type: 'SAVE_SETTINGS', payload: localSettings });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Ajustes generales guardados!', type: 'success' } });
    };

    const handleAdminProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminProfile({ ...adminProfile, [e.target.name]: e.target.value });
    };

    const handleAdminProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.currentUser) return;
        dispatch({
            type: 'UPDATE_USER_PROFILE',
            payload: { id: state.currentUser.id, data: { name: adminProfile.name, email: adminProfile.email } }
        });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Datos de administrador actualizados.', type: 'success' } });
    };

    const handleAdminPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAdminPassword({ ...adminPassword, [e.target.name]: e.target.value });
    };
    
    const handleAdminPasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.currentUser) return;
        if (adminPassword.newPassword !== adminPassword.confirmPassword) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Las nuevas contraseñas no coinciden.', type: 'error' } });
            return;
        }
        if (state.currentUser.password !== adminPassword.currentPassword) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'La contraseña actual es incorrecta.', type: 'error' } });
            return;
        }
        dispatch({
            type: 'UPDATE_USER_PASSWORD',
            payload: { id: state.currentUser.id, newPassword: adminPassword.newPassword }
        });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Contraseña actualizada.', type: 'success' } });
        setAdminPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    };


    const { users, orders, inventory, financials, offers, gallery } = state;
    const netProfit = financials.revenue - financials.investment;

    const tabs = [
        { id: 'orders', label: 'Pedidos', icon: <OrdersIcon/> },
        { id: 'finances', label: 'Finanzas', icon: <FinanceIcon/> },
        { id: 'inventory', label: 'Ingredientes', icon: <InventoryIcon/> },
        { id: 'recipes', label: 'Recetas y Precios', icon: <RecipeIcon /> },
        { id: 'gallery', label: 'Galería', icon: <ImageIcon /> },
        { id: 'offers', label: 'Ofertas', icon: <TagIcon /> },
        { id: 'users', label: 'Usuarios', icon: <UsersIcon/> },
        { id: 'settings', label: 'Ajustes', icon: <SettingsIcon/> },
    ];
    
    const handleLogout = () => {
        dispatch({ type: 'LOGOUT_USER' });
    };
    
    const handleEditClick = (item: InventoryItem) => {
        setEditingItem(item);
    };

    const handleAddItem = () => {
        const newItemTemplate: InventoryItem = {
            id: '', // Empty id signifies a new item
            name: '',
            type: 'materia_prima', // default type
            price: 0,
            quantity: 0,
            lowStockThreshold: 5,
            imageUrl: '',
            cost: 0,
            unit: 'gr',
            packageSize: 1000,
            productTypes: [],
        };
        setEditingItem(newItemTemplate);
    };

    const confirmDeleteItem = () => {
        if (itemToDelete) {
            dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: itemToDelete.id });
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: `¡"${itemToDelete.name}" eliminado con éxito!`, type: 'success' } });
            setItemToDelete(null);
        }
    };

    const handleUpdateItem = (updatedItem: InventoryItem) => {
        dispatch({ type: 'SAVE_INVENTORY_ITEM', payload: updatedItem });
        const message = updatedItem.id ? '¡Producto actualizado!' : '¡Producto añadido!';
        dispatch({ type: 'SET_NOTIFICATION', payload: { message, type: 'success' } });
        setEditingItem(null);
    };

    const handleAddOffer = () => {
        const newOfferTemplate: Offer = {
            id: '', 
            title: '',
            description: '',
            imageUrl: '',
        };
        setEditingOffer(newOfferTemplate);
    };

    const confirmDeleteOffer = () => {
        if (offerToDelete) {
            dispatch({ type: 'DELETE_OFFER', payload: offerToDelete.id });
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Oferta eliminada!', type: 'success' } });
            setOfferToDelete(null);
        }
    };

    const confirmDeleteRecipe = () => {
        if (recipeToDelete) {
            dispatch({ type: 'DELETE_RECIPE', payload: recipeToDelete.id });
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Receta eliminada!', type: 'success' } });
            setRecipeToDelete(null);
        }
    };
    
    const confirmDeleteGalleryImage = () => {
        if (imageToDelete) {
            dispatch({ type: 'DELETE_GALLERY_IMAGE', payload: imageToDelete.id });
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Imagen eliminada!', type: 'success' } });
            setImageToDelete(null);
        }
    };

    const handleUpdateOffer = (updatedOffer: Offer) => {
        dispatch({ type: 'SAVE_OFFER', payload: updatedOffer });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Oferta guardada!', type: 'success' } });
        setEditingOffer(null);
    };

    const handleSaveGalleryImage = (imageData: Omit<GalleryImage, 'id' | 'likes'>) => {
        dispatch({ type: 'ADD_GALLERY_IMAGE', payload: imageData });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Imagen añadida!', type: 'success' } });
        setIsAddingImage(false);
    };
    
    const handleUpdateStatus = (order: Order, status: Order['status']) => {
        dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status }});
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: `Estado del pedido actualizado.`, type: 'success' } });

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
        
        dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId: order.id, status: 'confirmed', estimatedTime } });
        dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Tiempo de entrega enviado!', type: 'success' } });

        const customerPhone = customer.phone.replace(/\D/g, '');
        const finalPhone = customerPhone.startsWith('52') ? `521${customerPhone.substring(2)}` : `521${customerPhone}`;
        const message = `¡Hola, ${customer.name.split(' ')[0]}! Tu pedido en MiniDonuts Betty ha sido confirmado. Estará listo en aproximadamente: ${estimatedTime}. ¡Gracias por tu compra!`;
        const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        setSelectedOrder(null);
        setEstimatedTime('');
    };

    const renderOrders = () => {
        const pendingOrders = state.orders.filter(o => o.status === 'pending').sort((a,b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
        const activeOrders = state.orders.filter(o => o.status === 'confirmed' || o.status === 'in_progress').sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        const completedOrders = state.orders.filter(o => o.status === 'ready').sort((a,b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
        
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
                                    <p className="text-xs bg-blue-100 p-1 rounded font-mono">Transferencia a: {state.settings.adminCardNumber}</p>
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
                                                {item.frosting && <li>Frosting: {item.frosting.name}</li>}
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
                            <p className="text-xs text-stone-500">{new Date(order.orderDate).toLocaleString()}</p>
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
                <table className="min-w-full"><thead className="bg-stone-100"><tr><th className="py-2 px-4 text-left">Nombre</th><th className="py-2 px-4 text-left">Email</th><th className="py-2 px-4 text-left">Teléfono</th><th className="py-2 px-4 text-right">Acciones</th></tr></thead>
                    <tbody>{users.filter(u => u.role === 'client').map((user: User) => (<tr key={user.id} className="border-b hover:bg-amber-50"><td className="py-2 px-4">{user.name}</td><td className="py-2 px-4">{user.email}</td><td className="py-2 px-4">{user.phone}</td><td className="py-2 px-4 text-right"><button onClick={() => setViewingUser(user)} className="bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 text-sm">Ver Pedidos</button></td></tr>))}</tbody>
                </table>
            </div>
        </div>
    );

    const renderInventory = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gestión de Inventario</h3>
                <button onClick={handleAddItem} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors">
                    Añadir Nuevo Ítem
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                    <thead className="bg-stone-100"><tr><th className="py-3 px-4 text-left w-16">Imagen</th><th className="py-3 px-4 text-left">Nombre</th><th className="py-3 px-4 text-left">Categoría</th><th className="py-3 px-4 text-right">Costo</th><th className="py-3 px-4 text-right">Precio Venta</th><th className="py-3 px-4 text-right">Cantidad</th><th className="py-3 px-4 text-right">Alerta Stock</th><th className="py-3 px-4 text-center">Acciones</th></tr></thead>
                    <tbody>
                        {inventory.map((item) => {
                            const isLowStock = item.quantity <= item.lowStockThreshold;
                            const isRaw = item.type === 'materia_prima';
                            return (
                                <tr key={item.id} className="border-b hover:bg-amber-50">
                                    <td className="py-2 px-4">
                                        <div className="w-12 h-12 bg-stone-200 rounded-md flex items-center justify-center overflow-hidden">
                                        {item.imageUrl ? <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" /> : <span className="text-xs text-stone-500">N/A</span>}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">{item.name}</td>
                                    <td className="py-3 px-4 capitalize">{isRaw ? 'Materia Prima' : item.type}</td>
                                    <td className="py-3 px-4 text-right">${item.cost.toFixed(2)}</td>
                                    <td className={`py-3 px-4 text-right ${isRaw ? 'text-stone-400' : ''}`}>{isRaw ? 'N/A' : `$${item.price.toFixed(2)}`}</td>
                                    <td className={`py-3 px-4 text-right font-semibold ${isLowStock ? 'text-red-500' : 'text-green-600'}`}>{item.quantity}</td>
                                    <td className="py-3 px-4 text-right">{item.lowStockThreshold}</td>
                                    <td className="py-3 px-4 text-center">
                                        <button onClick={() => handleEditClick(item)} className="bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 text-sm">Editar</button>
                                        <button onClick={() => setItemToDelete(item)} className="ml-2 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm">Eliminar</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const renderOffers = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Gestión de Ofertas</h3>
                <button onClick={handleAddOffer} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors">
                    Añadir Oferta
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-lg shadow flex flex-col">
                        <div className="w-full h-40 bg-stone-200 rounded-t-lg flex items-center justify-center overflow-hidden">
                            {offer.imageUrl ? <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" /> : <span className="text-xs text-stone-500">Sin imagen</span>}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <h4 className="font-bold text-lg text-stone-800">{offer.title}</h4>
                            <p className="text-sm text-stone-600 mt-1 flex-grow">{offer.description}</p>
                            <div className="mt-4 pt-4 border-t text-right space-x-2">
                                <button onClick={() => setEditingOffer(offer)} className="bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 text-sm">Editar</button>
                                <button onClick={() => setOfferToDelete(offer)} className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm">Eliminar</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderGallery = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Galería de Trabajos</h3>
                <button onClick={() => setIsAddingImage(true)} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors">
                    Añadir Imagen
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map(image => (
                    <div key={image.id} className="relative group aspect-square bg-stone-200 rounded-lg overflow-hidden shadow">
                        <img src={image.imageUrl} alt={image.caption || 'Imagen de la galería'} className="w-full h-full object-cover"/>
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex flex-col justify-between p-3">
                            <p className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity break-words">{image.caption}</p>
                            <button onClick={() => setImageToDelete(image)} className="self-end bg-red-600 text-white px-2 py-1 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700">
                                Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {gallery.length === 0 && (
                 <div className="text-center py-16 bg-white/80 rounded-lg shadow-md">
                    <h3 className="text-2xl font-semibold text-stone-700">Tu galería está vacía</h3>
                    <p className="text-stone-500 mt-2">Añade imágenes de tus trabajos para que los clientes las vean.</p>
                </div>
            )}
        </div>
    );

    const RecipeManager: React.FC = () => {
        const { productRecipes: recipes } = state;
        const [editingRecipe, setEditingRecipe] = useState<ProductRecipe | null>(null);

        const handleSaveRecipe = (recipe: ProductRecipe) => {
            dispatch({ type: 'SAVE_RECIPE', payload: recipe });
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: '¡Receta guardada!', type: 'success' } });
            setEditingRecipe(null);
        };
    
        const handleCreateRecipe = () => {
            setEditingRecipe({
                id: '', 
                name: '',
                description: '',
                imageUrl: '',
                productType: 'donita',
                ingredients: [],
                overheadCost: 0,
                profitMargin: 100,
                sellingPrice: 0,
                recipeYield: 1,
            });
        };
    
        const recipesWithCalculations = useMemo(() => recipes.map(recipe => {
            const ingredientCost = recipe.ingredients.reduce((total, recipeIngredient) => {
                const inventoryItem = inventory.find(i => i.id === recipeIngredient.ingredientId);
                if (!inventoryItem || !inventoryItem.packageSize) return total;
                return total + (recipeIngredient.amount / inventoryItem.packageSize) * inventoryItem.cost;
            }, 0);
            const totalCost = ingredientCost + recipe.overheadCost;
            const costPerUnit = recipe.recipeYield > 0 ? totalCost / recipe.recipeYield : 0;
            return { ...recipe, totalCost, costPerUnit };
        }), [recipes, inventory]);
    
        if (editingRecipe) {
            return (
                <RecipeEditor
                    recipe={editingRecipe}
                    inventory={inventory}
                    onSave={handleSaveRecipe}
                    onCancel={() => setEditingRecipe(null)}
                />
            );
        }
    
        return (
            <div>
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Mis Recetas de Productos</h3>
                    <button onClick={handleCreateRecipe} className="bg-emerald-600 text-white font-bold py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors">
                        Crear Nueva Receta
                    </button>
                </div>
                 {recipes.length === 0 ? (
                    <div className="text-center py-16 bg-white/80 rounded-lg shadow-md">
                        <h3 className="text-2xl font-semibold text-stone-700">Aún no tienes recetas</h3>
                        <p className="text-stone-500 mt-2">Crea una receta para calcular los costos y vender productos terminados.</p>
                    </div>
                ) : (
                <div className="space-y-4">
                    {recipesWithCalculations.map(recipe => (
                        <div key={recipe.id} className="bg-white p-4 rounded-lg shadow-md border flex flex-wrap justify-between items-center gap-4">
                            <div>
                                <h4 className="font-bold text-lg text-stone-800">{recipe.name}</h4>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                                    <span className="text-amber-700">Receta para: <strong>{recipe.recipeYield} uds.</strong></span>
                                    <span className="text-red-600">Costo total: <strong>${recipe.totalCost?.toFixed(2)}</strong></span>
                                    <span className="text-red-600">Costo / ud: <strong>${recipe.costPerUnit?.toFixed(2)}</strong></span>
                                    <span className="text-green-600">Precio Venta / ud: <strong>${recipe.sellingPrice.toFixed(2)}</strong></span>
                                </div>
                            </div>
                            <div className="space-x-2 flex-shrink-0">
                                <button onClick={() => setEditingRecipe(recipe)} className="bg-sky-600 text-white px-3 py-1 rounded-md hover:bg-sky-700 text-sm">Editar</button>
                                <button onClick={() => setRecipeToDelete(recipe)} className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 text-sm">Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
                 )}
            </div>
        );
    };

    const RecipeEditor: React.FC<{
        recipe: ProductRecipe;
        inventory: InventoryItem[];
        onSave: (recipe: ProductRecipe) => void;
        onCancel: () => void;
    }> = ({ recipe: initialRecipe, inventory, onSave, onCancel }) => {
        const [recipe, setRecipe] = useState(initialRecipe);
        const [userModifiedSellingPrice, setUserModifiedSellingPrice] = useState(!!initialRecipe.sellingPrice);
        const [isGenerating, setIsGenerating] = useState(false);
        const fileInputRef = useRef<HTMLInputElement>(null);
        
        const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
            { value: 'donita', label: 'Donita' },
            { value: 'pastel', label: 'Pastel' },
            { value: 'cupcake', label: 'Cupcake / Bollito' }
        ];

        const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setRecipe(prev => ({ ...prev, imageUrl: reader.result as string }));
                reader.readAsDataURL(file);
            }
        };

        const handleGenerateImage = async () => {
            if (!recipe.name) {
                alert('Por favor, introduce un nombre para el producto antes de generar una imagen.');
                return;
            }
            setIsGenerating(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = `Fotografía de producto de alta calidad de un postre llamado "${recipe.name}", sobre un fondo de colores pastel, estilo minimalista y apetitoso.`;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash-image',
                    contents: { parts: [{ text: prompt }] },
                    config: { responseModalities: [Modality.IMAGE] },
                });

                if (response?.candidates?.[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData) {
                            const base64ImageBytes = part.inlineData.data;
                            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                            setRecipe(prev => ({ ...prev, imageUrl }));
                            return;
                        }
                    }
                }
                alert("No se pudo generar la imagen. Respuesta inválida de la IA.");
            } catch (error) {
                console.error("Error generating image:", error);
                alert("Hubo un error al generar la imagen.");
            } finally {
                setIsGenerating(false);
            }
        };


        const handleIngredientChange = (ingredientId: string, amount: number) => {
            const existing = recipe.ingredients.find(i => i.ingredientId === ingredientId);
            if (existing) {
                setRecipe({ ...recipe, ingredients: recipe.ingredients.map(i => i.ingredientId === ingredientId ? { ...i, amount } : i) });
            }
        };

        const addIngredientToRecipe = (item: InventoryItem) => {
            if(!recipe.ingredients.some(i => i.ingredientId === item.id)) {
                setRecipe({...recipe, ingredients: [...recipe.ingredients, { ingredientId: item.id, amount: 0 }]});
            }
        }

        const removeIngredientFromRecipe = (ingredientId: string) => {
            setRecipe({...recipe, ingredients: recipe.ingredients.filter(i => i.ingredientId !== ingredientId)});
        }
    
        const { ingredientCost, totalCost, costPerUnit, suggestedPrice } = useMemo(() => {
            const ingredientCost = recipe.ingredients.reduce((total, recipeIngredient) => {
                const inventoryItem = inventory.find(i => i.id === recipeIngredient.ingredientId);
                if (!inventoryItem || !inventoryItem.packageSize) return total; // Avoid division by zero
                return total + (recipeIngredient.amount / inventoryItem.packageSize) * inventoryItem.cost;
            }, 0);
            const totalCost = ingredientCost + recipe.overheadCost;
            const costPerUnit = recipe.recipeYield > 0 ? totalCost / recipe.recipeYield : 0;
            const suggestedPrice = costPerUnit * (1 + recipe.profitMargin / 100);
            return { ingredientCost, totalCost, costPerUnit, suggestedPrice };
        }, [recipe.ingredients, recipe.overheadCost, recipe.profitMargin, inventory, recipe.recipeYield]);
        
        useEffect(() => {
            if (!userModifiedSellingPrice && suggestedPrice) {
                setRecipe(prev => ({...prev, sellingPrice: parseFloat(suggestedPrice.toFixed(2))}));
            }
        }, [suggestedPrice, userModifiedSellingPrice]);

        const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setUserModifiedSellingPrice(true);
            setRecipe(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }));
        };
    
        return (
             <div className="bg-white p-6 rounded-lg shadow-xl border animate-fade-in-up">
                 <div className="flex justify-between items-center border-b pb-3 mb-4">
                     <h3 className="text-xl font-bold text-stone-800">Editor de Receta</h3>
                     <button onClick={onCancel} className="text-stone-500 hover:text-stone-800 text-2xl leading-none">&times;</button>
                </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 bg-stone-50 p-3 rounded-lg border space-y-4">
                        <div>
                             <h4 className="font-semibold mb-2">Imagen del Producto</h4>
                             <div className="w-full h-40 bg-stone-200 rounded-md mb-2 flex items-center justify-center overflow-hidden">
                                {isGenerating ? <div className="text-stone-500">Generando...</div> : recipe.imageUrl ? <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" /> : <div className="text-stone-500 text-sm">Sin imagen</div>}
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />
                            <div className="grid grid-cols-2 gap-2">
                                <button type="button" onClick={handleGenerateImage} disabled={isGenerating} className="w-full bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-700 text-sm disabled:bg-gray-400">
                                    {isGenerating ? '...' : 'Con IA'}
                                </button>
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full bg-stone-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-stone-700">
                                    Subir
                                </button>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-2">Añadir Ingredientes</h4>
                            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                                {inventory.filter(ing => ing.type === 'materia_prima').map(ing => (
                                    <div key={ing.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                        <span className="text-sm">{ing.name}</span>
                                        <button onClick={() => addIngredientToRecipe(ing)} className="bg-emerald-500 text-white text-xs px-2 py-1 rounded hover:bg-emerald-600">+</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                 <label className="block text-sm font-medium text-stone-700 mb-1">Nombre del Producto Final</label>
                                 <input type="text" value={recipe.name} onChange={e => setRecipe({...recipe, name: e.target.value})} placeholder="Ej: Dona de Fresa Premium" className="w-full px-3 py-2 border border-stone-300 rounded-lg"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Tipo de Producto</label>
                                <select
                                    value={recipe.productType}
                                    onChange={e => setRecipe({ ...recipe, productType: e.target.value as ProductType })}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                                >
                                    {PRODUCT_TYPES.map(pt => (
                                        <option key={pt.value} value={pt.value}>{pt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-stone-700 mb-1">Esta receta produce:</label>
                             <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        value={recipe.recipeYield} 
                                        onChange={e => setRecipe({...recipe, recipeYield: Math.max(1, parseInt(e.target.value, 10) || 1) })} 
                                        min="1"
                                        className="w-24 pl-3 pr-8 py-2 border border-stone-300 rounded-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-stone-500"
                                    />
                                    <div className="absolute right-0 top-0 bottom-0 flex flex-col items-center justify-center w-7 rounded-r-lg overflow-hidden">
                                        <button 
                                            type="button" 
                                            onClick={() => setRecipe(prev => ({...prev, recipeYield: (prev.recipeYield || 0) + 1}))}
                                            className="h-1/2 w-full text-stone-500 hover:text-stone-800 flex items-center justify-center bg-stone-50/50 hover:bg-stone-100 border-b border-stone-200"
                                            aria-label="Aumentar cantidad"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={() => setRecipe(prev => ({...prev, recipeYield: Math.max(1, (prev.recipeYield || 1) - 1)}))}
                                            className="h-1/2 w-full text-stone-500 hover:text-stone-800 flex items-center justify-center bg-stone-50/50 hover:bg-stone-100"
                                            aria-label="Disminuir cantidad"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                                        </button>
                                    </div>
                                </div>
                                <span className="text-stone-600">unidades</span>
                             </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700 mb-1">Descripción (para el cliente)</label>
                            <textarea value={recipe.description} onChange={e => setRecipe({...recipe, description: e.target.value})} rows={2} placeholder="Ej: Deliciosa dona cubierta de..." className="w-full px-3 py-2 border border-stone-300 rounded-lg" />
                        </div>
                        <div>
                             <h4 className="font-semibold mb-2">Ingredientes en la Receta</h4>
                            <div className="space-y-3 p-3 bg-stone-50 rounded-lg border">
                                {recipe.ingredients.length === 0 && <p className="text-stone-500 text-center py-4">Añade ingredientes para empezar.</p>}
                                {recipe.ingredients.map(recipeIng => {
                                    const item = inventory.find(i => i.id === recipeIng.ingredientId);
                                    if (!item) return null;
                                    return (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                            <span className="col-span-5 text-sm">{item.name}</span>
                                            <div className="col-span-5 flex items-center">
                                                <input type="number" value={recipeIng.amount} onChange={e => handleIngredientChange(item.id, parseFloat(e.target.value) || 0)} className="w-full px-2 py-1 border border-stone-300 rounded-md"/>
                                                <span className="ml-2 text-sm text-stone-600">{item.unit}</span>
                                            </div>
                                            <div className="col-span-1 text-right font-semibold text-sm">${((recipeIng.amount / item.packageSize) * item.cost).toFixed(2)}</div>
                                            <button onClick={() => removeIngredientFromRecipe(item.id)} className="col-span-1 text-red-500 hover:text-red-700 font-bold text-center">×</button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                         <div className="p-4 bg-stone-50 rounded-lg border space-y-3">
                            <div className="flex justify-between items-center"><span className="text-stone-600">Costo de Ingredientes:</span><span className="font-bold text-stone-800">${ingredientCost.toFixed(2)}</span></div>
                            <div className="flex items-center gap-4">
                               <label className="text-stone-600">Costos Adicionales (empaque, etc.):</label>
                               <input type="number" value={recipe.overheadCost} onChange={e => setRecipe({...recipe, overheadCost: parseFloat(e.target.value) || 0})} className="w-24 px-2 py-1 border border-stone-300 rounded-md" />
                            </div>
                            <div className="border-t pt-2 mt-2">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span className="text-red-700">Costo Total de la Receta:</span>
                                    <span className="text-red-600">${totalCost.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center text-base font-semibold">
                                    <span className="text-red-700">Costo por Unidad:</span>
                                    <span className="text-red-600">${costPerUnit.toFixed(2)}</span>
                                </div>
                            </div>
                         </div>
                          <div className="p-4 bg-sky-50 rounded-lg border space-y-3">
                            <h4 className="font-semibold text-sky-800">Análisis de Precio y Ganancia</h4>
                            <div className="flex items-center gap-4 pb-3 border-b">
                                <label className="text-stone-600 flex-1">Margen de ganancia deseado:</label>
                                <div className="flex items-center">
                                    <input type="number" value={recipe.profitMargin} onChange={e => setRecipe({...recipe, profitMargin: parseFloat(e.target.value) || 0})} className="w-20 text-right px-2 py-1 border border-stone-300 rounded-md" />
                                    <span className="ml-2">%</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-lg font-bold">
                                <span className="text-green-700">Precio de Venta Sugerido (por unidad):</span>
                                <span className="text-green-600">${suggestedPrice.toFixed(2)}</span>
                            </div>
                             <div className="pt-4 border-t mt-4">
                                <div className="flex items-center gap-4">
                                    <label className="text-stone-700 font-bold flex-1">PRECIO DE VENTA FINAL (por unidad):</label>
                                    <div className="flex items-center">
                                        <span className="mr-2 text-xl font-bold">$</span>
                                        <input type="number" step="0.50" value={recipe.sellingPrice} onChange={handleSellingPriceChange} className="w-28 text-right px-2 py-1 border-2 border-stone-400 rounded-md text-xl font-bold" />
                                    </div>
                                </div>
                                {(() => {
                                    const profit = recipe.sellingPrice - costPerUnit;
                                    const profitPercentage = costPerUnit > 0 ? (profit / costPerUnit) * 100 : (recipe.sellingPrice > 0 ? Infinity : 0);
                                    const isLoss = profit < 0;
                                    return (
                                        <div className={`mt-3 flex justify-between items-center text-base font-bold p-2 rounded-md ${isLoss ? 'bg-red-100' : 'bg-green-100'}`}>
                                            <span className={isLoss ? 'text-red-700' : 'text-green-700'}>Tu ganancia por unidad será de:</span>
                                            <div>
                                                <span className={isLoss ? 'text-red-600' : 'text-green-600'}>${profit.toFixed(2)}</span>
                                                <span className={`text-sm ml-2 ${isLoss ? 'text-red-500' : 'text-green-500'}`}>({profitPercentage.toFixed(0)}%)</span>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                          </div>
                    </div>
                 </div>

                 <div className="flex justify-end gap-4 pt-6 mt-6 border-t">
                    <button type="button" onClick={onCancel} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">Cancelar</button>
                    <button type="button" onClick={() => onSave(recipe)} className="bg-stone-700 text-white px-4 py-2 rounded-lg hover:bg-stone-800 transition-colors">Guardar Receta</button>
                </div>
             </div>
        )
    };
    

    const renderSettings = () => {
        if (!localSettings || !state.currentUser) {
            return (
                <div className="bg-white p-6 rounded-lg shadow text-center text-stone-500">
                    Cargando ajustes...
                </div>
            );
        }
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-xl font-bold mb-4">Ajustes Generales</h3>
                    <form onSubmit={handleSaveSettings} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Teléfono de Contacto (WhatsApp)</label>
                            <input type="tel" name="adminPhoneNumber" value={localSettings.adminPhoneNumber} onChange={handleSettingsChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Tarjeta para Transferencias</label>
                            <input type="text" name="adminCardNumber" value={localSettings.adminCardNumber} onChange={handleSettingsChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Tarifa de Envío a Domicilio ($)</label>
                            <input type="number" name="deliveryFee" step="0.01" value={localSettings.deliveryFee} onChange={handleSettingsChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-stone-700">Oferta de Cumpleaños</label>
                            <textarea name="birthdayOfferDescription" value={localSettings.birthdayOffer.description} onChange={handleSettingsChange} rows={3} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                        </div>
                        <div className="text-right pt-2">
                            <button type="submit" className="bg-stone-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-stone-800">Guardar Ajustes</button>
                        </div>
                    </form>
                </div>
                <div className="space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow">
                         <h3 className="text-xl font-bold mb-4">Datos de Administrador</h3>
                         <form onSubmit={handleAdminProfileSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700">Nombre de Administrador</label>
                                <input type="text" name="name" value={adminProfile.name} onChange={handleAdminProfileChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700">Correo Electrónico de Administrador</label>
                                <input type="email" name="email" value={adminProfile.email} onChange={handleAdminProfileChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                            </div>
                             <div className="text-right pt-2">
                                <button type="submit" className="bg-stone-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-stone-800">Guardar Datos</button>
                            </div>
                         </form>
                    </div>
                     <div className="bg-white p-6 rounded-lg shadow">
                         <h3 className="text-xl font-bold mb-4">Cambiar Contraseña</h3>
                         <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-stone-700">Contraseña Actual</label>
                                <input type="password" name="currentPassword" value={adminPassword.currentPassword} onChange={handleAdminPasswordChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700">Nueva Contraseña</label>
                                <input type="password" name="newPassword" value={adminPassword.newPassword} onChange={handleAdminPasswordChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-stone-700">Confirmar Nueva Contraseña</label>
                                <input type="password" name="confirmPassword" value={adminPassword.confirmPassword} onChange={handleAdminPasswordChange} className="mt-1 block w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm"/>
                            </div>
                             <div className="text-right pt-2">
                                <button type="submit" className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700">Actualizar Contraseña</button>
                            </div>
                         </form>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-amber-50">
            <header className="bg-white shadow-md sticky top-0 z-40">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <Logo className="h-10 w-10" />
                                <h2 className="text-2xl font-pacifico text-amber-900">Admin</h2>
                            </div>
                        </div>
                        
                        <nav className="flex-grow flex justify-center items-center gap-1 sm:gap-2 flex-wrap">
                            {tabs.map(tab => (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id)} 
                                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ease-in-out ${activeTab === tab.id ? 'bg-stone-200 text-stone-800' : 'text-stone-600 hover:bg-stone-100 hover:text-stone-800'}`}
                                >
                                    {tab.icon}
                                    <span className="hidden md:inline">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                        
                        <div className="flex-shrink-0">
                            <button onClick={handleLogout} className="flex items-center gap-2 text-stone-600 hover:text-rose-600 p-2 rounded-md hover:bg-rose-100/80 transition-colors">
                                <LogoutIcon />
                                <span className="hidden lg:inline text-sm font-medium">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {activeTab === 'orders' && renderOrders()}
                {activeTab === 'finances' && renderFinances()}
                {activeTab === 'inventory' && renderInventory()}
                {activeTab === 'recipes' && <RecipeManager />}
                {activeTab === 'gallery' && renderGallery()}
                {activeTab === 'offers' && renderOffers()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'settings' && renderSettings()}
            </main>
            
            {itemToDelete && (
                <ConfirmationModal
                    title="Confirmar Eliminación"
                    message={
                        <p>
                            ¿Estás seguro de que quieres eliminar "<strong>{itemToDelete.name}</strong>"?
                            <br />
                            Esta acción no se puede deshacer.
                        </p>
                    }
                    onConfirm={confirmDeleteItem}
                    onCancel={() => setItemToDelete(null)}
                    confirmButtonText="Sí, Eliminar"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            {offerToDelete && (
                <ConfirmationModal
                    title="Confirmar Eliminación de Oferta"
                    message={
                        <p>
                            ¿Estás seguro de que quieres eliminar la oferta "<strong>{offerToDelete.title}</strong>"?
                            <br />
                            Esta acción no se puede deshacer.
                        </p>
                    }
                    onConfirm={confirmDeleteOffer}
                    onCancel={() => setOfferToDelete(null)}
                    confirmButtonText="Sí, Eliminar"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            {recipeToDelete && (
                <ConfirmationModal
                    title="Confirmar Eliminación de Receta"
                    message={
                        <p>
                            ¿Estás seguro de que quieres eliminar la receta "<strong>{recipeToDelete.name}</strong>"?
                            <br />
                            Esto también eliminará el producto asociado de la tienda.
                        </p>
                    }
                    onConfirm={confirmDeleteRecipe}
                    onCancel={() => setRecipeToDelete(null)}
                    confirmButtonText="Sí, Eliminar"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            {imageToDelete && (
                <ConfirmationModal
                    title="Confirmar Eliminación"
                    message={
                        <p>
                            ¿Estás seguro de que quieres eliminar esta imagen de la galería?
                            <br />
                            Esta acción no se puede deshacer.
                        </p>
                    }
                    onConfirm={confirmDeleteGalleryImage}
                    onCancel={() => setImageToDelete(null)}
                    confirmButtonText="Sí, Eliminar"
                    confirmButtonClass="bg-red-600 hover:bg-red-700"
                />
            )}
            {editingItem && <EditItemModal item={editingItem} onClose={() => setEditingItem(null)} onSave={handleUpdateItem} />}
            {editingOffer && <EditOfferModal offer={editingOffer} onClose={() => setEditingOffer(null)} onSave={handleUpdateOffer} />}
            {isAddingImage && <AddGalleryImageModal onClose={() => setIsAddingImage(false)} onSave={handleSaveGalleryImage} />}
            {viewingUser && <UserOrdersModal user={viewingUser} orders={orders} onClose={() => setViewingUser(null)} />}

        </div>
    );
};

export default AdminDashboard;