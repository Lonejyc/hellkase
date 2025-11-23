import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

// --- Types (basés sur votre API) ---
interface Kase {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    requiredTier: string;
    // La réponse d'une collection imbrique les caseItems
    caseItems: any[]; // On peut typer KaseItem si on veut
}

interface CaseListPageProps {
    setPage: (page: string) => void; // Pour la navigation
}

// --- Composant Carte (pour une seule caisse) ---
const CaseCard: React.FC<{ kase: Kase; setPage: (page: string) => void }> = ({ kase, setPage }) => {
    const imageUrl = kase.imageUrl || `https://placehold.co/200x200/333/FFF?text=${kase.name.replace(/ /g, '+')}`;

    return (
        <div
            className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform hover:scale-105 cursor-pointer"
            onClick={() => setPage(`case/${kase.id}`)}
        >
            <img src={imageUrl} alt={kase.name} className="w-full h-48 object-cover" />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-white truncate">{kase.name}</h3>
                <p className="text-yellow-400 font-bold text-xl mt-2">{kase.price.toFixed(2)} €</p>
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
                setError(null);

                // On appelle l'endpoint de collection
                const data = await fetchApi('/cases');

                // --- CORRECTION ---
                // data est un objet { 'hydra:member': [...] }, on extrait le tableau
                if (data && data['member']) {
                    setCases(data['member']);
                } else {
                    // Sécurité au cas où la réponse est vide ou inattendue
                    setCases([]);
                }
                // --- FIN CORRECTION ---

            } catch(err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        loadCases();
    }, [fetchApi]);

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return <p className="text-red-500 text-center p-4">Erreur: {error}</p>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-white mb-6">Choisissez une caisse</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {cases.map((kase) => (
                    <CaseCard key={kase.id} kase={kase} setPage={setPage} />
                ))}
            </div>
        </div>
    );
};

export default CaseListPage;
