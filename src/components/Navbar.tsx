import { useAuth } from '../auth/AuthContext';

interface NavbarProps {
    setPage: (page: string) => void;
}

export function Navbar({ setPage }: NavbarProps) {
    const { user, loading, logout } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-md border-b border-white/10 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center group cursor-pointer" onClick={() => setPage('home')}>
                        <span className="text-3xl mr-2">🎰</span>
                        <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 group-hover:from-cyan-300 group-hover:to-purple-400 transition-all">
                            HELLKASE
                        </span>
                    </div>

                    {/* Section Utilisateur */}
                    <div className="flex items-center space-x-6">
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-cyan-500"></div>
                        ) : user ? (
                            <>
                                <div className="bg-slate-800/50 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-3">
                                    <span className="text-cyan-400 font-bold font-mono text-lg drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]">
                                        {user.balance?.toFixed(2)} €
                                    </span>
                                </div>

                                <div className="flex space-x-1">
                                    <button
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/5"
                                        onClick={() => setPage('inventory')}
                                    >
                                        INVENTAIRE
                                    </button>
                                    <button
                                        className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-white/5"
                                        onClick={() => setPage('contract')}
                                    >
                                        CONTRAT
                                    </button>
                                </div>

                                <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                                    <span className="text-white font-bold tracking-wide">{user.pseudo}</span>
                                    <button
                                        onClick={logout}
                                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-all hover:shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                                    >
                                        Déco
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex space-x-4">
                                <button
                                    onClick={() => setPage('login')}
                                    className="text-gray-300 hover:text-white font-medium transition-colors"
                                >
                                    Connexion
                                </button>
                                <button
                                    onClick={() => setPage('register')}
                                    className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-5 py-2 rounded font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transform hover:-translate-y-0.5 transition-all"
                                >
                                    GO !
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}