import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

// --- Types (basés sur votre API) ---
interface Kase {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    requiredTier: string;
    caseItems: any[];
}

interface CaseListPageProps {
    setPage: (page: string) => void;
}

// --- Composant Carte (pour une seule caisse) ---
const CaseCard: React.FC<{ kase: Kase; setPage: (page: string) => void }> = ({ kase, setPage }) => {
    let glowColorClass = 'shadow-cyan-500/20 hover:shadow-cyan-500/50 border-cyan-500/30';
    let btnGradientClass = 'from-cyan-600 to-blue-600';
    let imageGlowFilter = 'drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]';

    if (kase.name.toLowerCase().includes('red')) {
        glowColorClass = 'shadow-red-500/20 hover:shadow-red-500/50 border-red-500/30';
        btnGradientClass = 'from-red-600 to-orange-600';
        imageGlowFilter = 'drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]';
    } else if (kase.name.toLowerCase().includes('fade')) {
        glowColorClass = 'shadow-purple-500/20 hover:shadow-purple-500/50 border-purple-500/30';
        btnGradientClass = 'from-purple-600 to-pink-600';
        imageGlowFilter = 'drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]';
    } else if (kase.name.toLowerCase().includes('blue')) {
        glowColorClass = 'shadow-blue-500/20 hover:shadow-blue-500/50 border-blue-500/30';
        btnGradientClass = 'from-blue-600 to-sky-600';
        imageGlowFilter = 'drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]';
    }

    const API_ROOT_URL = import.meta.env.VITE_SITE_BASE_URL;
    const fullImageUrl = kase.imageUrl ? `${API_ROOT_URL}${kase.imageUrl}` : `https://placehold.co/200x200/333/FFF?text=${kase.name}`;

    return (
        <div
            className={`group relative bg-slate-800 rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:-translate-y-2 cursor-pointer shadow-lg ${glowColorClass}`}
            onClick={() => setPage(`case/${kase.id}`)}
        >
            <div className="relative h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-5 scale-150 group-hover:scale-100 transition-transform duration-500"></div>
                <div className={`absolute inset-0 bg-gradient-to-t ${btnGradientClass.replace('from-', 'from-').replace('to-', 'to-')} opacity-20 group-hover:opacity-30 transition-opacity`}></div>

                <img
                    src={fullImageUrl}
                    alt={kase.name}
                    className={`max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110 ${imageGlowFilter}`}
                />
            </div>

            <div className="p-5 text-center relative">
                <h3 className="text-xl font-black text-white uppercase tracking-wide mb-1 group-hover:text-cyan-300 transition-colors">{kase.name}</h3>
                <div className="text-xs text-slate-400 uppercase tracking-widest mb-4">Tier {kase.requiredTier}</div>

                <div className={`inline-block bg-gradient-to-r ${btnGradientClass} px-6 py-2 rounded-lg font-bold text-white shadow-lg transform transition-all group-hover:scale-105 group-hover:shadow-cyan-500/25`}>
                    {kase.price.toFixed(2)} €
                </div>
            </div>
        </div>
    );
};

// --- Composant Page (Liste des caisses) ---
export const CaseListPage: React.FC<CaseListPageProps> = ({ setPage }) => {
    const [cases, setCases] = useState<Kase[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { fetchApi } = useAuth();

    useEffect(() => {
        const loadCases = async () => {
            try {
                setLoading(true);
                const data = await fetchApi('/cases');
                if (data && data['member']) setCases(data['member']);
                else setCases([]);
            } catch(err: any) { setError(err.message); }
            finally { setLoading(false); }
        };
        loadCases();
    }, [fetchApi]);

    if (loading) return <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyan-500"></div></div>;
    if (error) return <p className="text-red-500 text-center p-4 bg-red-900/20 m-4 rounded-lg border border-red-500/30">Erreur: {error}</p>;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-black text-white mb-2 tracking-tight drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">CAISSES</span> DISPONIBLES
                </h1>
                <p className="text-slate-400 text-lg">Tentez votre chance et obtenez les skins les plus rares.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {cases.map((kase) => (
                    <CaseCard key={kase.id} kase={kase} setPage={setPage} />
                ))}
            </div>
        </div>
    );
};

export default CaseListPage;
