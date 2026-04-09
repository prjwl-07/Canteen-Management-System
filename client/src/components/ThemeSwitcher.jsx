import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Palette, Moon, Sun, Check } from 'lucide-react';

const ThemeSwitcher = () => {
    const { colorTheme, setColorTheme, mode, toggleMode } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const themes = [
        { id: 'indigo', name: 'Indigo', color: 'bg-indigo-600' },
        { id: 'rose', name: 'Rose', color: 'bg-rose-600' },
        { id: 'orange', name: 'Orange', color: 'bg-orange-600' },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-xl bg-white/50 hover:bg-white text-secondary-600 hover:text-primary-600 transition shadow-sm border border-secondary-200"
            >
                <Palette size={20} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 p-3 bg-white rounded-2xl shadow-xl border border-secondary-100 min-w-[200px] z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="mb-3">
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-2">Color Theme</p>
                        <div className="grid grid-cols-3 gap-2">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setColorTheme(t.id)}
                                    className={`h-8 w-full rounded-lg flex items-center justify-center transition-all ${t.color} text-white shadow-sm ${colorTheme === t.id ? 'ring-2 ring-offset-2 ring-primary-500 scale-105' : 'opacity-70 hover:opacity-100'}`}
                                >
                                    {colorTheme === t.id && <Check size={14} strokeWidth={3} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-secondary-100 pt-3">
                        <p className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-2">Appearance</p>
                        <button
                            onClick={toggleMode}
                            className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-secondary-50 transition text-sm font-medium text-secondary-700"
                        >
                            {mode === 'dark' ? (
                                <>
                                    <div className="bg-secondary-800 text-yellow-400 p-1.5 rounded-lg"><Sun size={16} /></div>
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <div className="bg-secondary-100 text-secondary-600 p-1.5 rounded-lg"><Moon size={16} /></div>
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Backdrop to close */}
            {isOpen && (
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
