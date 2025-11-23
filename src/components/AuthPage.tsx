import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';

export function AuthPage() {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pseudo, setPseudo] = useState('');
    const [error, setError] = useState<string | null>(null);
    const { login, register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            if (isLoginView) {
                await login(email, password);
            } else {
                await register(pseudo, email, password);
            }
            // Pas besoin de rediriger, le `App.tsx` le fera
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full text-white">
            <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center mb-6">
                    {isLoginView ? 'Connexion' : 'Inscription'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLoginView && (
                        <input
                            type="text"
                            placeholder="Pseudo"
                            value={pseudo}
                            onChange={(e) => setPseudo(e.target.value)}
                            required
                            className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-3 bg-indigo-600 rounded-md font-bold hover:bg-indigo-500 transition-colors"
                    >
                        {isLoginView ? 'Se connecter' : "S'inscrire"}
                    </button>
                </form>
                <p className="text-center mt-4 text-sm text-gray-400">
                    {isLoginView ? "Pas encore de compte ? " : "Déjà un compte ? "}
                    <button
                        onClick={() => setIsLoginView(!isLoginView)}
                        className="font-medium text-indigo-400 hover:text-indigo-300"
                    >
                        {isLoginView ? "Inscrivez-vous" : "Connectez-vous"}
                    </button>
                </p>
            </div>
        </div>
    );
}