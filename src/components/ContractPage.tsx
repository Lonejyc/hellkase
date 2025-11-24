import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';

// --- Types ---
interface Item {
    id: number;
    name: string;
    rarity: string;
    imageUrl: string;
}

interface InventoryItem {
    id: number;
    float: number;
    statTrak: boolean;
    item: Item;
    calculatedPrice: number;
    wearTierName: string;
}

// Helper pour les couleurs de rareté (pour éviter les imports circulaires si non exporté ailleurs)
const getRarityClass = (rarity: string) => {
    const rarityMap: { [key: string]: string } = {
        'Consumer Grade': 'border-gray-400',
        'Industrial Grade': 'border-blue-300',
        'Mil-Spec': 'border-blue-600',
        'Restricted': 'border-purple-600',
        'Classified': 'border-pink-600',
        'Covert': 'border-red-600',
        'Extraordinary': 'border-yellow-500',
        'Contraband': 'border-yellow-700',
    };
    return rarityMap[rarity] || 'border-gray-500';
};

// --- Composant Carte sélectionnable ---
const SelectableItemCard: React.FC<{
    invItem: InventoryItem;
    selected: boolean;
    onClick: () => void;
}> = ({ invItem, selected, onClick }) => {
    const { item, statTrak, float, calculatedPrice, wearTierName } = invItem;

    return (
        <div
            onClick={onClick}
            className={`cursor-pointer relative rounded-lg overflow-hidden shadow-lg transition-all duration-200 transform ${
                selected 
                    ? 'ring-4 ring-indigo-500 scale-105 z-10' 
                    : 'opacity-80 hover:opacity-100 hover:scale-105'
            }`}
        >
            <div className={`border-4 ${getRarityClass(item.rarity)} p-2 bg-gray-800 h-full flex flex-col`}>
                {statTrak && <p className="text-orange-400 font-bold text-[10px] absolute top-2 right-2 bg-gray-900 px-1 rounded">ST™</p>}

                <div className="h-24 flex items-center justify-center mb-2">
                    <img src={item.imageUrl} alt={item.name} className="max-h-full max-w-full object-contain drop-shadow-md" />
                </div>

                <div className="text-center mt-auto">
                    <p className="text-white text-xs font-bold truncate px-1">{item.name}</p>
                    <p className="text-gray-400 text-[10px]">{wearTierName} - {float.toFixed(3)}</p>
                    <p className="text-yellow-400 font-bold text-sm mt-1">{calculatedPrice.toFixed(2)} €</p>
                </div>
            </div>

            {/* Badge de sélection */}
            {selected && (
                <div className="absolute top-2 left-2 bg-indigo-600 text-white rounded-full p-1 shadow-md">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
            )}
        </div>
    );
};

