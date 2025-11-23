import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext'; // On garde le Contexte d'authentification

// --- Définition des Types (inchangés) ---
interface Item {
    id: number;
    name: string;
    rarity: string;
    imageUrl: string;
}

interface KaseItem {
    id: number;
    dropRate: number;
    item: Item;
}

interface Kase {
    id: number;
    name: string;
    price: number;
    caseItems: KaseItem[];
}

interface InventoryItem {
    id: number;
    float: number;
    statTrak: boolean;
    item: Item;
    calculatedPrice: number;
    wearTierName: string;
}

interface CaseOpenerProps {
    getCaseUrl: string;
    openCaseUrl: string;
}

// --- Helpers (inchangés) ---
const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

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

// --- Constantes pour l'animation ---
const SLIDE_WIDTH = 150; // Largeur fixe d'un item (en px)
const SLIDE_GAP = 8; // L'espace entre les items (gap-2 de Tailwind, soit 0.5rem = 8px)
const SLIDE_TOTAL_WIDTH = SLIDE_WIDTH + SLIDE_GAP; // Largeur totale d'un "pas"
const ANIMATION_DURATION_MS = 6000; // 6 secondes
const REEL_LENGTH = 100; // La nouvelle taille fixe de notre bande
const TARGET_INDEX = 90; // L'index où on s'arrête TOUJOURS
const MODAL_DELAY_MS = 1000; // Temps d'attente avant d'afficher le modal (1s)

// --- Composant Principal ---

