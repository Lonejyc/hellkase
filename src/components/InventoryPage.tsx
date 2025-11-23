import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import ConfirmationModal from './ConfirmationModal'; // <-- 1. Importez le Modal

// --- Types (inchangés) ---
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

// ... (Gardez vos helpers : getRarityClass, RarityBorder, Spinner) ...

// --- Helper (copié de CaseOpener) ---
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
const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);
interface RarityBorderProps {
    rarity: string;
    children: React.ReactNode;
}
const RarityBorder: React.FC<RarityBorderProps> = ({ rarity, children }) => {
    const rarityClass = `rarity-border-${rarity.replace(/ /g, '-')}`;
    return (
        <div className={`border-4 ${getRarityClass(rarity)} p-2 rounded-lg bg-gray-700`}>
            {children}
        </div>
    );
};
// --- Fin des helpers ---


// --- Composant "Carte d'Item" (Modifié) ---
interface InventoryItemCardProps {
    invItem: InventoryItem;
    onSellClick: () => void; // <-- Modifié : n'exécute pas, demande l'ouverture du modal
    isSelling: boolean;
}

const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ invItem, onSellClick, isSelling }) => {
    const { item, statTrak, float, calculatedPrice, wearTierName } = invItem;

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col">
            <RarityBorder rarity={item.rarity}>
                <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-contain" />
            </RarityBorder>
            <div className="p-3 flex flex-col flex-grow">
                {statTrak && <p className="text-orange-400 font-bold text-sm">StatTrak™</p>}
                <p className="text-white text-sm font-semibold truncate">{item.name}</p>
                <p className="text-gray-300 text-xs">{wearTierName}</p>
                <p className="text-gray-400 text-xs truncate" title={`Float: ${float}`}>{float.toFixed(6)}</p>
                <div className="flex-grow"></div>
                <p className="text-yellow-400 font-bold text-lg mt-2">{calculatedPrice.toFixed(2)} €</p>
                <button
                    onClick={onSellClick} // <-- Modifié
                    disabled={isSelling}
                    className="w-full mt-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-1 px-2 rounded disabled:bg-gray-600"
                >
                    Vendre
                </button>
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
        <> {/* 4. On utilise un Fragment pour inclure le Modal */}
            <div className="container mx-auto px-4 py-8 text-white">
                <div className="bg-gray-800 p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Mon Inventaire</h1>
                        <p className="text-lg text-gray-300">
                            {inventoryItems.length} item{inventoryItems.length > 1 ? 's' : ''} -
                            <span className="text-yellow-400 font-bold ml-2">Valeur: {totalValue.toFixed(2)} €</span>
                        </p>
                    </div>
                    <button
                        onClick={handleSellAllClick} // <-- Modifié
                        disabled={isSelling || inventoryItems.length === 0}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded disabled:bg-gray-600"
                    >
                        {isSelling ? <Spinner /> : 'Tout Vendre'}
                    </button>
                </div>

                {message && <p className="text-green-400 text-center mb-4">{message}</p>}
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                {inventoryItems.length === 0 ? (
                    <p className="text-gray-400 text-center p-8">Votre inventaire est vide. Ouvrez des caisses !</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {inventoryItems.map((invItem) => (
                            <InventoryItemCard
                                key={invItem.id}
                                invItem={invItem}
                                onSellClick={() => handleSellItemClick(invItem)} // <-- Modifié
                                isSelling={isSelling}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* 5. On affiche le Modal (il est invisible si modalInfo est null) */}
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