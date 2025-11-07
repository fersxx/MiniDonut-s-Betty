import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { GalleryImage } from '../../types';

const ImageModal: React.FC<{ 
    images: GalleryImage[]; 
    currentIndex: number;
    onClose: () => void;
    onNavigate: (index: number) => void;
}> = ({ images, currentIndex, onClose, onNavigate }) => {
    const image = images[currentIndex];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' && currentIndex > 0) {
                onNavigate(currentIndex - 1);
            } else if (e.key === 'ArrowRight' && currentIndex < images.length - 1) {
                onNavigate(currentIndex + 1);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, images.length, onNavigate, onClose]);

    if (!image) {
        return null;
    }

    const isFirstImage = currentIndex === 0;
    const isLastImage = currentIndex === images.length - 1;

    return (
        <div onClick={onClose} className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-[100] p-4 animate-fade-in">
            <div className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                
                <div className="flex flex-col items-center gap-2">
                    <img src={image.imageUrl} alt={image.caption} className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"/>
                    <div className="text-white text-center bg-black bg-opacity-50 py-1 px-3 rounded-lg w-fit">
                        {image.caption && <p>{image.caption}</p>}
                        <p className="text-xs opacity-80">{currentIndex + 1} / {images.length}</p>
                    </div>
                </div>

                <button onClick={onClose} className="absolute -top-2 -right-2 text-white bg-rose-600 rounded-full h-8 w-8 flex items-center justify-center text-xl shadow-lg z-10 hover:bg-rose-700 transition-colors">&times;</button>
                
                <button 
                    onClick={() => onNavigate(currentIndex - 1)} 
                    disabled={isFirstImage}
                    className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous image"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button 
                    onClick={() => onNavigate(currentIndex + 1)}
                    disabled={isLastImage}
                    className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next image"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
            <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }`}</style>
        </div>
    );
};


const HeartIconFilled: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

const HeartIconOutline: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);

const ClientGallery: React.FC = () => {
    const { state, dispatch } = useContext(AppContext);
    const { gallery, currentUser } = state;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (selectedIndex !== null && selectedIndex >= gallery.length) {
            setSelectedIndex(null);
        }
    }, [gallery.length, selectedIndex]);

    const handleToggleLike = (imageId: string) => {
        if (!currentUser) {
            dispatch({ type: 'SET_NOTIFICATION', payload: { message: 'Debes iniciar sesión para dar me gusta', type: 'error' } });
            return;
        }
        dispatch({ type: 'TOGGLE_GALLERY_LIKE', payload: { imageId, userId: currentUser.id } });
    };


    return (
        <div className="container mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-pacifico text-amber-900">Nuestra Galería</h1>
                <p className="text-stone-600 mt-2">¡Un vistazo a nuestras creaciones más dulces!</p>
            </div>

            {gallery.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((image, index) => {
                        const isLiked = currentUser?.likedImages?.includes(image.id) ?? false;
                        return (
                             <div key={image.id} className="group overflow-hidden rounded-lg shadow-md aspect-square bg-stone-200 relative">
                                <img onClick={() => setSelectedIndex(index)} src={image.imageUrl} alt={image.caption} className="cursor-pointer w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"/>
                                
                                <div className="absolute top-2 right-2 flex items-center gap-1.5 transition-opacity opacity-0 group-hover:opacity-100">
                                    <div className="bg-black/40 backdrop-blur-sm p-1.5 rounded-full flex items-center gap-1.5 text-white text-xs">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleLike(image.id);
                                            }}
                                            className="transform transition-transform active:scale-125 focus:outline-none"
                                            aria-label={isLiked ? "Quitar me gusta" : "Dar me gusta"}
                                        >
                                            {isLiked ? 
                                                <HeartIconFilled className="w-5 h-5 text-red-500"/> : 
                                                <HeartIconOutline className="w-5 h-5 text-white hover:text-red-300"/>
                                            }
                                        </button>
                                        <span className="font-semibold">{image.likes}</span>
                                    </div>
                                </div>
                                
                                {image.caption && <div onClick={() => setSelectedIndex(index)} className="cursor-pointer absolute inset-x-0 bottom-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 text-white p-2 text-xs truncate transition-all opacity-0 group-hover:opacity-100">{image.caption}</div>}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-16 bg-white/80 rounded-lg shadow-md">
                    <h3 className="text-2xl font-semibold text-stone-700">Galería en construcción</h3>
                    <p className="text-stone-500 mt-2">Pronto mostraremos aquí nuestros mejores trabajos.</p>
                </div>
            )}
            
            {selectedIndex !== null && (
                 <ImageModal 
                    images={gallery} 
                    currentIndex={selectedIndex} 
                    onClose={() => setSelectedIndex(null)} 
                    onNavigate={setSelectedIndex}
                />
            )}
        </div>
    );
};

export default ClientGallery;