const CaseOpener = ({ getCaseUrl, openCaseUrl }: CaseOpenerProps) => {
    const [caseData, setCaseData] = useState<Kase | null>(null);
    const [reelItems, setReelItems] = useState<Item[]>([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [wonItem, setWonItem] = useState<InventoryItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [translateX, setTranslateX] = useState(0);
    const [transitionDuration, setTransitionDuration] = useState('0s');
    const reelContainerRef = useRef<HTMLDivElement>(null);

    const { fetchApi, fetchUser } = useAuth();

    // 1. Charger les données de la caisse (inchangé)
    useEffect(() => {
        const fetchCaseData = async () => {
            try {
                const relativeGetUrl = getCaseUrl.replace("https://symfo-gobelins.test/api", "");
                const data: Kase = await fetchApi(relativeGetUrl);
                setCaseData(data);
                // On génère une première bande juste pour l'affichage initial
                if (data.caseItems.length > 0) {
                    const itemsFromCase = data.caseItems.map(ci => ci.item);
                    let tempReel: Item[] = [];
                    for (let i = 0; i < REEL_LENGTH; i++) {
                         tempReel.push(itemsFromCase[Math.floor(Math.random() * itemsFromCase.length)]);
                    }
                    setReelItems(tempReel);
                }
            } catch (err: any) {
                setError(err.message);
            }
        };
        fetchCaseData();
    }, [getCaseUrl, fetchApi]);

    // 2. Logique d'ouverture de caisse (entièrement revue)
    const handleOpenCase = async () => {
        if (isSpinning || !caseData || caseData.caseItems.length === 0) return;

        setIsSpinning(true);
        setWonItem(null);
        setError(null);

        // a. "Rembobiner" instantanément (au cas où)
        setTransitionDuration('0s');
        setTranslateX(0);

        try {
            // b. Générer une NOUVELLE bande aléatoire de 100 items
            const itemsFromCase = caseData.caseItems.map(ci => ci.item);
            let tempReel: Item[] = [];
            for (let i = 0; i < REEL_LENGTH; i++) {
                const randomIndex = Math.floor(Math.random() * itemsFromCase.length);
                tempReel.push(itemsFromCase[randomIndex]);
            }

            // c. Appeler l'API pour savoir ce qu'on a VRAIMENT gagné
            const relativeOpenUrl = openCaseUrl.replace("https://symfo-gobelins.test/api", "");
            const wonInventoryItem: InventoryItem = await fetchApi(relativeOpenUrl, {
                method: 'POST',
                body: JSON.stringify({}) // Corps vide
            });
            const wonItemTemplate = wonInventoryItem.item;

            // d. "Planter" l'item gagné à la position 90
            tempReel[TARGET_INDEX] = wonItemTemplate;

            // e. Mettre à jour l'état de la bande (React re-rend le composant)
            setReelItems(tempReel);

            // f. Calculer la position (AVEC LE X-FACTOR)
            const containerWidth = reelContainerRef.current?.clientWidth || 0;
            const randomOffset = (Math.random() - 0.5) * (SLIDE_WIDTH * 0.8);

            const targetTranslate =
                -(TARGET_INDEX * SLIDE_TOTAL_WIDTH)
                + (containerWidth / 2)
                - (SLIDE_WIDTH / 2)
                + randomOffset;

            // g. Lancer l'animation
            setTimeout(() => {
                setTransitionDuration(`${ANIMATION_DURATION_MS}ms`);
                setTranslateX(targetTranslate);
            }, 50);

            // h. Gérer la fin de l'animation (Arrêt)
            setTimeout(() => {
                setIsSpinning(false);
                fetchUser(); // Met à jour le solde
            }, ANIMATION_DURATION_MS + 200);

            // --- DEBUT DE LA MODIFICATION (Modal décalé) ---
            // i. Afficher le modal APRES un délai
            setTimeout(() => {
                setWonItem(wonInventoryItem);
            }, ANIMATION_DURATION_MS + MODAL_DELAY_MS + 200); // 1s après l'arrêt
            // --- FIN DE LA MODIFICATION ---

        } catch (err: any) {
            setError(err.message);
            setIsSpinning(false);
        }
    };

    // Rendu du composant
    if (error) return <div className="text-red-500">{error}</div>;
    if (!caseData) return <div>Chargement de la caisse...</div>;

    return (
        // --- DEBUT MODIFICATION (Toute la largeur) ---
        <div className="w-full p-4 flex flex-col items-center">
        {/* --- FIN MODIFICATION --- */}
            <h2 className="text-3xl font-bold text-center mb-4">{caseData.name}</h2>

            {/* Le Carrousel (Contrôlé par CSS) */}
            <div
                ref={reelContainerRef}
                // --- DEBUT MODIFICATION (Toute la largeur) ---
                className="relative w-full overflow-hidden h-[150px]" // `max-w-6xl` retiré
                // --- FIN MODIFICATION ---
            >
                {/* Le marqueur central */}
                <div
                    className="absolute top-0 w-1 h-full bg-yellow-400 z-10"
                    style={{ left: 'calc(50% - 2px)' }}
                ></div>

                {/* La bande d'items (le "reel") */}
                <div
                    className="flex gap-2 absolute top-0 left-0"
                    style={{
                        transform: `translateX(${translateX}px)`,
                        transition: `transform ${transitionDuration} cubic-bezier(0.1, 0.6, 0.1, 1)`
                    }}
                >
                    {reelItems.map((item, index) => (
                        <div
                            key={index}
                            style={{ width: `${SLIDE_WIDTH}px` }}
                            className="flex-shrink-0"
                        >
                            <div className={`p-2 rounded-lg bg-gray-800 border-4 ${getRarityClass(item.rarity)} h-full flex flex-col justify-between`}>
                                <img
                                    src={item.imageUrl}
                                    alt={item.name}
                                    className="w-full h-24 object-contain"
                                />
                                <p className="text-white text-xs font-semibold truncate mt-2">{item.name}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Le bouton (inchangé) */}
            <div className="text-center mt-6">
                <button
                    onClick={handleOpenCase}
                    disabled={isSpinning}
                    className="bg-green-600 text-white font-bold py-3 px-10 rounded-lg text-xl hover:bg-green-500 disabled:bg-gray-600 transition-colors"
                >
                    {isSpinning ? 'Ouverture...' : `Ouvrir (${caseData.price.toFixed(2)} €)`}
                </button>
            </div>

            {/* Le Modal de Victoire (inchangé) */}
            {wonItem && (
                <div className="fixed inset-0 bg-black bg-opacity-70 z-20 flex items-center justify-center" onClick={() => setWonItem(null)}>
                    <div className="bg-gray-800 p-6 rounded-lg text-center shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-2xl font-bold text-white mb-4">Vous avez gagné !</h3>
                        <div style={{ width: '200px' }}>
                            <div className={`p-2 rounded-lg bg-gray-700 border-4 ${getRarityClass(wonItem.item.rarity)}`}>
                                {wonItem.statTrak && <p className="text-orange-400 font-bold">StatTrak™</p>}
                                <img src={wonItem.item.imageUrl} alt={wonItem.item.name} className="w-full h-32 object-contain" />
                                <p className="text-white font-semibold mt-2">{wonItem.item.name}</p>
                                <p className="text-gray-300 text-sm">{wonItem.wearTierName}</p>
                                <p className="text-yellow-400 font-bold text-lg">{wonItem.calculatedPrice.toFixed(2)} €</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setWonItem(null)}
                            className="mt-6 bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default CaseOpener;