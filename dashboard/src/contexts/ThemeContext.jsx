import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

const themes = {
    dark: {
        name: 'Dark',
        description: 'Professional dark theme for focused monitoring',
        class: 'theme-dark'
    },
    light: {
        name: 'Light',
        description: 'Clean white theme for better readability',
        class: 'theme-light'
    }
};

export function ThemeProvider({ children }) {
    const [currentTheme, setCurrentTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('app-theme');
            return (savedTheme && themes[savedTheme]) ? savedTheme : 'dark';
        }
        return 'dark';
    });

    useEffect(() => {
        const root = document.documentElement;

        Object.values(themes).forEach(theme => {
            root.classList.remove(theme.class);
        });

        root.classList.add(themes[currentTheme].class);
        localStorage.setItem('app-theme', currentTheme);
    }, [currentTheme]);

    const switchTheme = (themeName) => {
        if (themes[themeName]) {
            setCurrentTheme(themeName);
        }
    };

    const value = {
        currentTheme,
        themes,
        switchTheme,
        theme: themes[currentTheme]
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}