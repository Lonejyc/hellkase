import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import ConfirmationModal from './ConfirmationModal';
import { getRarityStyle } from '../utils/rarity';

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

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

const InventoryItemCard: React.FC<{ invItem: InventoryItem; onSellClick: () => void; isSelling: boolean; }> = ({ invItem, onSellClick, isSelling }) => {
    const { item, statTrak, float, calculatedPrice, wearTierName } = invItem;
    const style = getRarityStyle(item.rarity);

    return (
        <div className={`group relative bg-slate-800/40 backdrop-blur-sm rounded-xl overflow-hidden border border-white/5 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_0_20px_-5px_rgba(0,0,0,0.5)] hover:border-white/20`}>

            {/* Fond brillant basé sur la rareté */}
            <div className={`absolute inset-0 bg-gradient-to-b ${style.bg} opacity-20 group-hover:opacity-40 transition-opacity`}></div>

            {/* Barre de couleur de rareté en bas */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-${style.border.replace('border-', '')} to-transparent opacity-70 group-hover:h-1.5 transition-all shadow-[0_0_10px_currentColor] ${style.text}`}></div>

            <div className="p-4 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                    {statTrak && <span className="text-[10px] font-black text-orange-500 tracking-widest uppercase border border-orange-500/30 px-1.5 py-0.5 rounded bg-orange-500/10">StatTrak™</span>}
                    <span className="text-[10px] text-slate-500 font-mono ml-auto">{float.toFixed(4)}</span>
                </div>

                <div className="flex-grow flex items-center justify-center py-4">
                    <img src={item.imageUrl} alt={item.name} className="max-h-28 max-w-full object-contain drop-shadow-lg filter group-hover:brightness-110 transition-all" />
                </div>

                <div className="mt-auto">
                    <p className={`text-xs font-bold truncate ${style.text}`}>{item.rarity}</p>
                    <h3 className="text-sm font-medium text-white truncate mb-1">{item.name}</h3>
                    <p className="text-xs text-slate-400 mb-3">{wearTierName}</p>

                    <div className="flex items-center justify-between gap-2">
                        <span className="text-yellow-400 font-bold font-mono">{calculatedPrice.toFixed(2)} €</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); onSellClick(); }}
                            disabled={isSelling}
                            className="bg-slate-700 hover:bg-green-600/80 text-white text-xs font-bold py-1.5 px-3 rounded transition-colors disabled:opacity-50"
                        >
                            Vendre
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Composant "Page d'Inventaire" (Modifié) ---
export const InventoryPage: React.FC = () => {
    const { user, fetchApi, fetchUser } = useAuth();
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSelling, setIsSelling] = useState(false);

    // --- 2. Nouvel état pour le Modal ---
    const [modalInfo, setModalInfo] = useState<{
        title: string;
        message: string;
        onConfirm: () => Promise<void>; // L'action à exécuter
    } | null>(null);

    if (!user) {
        return <p className="text-white text-center p-8">Veuillez vous connecter pour voir votre inventaire.</p>;
    }

    const { inventoryItems } = user;
    const totalValue = inventoryItems.reduce((acc, item) => acc + item.calculatedPrice, 0);

    // --- 3. Logique de vente éclatée ---

    // Fonction pour "demander" la vente d'UN item
    const handleSellItemClick = (item: InventoryItem) => {
        if (isSelling) return;
        setModalInfo({
            title: "Confirmer la vente",
            message: `Voulez-vous vraiment vendre ${item.item.name} pour ${item.calculatedPrice.toFixed(2)} € ?`,
            // Le onConfirm contient la logique de vente
            onConfirm: () => executeSellItem(item.id, item.calculatedPrice)
        });
    };

    // Fonction qui exécute VRAIMENT la vente
    const executeSellItem = async (itemId: number, price: number) => {
        setIsSelling(true);
        setMessage(null);
        setError(null);

        try {
            await fetchApi(`/inventory_item/${itemId}/sell`, { method: 'POST', body: '{}' });
            setMessage(`Item vendu pour ${price.toFixed(2)} € !`);
            await fetchUser();
        } catch(err: any) {
            setError(`Erreur: ${err.message}`);
        } finally {
            setIsSelling(false);
            setModalInfo(null); // Ferme le modal
        }
    };

    // Fonction pour "demander" de TOUT vendre
    const handleSellAllClick = () => {
        if (isSelling || inventoryItems.length === 0) return;
        setModalInfo({
            title: "Tout Vendre ?",
            message: `Voulez-vous vraiment vendre TOUS vos ${inventoryItems.length} items pour ${totalValue.toFixed(2)} € ?`,
            onConfirm: executeSellAllItems
        });
    };

    // Fonction qui exécute VRAIMENT la vente de TOUT
    const executeSellAllItems = async () => {
        setIsSelling(true);
        setMessage(null);
        setError(null);

        try {
            await fetchApi(`/inventory_item/sell`, { method: 'POST', body: '{}' });
            setMessage(`Tout l'inventaire a été vendu pour ${totalValue.toFixed(2)} € !`);
            await fetchUser();
        } catch(err: any) {
            setError(`Erreur: ${err.message}`);
        } finally {
            setIsSelling(false);
            setModalInfo(null); // Ferme le modal
        }
    };

    return (
        <>
            <div className="container mx-auto px-4 py-8">
                {/* Header Stats */}
                <div className="bg-slate-900/50 border border-white/10 p-6 rounded-2xl backdrop-blur-xl mb-8 flex flex-col md:flex-row justify-between items-center gap-4 shadow-lg">
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter">Mon Inventaire</h1>
                        <p className="text-slate-400 mt-1">
                            <span className="text-white font-bold">{inventoryItems.length}</span> skins <span className="mx-2">|</span>
                            Valeur totale : <span className="text-cyan-400 font-bold font-mono text-xl drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">{totalValue.toFixed(2)} €</span>
                        </p>
                    </div>
                    <button
                        onClick={handleSellAllClick}
                        disabled={isSelling || inventoryItems.length === 0}
                        className="bg-red-500/10 border border-red-500/50 hover:bg-red-500 text-red-500 hover:text-white font-bold py-3 px-6 rounded-xl transition-all shadow-[0_0_15px_-5px_rgba(239,68,68,0.3)] hover:shadow-[0_0_20px_rgba(239,68,68,0.6)] disabled:opacity-50 disabled:shadow-none"
                    >
                        {isSelling ? <Spinner /> : 'TOUT VENDRE'}
                    </button>
                </div>

                {/* Grid */}
                {message && <div className="p-4 mb-6 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-center animate-pulse">{message}</div>}
                {error && <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-center">{error}</div>}

                {inventoryItems.length === 0 ? (
                    <div className="text-center py-20 opacity-50">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-xl font-light">Votre inventaire est vide.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {inventoryItems.map((invItem) => (
                            <InventoryItemCard
                                key={invItem.id}
                                invItem={invItem}
                                onSellClick={() => handleSellItemClick(invItem)}
                                isSelling={isSelling}
                            />
                        ))}
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!modalInfo}
                title={modalInfo?.title || ""}
                message={modalInfo?.message || ""}
                onCancel={() => setModalInfo(null)}
                onConfirm={modalInfo?.onConfirm || (() => {})}
                isLoading={isSelling}
            />
        </>
    );
};

export default InventoryPage;