// --- Page Principale ---
export const ContractPage: React.FC = () => {
    const { user, fetchApi, fetchUser } = useAuth();
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [riskFactor, setRiskFactor] = useState<number>(1.2); // x1.2 par défaut
    const [loading, setLoading] = useState(false);
    const [resultItem, setResultItem] = useState<InventoryItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Charger l'inventaire au montage
    useEffect(() => {
        if (user) {
            setInventory(user.inventoryItems);
        }
    }, [user]);

    // Gestion du clic sur un item
    const handleItemClick = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(itemId => itemId !== id));
        } else {
            if (selectedIds.length < 10) {
                setSelectedIds([...selectedIds, id]);
            }
        }
    };

    // Calculs en temps réel
    const calculateContractStats = () => {
        const selectedItems = inventory.filter(i => selectedIds.includes(i.id));
        const totalValue = selectedItems.reduce((acc, i) => acc + i.calculatedPrice, 0);

        // Formule du backend : min = total / risk, max = total * risk
        const minOutput = totalValue > 0 ? totalValue / riskFactor : 0;
        const maxOutput = totalValue * riskFactor;

        return { totalValue, minOutput, maxOutput };
    };

    const stats = calculateContractStats();

    // Soumission du contrat
    const handleSubmit = async () => {
        if (selectedIds.length !== 10) return;

        setLoading(true);
        setError(null);

        try {
            // Appel API
            const newItem = await fetchApi('/inventory/contract', {
                method: 'POST',
                body: JSON.stringify({
                    inventoryItemIds: selectedIds,
                    riskFactor: riskFactor
                })
            });

            setResultItem(newItem);
            await fetchUser(); // Mettre à jour le solde et l'inventaire global
            setSelectedIds([]); // Reset de la sélection

        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors du contrat.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 text-white min-h-full flex flex-col">
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    Contrat d'Échange
                </h1>
                <p className="text-gray-400 mt-2">Échangez 10 items contre 1 de valeur supérieure (ou inférieure...)</p>
            </div>

            {/* Zone de Contrôle (Stats & Actions) */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-2xl mb-8 border border-gray-700 sticky top-4 z-20 backdrop-blur-md bg-opacity-90">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">

                    {/* Info Sélection */}
                    <div className="flex-1 text-center lg:text-left space-y-1">
                        <p className="text-gray-300">Sélection :
                            <span className={`ml-2 font-bold text-xl ${selectedIds.length === 10 ? 'text-green-400' : 'text-yellow-500'}`}>
                                {selectedIds.length} / 10
                            </span>
                        </p>
                        <p className="text-gray-300">Valeur mise en jeu :
                            <span className="ml-2 font-bold text-yellow-400 text-xl">{stats.totalValue.toFixed(2)} €</span>
                        </p>
                    </div>

                    {/* Sélecteur de Risque */}
                    <div className="flex flex-col items-center">
                        <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-2">Risque</span>
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                            {[1.2, 5, 10].map(factor => (
                                <button
                                    key={factor}
                                    onClick={() => setRiskFactor(factor)}
                                    className={`px-5 py-2 rounded-md font-bold transition-all duration-200 ${
                                        riskFactor === factor 
                                        ? 'bg-indigo-600 text-white shadow-lg transform scale-105' 
                                        : 'text-gray-500 hover:text-gray-200 hover:bg-gray-800'
                                    }`}
                                >
                                    x{factor}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Bouton & Estimation */}
                    <div className="flex-1 text-center lg:text-right flex flex-col items-center lg:items-end">
                        <p className="text-xs text-gray-500 mb-2">
                            Potentiel : <span className="text-indigo-400">{stats.minOutput.toFixed(2)}€</span> - <span className="text-purple-400">{stats.maxOutput.toFixed(2)}€</span>
                        </p>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedIds.length !== 10 || loading}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transform transition-all active:scale-95 w-full lg:w-auto"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signature...
                                </div>
                            ) : 'Signer le Contrat'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-center text-sm">
                        {error}
                    </div>
                )}
            </div>

            {/* Grille d'inventaire */}
            <div className="flex-grow">
                {inventory.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-500 text-xl">Votre inventaire est vide.</p>
                        <p className="text-gray-600 text-sm mt-2">Allez ouvrir des caisses pour obtenir des items à contracter !</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 pb-20">
                        {inventory.map(item => (
                            <SelectableItemCard
                                key={item.id}
                                invItem={item}
                                selected={selectedIds.includes(item.id)}
                                onClick={() => handleItemClick(item.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modale de Résultat */}
            {resultItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setResultItem(null)}>
                    <div
                        className="bg-gray-800 border border-gray-600 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="bg-gradient-to-b from-indigo-600 to-gray-800 p-6 pb-0 text-center">
                            <h2 className="text-2xl font-bold text-white">Contrat Signé !</h2>
                            <p className="text-indigo-200 text-sm opacity-80">Voici le résultat de votre échange</p>
                        </div>

                        <div className="p-8 flex flex-col items-center">
                            <div className="relative group mb-6 w-48 h-48 flex items-center justify-center">
                                <div className={`absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse`}></div>
                                <div className={`relative w-full h-full p-4 rounded-xl border-4 bg-gray-700 ${getRarityClass(resultItem.item.rarity)} flex items-center justify-center`}>
                                    {resultItem.statTrak && (
                                        <span className="absolute top-2 right-2 bg-gray-900 text-orange-500 font-bold text-xs border border-orange-500 px-1.5 rounded shadow-sm">
                                            StatTrak™
                                        </span>
                                    )}
                                    <img
                                        src={resultItem.item.imageUrl}
                                        alt={resultItem.item.name}
                                        className="max-w-full max-h-full object-contain drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-white text-center leading-tight mb-1">{resultItem.item.name}</h3>
                            <p className="text-gray-400 text-sm mb-4">{resultItem.wearTierName} <span className="text-gray-600">|</span> {resultItem.float.toFixed(6)}</p>

                            <div className="bg-gray-900/50 rounded-lg px-6 py-2 border border-gray-700 mb-6">
                                <p className="text-2xl font-bold text-yellow-400">{resultItem.calculatedPrice.toFixed(2)} €</p>
                            </div>

                            <button
                                onClick={() => setResultItem(null)}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-900/20"
                            >
                                Récupérer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContractPage;