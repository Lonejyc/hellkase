import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import ConfirmationModal from './ConfirmationModal';

interface Subscription {
    id: string;
    name: string;
    price: number;
    tier: 'basic' | 'gold' | 'diamond';
    durationMonths: number;
}

export const SubscriptionPage: React.FC = () => {
    const { user, fetchApi, loading: userLoading } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Subscription | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const loadSubscriptions = async () => {
            try {
                setLoading(true);
                const data = await fetchApi('/subscriptions');
                if (data && data['member']) {
                    setSubscriptions(data['member']);
                }
            } catch (err: any) {
                setError("Erreur de chargement des abonnements.");
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            loadSubscriptions();
        }
    }, [user, fetchApi]);

    const handlePurchaseConfirm = async () => {
        if (!selectedPlan || !user) return;

        if (user.balance < selectedPlan.price) {
            setError("Solde insuffisant ! Déposez plus d'argent.");
            setSelectedPlan(null);
            return;
        }

        setPurchaseLoading(true);
        setError(null);

        try {
            const subscriptionId = typeof selectedPlan.id === 'string' ?
                                    parseInt(selectedPlan.id.split('/').pop() || '', 10) :
                                    selectedPlan.id;

            const result = await fetchApi(`/subscriptions/${subscriptionId}/purchase`, {
                method: 'POST',
                body: JSON.stringify({}) // Corps vide
            });

            // fetchUser();

            setSuccessMessage(`Abonnement ${selectedPlan.name} acheté avec succès !`);
            setSelectedPlan(null);

        } catch (err: any) {
            setError(err.message || "Erreur lors de l'achat de l'abonnement.");
        } finally {
            setPurchaseLoading(false);
            (useAuth().fetchUser)();
        }
    };

    if (loading || userLoading) return <div className="flex-grow flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div></div>;

    const currentSub = user?.getActiveSubscription;

    return (
        <div className="container mx-auto px-4 py-8 text-white">
            <h1 className="text-4xl font-bold text-center mb-10 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                Abonnements Hellkase
            </h1>

            {error && <p className="p-4 mb-4 bg-red-900/50 text-red-300 rounded-lg">{error}</p>}
            {successMessage && <p className="p-4 mb-4 bg-green-900/50 text-green-300 rounded-lg">{successMessage}</p>}

            {/* Statut Actuel */}
            {currentSub ? (
                 <div className="bg-slate-900/80 p-6 rounded-xl border border-purple-500/50 mb-8 text-center shadow-lg">
                    <p className="text-xl font-bold text-white mb-2">Abonnement Actif</p>
                    <p className="text-purple-400 text-lg">{currentSub.subscription.name}</p>
                    <p className="text-sm text-slate-400 mt-2">Expire le : {currentSub.endDate.toLocaleDateString()}</p>
                </div>
            ) : (
                <p className="text-center text-slate-400 mb-8">Vous êtes actuellement sur le tier BASIC.</p>
            )}


            {/* Liste des Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {subscriptions.map((plan) => (
                    <div
                        key={plan.id}
                        className={`bg-slate-800/60 p-8 rounded-xl shadow-2xl border-4 ${
                            plan.tier === 'diamond' ? 'border-pink-600/50' : plan.tier === 'gold' ? 'border-yellow-500/50' : 'border-slate-500/50'
                        } hover:scale-[1.02] transition-transform duration-300`}
                    >
                        <h2 className={`text-3xl font-black mb-3 uppercase ${plan.tier === 'diamond' ? 'text-pink-400' : 'text-yellow-300'}`}>
                            {plan.name}
                        </h2>
                        <p className="text-4xl font-extrabold text-white mb-4">{plan.price.toFixed(2)} € <span className="text-slate-400 text-base font-normal">/ mois</span></p>

                        <ul className="text-slate-300 space-y-2 mb-8">
                            <li><span className="text-green-400 mr-2">✓</span> Accès au Tier {plan.tier.toUpperCase()}</li>
                            <li><span className="text-green-400 mr-2">✓</span> {plan.durationMonths} mois d'accès</li>
                            <li><span className="text-green-400 mr-2">✓</span> Avantages exclusifs (TBD)</li>
                        </ul>

                        <button
                            onClick={() => setSelectedPlan(plan)}
                            disabled={user ? user.balance < plan.price : true}
                            className={`w-full py-3 rounded-lg font-bold text-lg uppercase transition-all ${
                                user?.balance >= plan.price 
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 shadow-lg shadow-purple-500/40' 
                                : 'bg-gray-600 opacity-60 cursor-not-allowed'
                            }`}
                        >
                            {user?.balance >= plan.price ? "S'abonner" : "Solde Insuffisant"}
                        </button>
                    </div>
                ))}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!selectedPlan}
                title={`Confirmer l'achat de ${selectedPlan?.name}`}
                message={`Ceci déduira ${selectedPlan?.price.toFixed(2)} € de votre solde pour un abonnement de ${selectedPlan?.durationMonths} mois.`}
                onCancel={() => setSelectedPlan(null)}
                onConfirm={handlePurchaseConfirm}
                confirmText="Acheter"
                isLoading={purchaseLoading}
            />
        </div>
    );
};

export default SubscriptionPage;