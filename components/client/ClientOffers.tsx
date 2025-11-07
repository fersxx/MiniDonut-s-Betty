import React, { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

const ClientOffers: React.FC = () => {
    const { state } = useContext(AppContext);
    const { offers } = state;

    return (
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-pacifico text-amber-900">Ofertas Especiales</h1>
                <p className="text-stone-600 mt-2">¡Aprovecha nuestros descuentos y promociones exclusivas!</p>
            </div>

            {offers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {offers.map(offer => (
                        <div key={offer.id} className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-amber-200/50 overflow-hidden flex flex-col">
                            <div className="w-full h-48 bg-stone-100 flex items-center justify-center overflow-hidden">
                                {offer.imageUrl ? (
                                    <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center p-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-rose-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                                        </svg>
                                        <p className="text-stone-400 mt-2 text-sm">Imagen no disponible</p>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-stone-800 mb-2">{offer.title}</h3>
                                <p className="text-stone-600 text-sm flex-grow">{offer.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/80 rounded-lg shadow-md">
                    <h3 className="text-2xl font-semibold text-stone-700">No hay ofertas disponibles</h3>
                    <p className="text-stone-500 mt-2">Vuelve pronto para ver nuevas promociones.</p>
                </div>
            )}
        </div>
    );
};

export default ClientOffers;
