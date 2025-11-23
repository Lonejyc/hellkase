import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// L'URL de base de votre API Symfony
const API_BASE_URL = "https://symfo-gobelins.test/api";
// L'URL de login (qui est spéciale car hors /api)
const LOGIN_CHECK_URL = "https://symfo-gobelins.test/api/login";

// Définition des types pour l'utilisateur et le contexte
interface User {
    id: number;
    email: string;
    pseudo: string;
    balance: number;
    tier: string;
    roles: string[];
    inventoryItems: any[]; // Vous pouvez typer InventoryItem si vous le souhaitez
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (pseudo: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    fetchApi: (url: string, options?: RequestInit) => Promise<any>; // Le helper magique
    fetchUser: () => Promise<void>; // Pour rafraîchir le solde
}

// Création du Contexte
const AuthContext = createContext<AuthContextType | null>(null);

// Le "Provider" qui enrobe votre application
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(() => localStorage.getItem('jwtToken'));
    const [loading, setLoading] = useState(true);

    /**
     * Le helper 'fetchApi' qui ajoute automatiquement le token JWT à chaque requête.
     * C'est ce que vous utiliserez pour ouvrir les caisses, vendre des items, etc.
     */
    const fetchApi = useCallback(async (url: string, options: RequestInit = {}) => {
        const headers: HeadersInit = {
            'Content-Type': 'application/ld+json',
            'Accept': 'application/ld+json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Note: l'URL ici commence par / (ex: /case/1/open)
        const response = await fetch(`${API_BASE_URL}${url}`, {
            ...options,
            headers,
        });

        if (response.status === 401) { // Non autorisé
            logout(); // Le token est invalide ou expiré, on déconnecte
            throw new Error('Non autorisé. Veuillez vous reconnecter.');
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || errorData.title || 'Erreur API');
        }

        if (response.status === 204) { // No Content (ex: DELETE)
            return null;
        }

        return response.json();
    }, [token]);

    /**
     * Récupère les informations de l'utilisateur (via /user/1)
     */
    const fetchUser = useCallback(async () => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            // NOTE : J'utilise '/user/me' comme défini dans votre User.php
            const userData = await fetchApi('/user/1');
            setUser(userData);
        } catch (error) {
            console.error("Erreur fetchUser:", error);
            logout(); // Token invalide
        } finally {
            setLoading(false);
        }
    }, [token, fetchApi]); // 'fetchApi' est une dépendance

    // Au chargement, on essaie de récupérer l'utilisateur si un token existe
    useEffect(() => {
        fetchUser();
    }, [fetchUser]); // 'fetchUser' est la seule dépendance

    /**
     * Connexion (POST /api/login_check)
     */
    const login = async (email: string, password: string) => {
        // Le login n'utilise PAS fetchApi car il n'a pas encore de token
        const response = await fetch(LOGIN_CHECK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Email ou mot de passe incorrect');
        }

        const data = await response.json();
        setToken(data.token);
        localStorage.setItem('jwtToken', data.token);
        // On recharge l'utilisateur une fois le token sauvegardé
        // Note: L'état du token n'est pas encore mis à jour,
        // donc on appelle fetchUser (qui lit le nouvel état du token)
    };

    // On met à jour l'utilisateur dès que le token change (après le login)
    useEffect(() => {
        if (token) {
            fetchUser();
        }
    }, [token]); // Déclenché quand setToken est appelé

    /**
     * Inscription (POST /user)
     */
    const register = async (pseudo: string, email: string, password: string) => {
        // L'inscription est publique, pas besoin de fetchApi
        const response = await fetch(`${API_BASE_URL}/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ pseudo, email, password }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail || "Erreur lors de l'inscription");
        }

        // Après l'inscription, on connecte l'utilisateur
        await login(email, password);
    };

    /**
     * Déconnexion
     */
    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('jwtToken');
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        logout,
        fetchApi,
        fetchUser // On expose fetchUser pour rafraîchir le solde
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// Le Hook pour consommer le contexte
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
    }
    return context;
}