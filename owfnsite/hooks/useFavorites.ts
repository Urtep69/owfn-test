import { useState, useEffect, useCallback } from 'react';

const useFavorites = (storageKey: string) => {
    const [favorites, setFavorites] = useState<Set<string>>(() => {
        try {
            const item = window.localStorage.getItem(storageKey);
            return item ? new Set(JSON.parse(item)) : new Set();
        } catch (error) {
            console.error("Error reading from localStorage", error);
            return new Set();
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(storageKey, JSON.stringify(Array.from(favorites)));
        } catch (error) {
            console.error("Error writing to localStorage", error);
        }
    }, [favorites, storageKey]);

    const toggleFavorite = useCallback((id: string) => {
        setFavorites(prevFavorites => {
            const newFavorites = new Set(prevFavorites);
            if (newFavorites.has(id)) {
                newFavorites.delete(id);
            } else {
                newFavorites.add(id);
            }
            return newFavorites;
        });
    }, []);

    const isFavorite = useCallback((id: string) => {
        return favorites.has(id);
    }, [favorites]);

    return { favorites, toggleFavorite, isFavorite };
};

export default useFavorites;