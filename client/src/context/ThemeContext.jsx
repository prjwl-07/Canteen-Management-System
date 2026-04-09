import React, { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // Color Theme: 'indigo' | 'rose' | 'orange'
    const [colorTheme, setColorTheme] = useState(() => localStorage.getItem('theme_color') || 'indigo');
    // Mode: 'light' | 'dark'
    const [mode, setMode] = useState(() => localStorage.getItem('theme_mode') || 'light');

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old classes
        root.classList.remove('theme-indigo', 'theme-rose', 'theme-orange', 'dark');

        // Add new classes
        root.classList.add(`theme-${colorTheme}`);
        if (mode === 'dark') {
            root.classList.add('dark');
        }

        // Persist
        localStorage.setItem('theme_color', colorTheme);
        localStorage.setItem('theme_mode', mode);

    }, [colorTheme, mode]);

    const toggleMode = () => {
        setMode(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ colorTheme, setColorTheme, mode, toggleMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
