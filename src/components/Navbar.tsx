import React from 'react';
import { useAuth } from '../auth/AuthContext';

// J'ajoute 'setPage' pour la navigation (si vous l'avez dans App.tsx)
interface NavbarProps {
    setPage: (page: string) => void;
}

export function Navbar({ setPage }: NavbarProps) {
    const { user, loading, logout } = useAuth();

    return (
        <nav className="bg-gray-800 shadow-lg w-full">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Nom du site (à gauche) */}
                    <div className="flex-shrink-0 flex items-center">
                        <span
                            className="text-2xl font-bold text-white cursor-pointer"
                            onClick={() => setPage('home')} // 'home' sera votre page de caisses
                        >
                            Hellkase
                        </span>
                    </div>

                    {/* Section Utilisateur (à droite) */}
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : user ? (
                            <>
                                <span className="text-yellow-400 font-semibold text-lg">
                                    {user.balance?.toFixed(2) || '0.00'} €
                                </span>
                                <span className="text-gray-400">|</span>

                                <span
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                                    onClick={() => setPage('inventory')} // Page inventaire
                                >
                                    Inventaire
                                </span>
                                <span className="text-white font-medium">{user.pseudo}</span>
                                <button
                                    onClick={logout}
                                    className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Déconnexion
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setPage('login')}
                                    className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Connexion
                                </button>
                                <button
                                    onClick={() => setPage('register')}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Inscription
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}