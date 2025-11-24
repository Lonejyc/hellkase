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
            if (isLoginView) await login(email, password);
            else await register(pseudo, email, password);
        } catch (err: any) { setError(err.message); }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] text-white relative overflow-hidden">
            {/* Background accent glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] -z-10"></div>

            <div className="w-full max-w-md p-8 bg-slate-900/80 border border-white/10 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl relative">
                {/* Neon line on top */}
                <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_10px_#06b6d4]"></div>

                <h2 className="text-4xl font-black text-center mb-8 tracking-tight text-white">
                    {isLoginView ? 'CONNEXION' : 'INSCRIPTION'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {!isLoginView && (
                        <div className="group">
                            <input
                                type="text"
                                placeholder="Pseudo"
                                value={pseudo}
                                onChange={(e) => setPseudo(e.target.value)}
                                required
                                className="w-full px-5 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-200 placeholder-slate-500"
                            />
                        </div>
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-5 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-200 placeholder-slate-500"
                    />
                    <input
                        type="password"
                        placeholder="Mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-5 py-3 bg-slate-950/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-slate-200 placeholder-slate-500"
                    />

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg font-bold text-lg uppercase tracking-wide hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transform active:scale-95"
                    >
                        {isLoginView ? 'Entrer dans la matrice' : "Rejoindre l'élite"}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-sm text-slate-400">
                        {isLoginView ? "Nouveau ici ? " : "Déjà un compte ? "}
                        <button
                            onClick={() => setIsLoginView(!isLoginView)}
                            className="font-bold text-cyan-400 hover:text-cyan-300 underline decoration-2 decoration-transparent hover:decoration-cyan-400 transition-all"
                        >
                            {isLoginView ? "Créer un compte" : "Se connecter"}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}