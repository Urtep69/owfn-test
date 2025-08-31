
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageSlideshowProps {
    imageUrls: string[];
    altText: string;
}

export const ImageSlideshow: React.FC<ImageSlideshowProps> = ({ imageUrls, altText }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!imageUrls || imageUrls.length === 0) {
        // Fallback image if no images are provided for a case
        return <img src="https://picsum.photos/seed/placeholder/1200/800" alt="Placeholder" className="w-full h-64 md:h-96 object-cover" />;
    }

    const goToPrevious = () => {
        const isFirstSlide = currentIndex === 0;
        const newIndex = isFirstSlide ? imageUrls.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
    };

    const goToNext = () => {
        const isLastSlide = currentIndex === imageUrls.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
    };

    return (
        <div className="relative w-full h-64 md:h-96">
            <div className="w-full h-full rounded-t-lg bg-cover bg-center transition-all duration-500" style={{ backgroundImage: `url(${imageUrls[currentIndex]})` }}>
            </div>
            {imageUrls.length > 1 && (
                <>
                    <button onClick={goToPrevious} className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                    <button onClick={goToNext} className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60 transition-colors">
                        <ChevronRight size={24} />
                    </button>
                </>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {imageUrls.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => setCurrentIndex(slideIndex)}
                        className={`w-3 h-3 rounded-full cursor-pointer transition-all ${currentIndex === slideIndex ? 'bg-white scale-110' : 'bg-white/50'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
};
