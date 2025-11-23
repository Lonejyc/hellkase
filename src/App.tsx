import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthPage } from './components/AuthPage';
import CaseOpener from "./components/CaseOpener";
import { Navbar } from './components/Navbar';
import InventoryPage from './components/InventoryPage';
import CaseListPage from './components/CaseListPage';

function AppContent() {
    const { user, loading } = useAuth();
    const [page, setPage] = useState('home');
    const AuthComp: any = AuthPage;

    // URLs de base (seront modifiées par l'ID)
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!user && (page.startsWith('case/') || page === 'inventory')) {
            setPage('home');
        }
    }, [user, page]);


    const renderPage = () => {
        if (loading) {
            return (
                <div className="flex-grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
            );
        }

        // --- 2. Gérer le routage dynamique ---

        // Si la page commence par "case/", on affiche CaseOpener
        if (page.startsWith('case/')) {
            const caseId = page.split('/')[1];

            // On passe les URL dynamiques à CaseOpener
            return <CaseOpener
                getCaseUrl={`${baseUrl}/case/${caseId}`}
                openCaseUrl={`${baseUrl}/case/${caseId}/open`}
            />;
        }

        // Si l'utilisateur n'est pas connecté
        if (!user) {
             if (page === 'register') {
                 return <AuthComp key="register" view="register" setPage={setPage} />;
             }
             return <AuthComp key="login" view="login" setPage={setPage} />;
        }

        // Si l'utilisateur EST connecté, on gère les autres pages
        switch (page) {
            case 'home':
                // 'home' affiche maintenant la liste des caisses
                return <CaseListPage setPage={setPage} />;
            case 'inventory':
                return <InventoryPage />;
            default:
                // Sécurité : si la page est inconnue, retour à l'accueil
                setPage('home');
                return <CaseListPage setPage={setPage} />;
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
            <Navbar setPage={setPage} />
            <main className="flex-grow overflow-y-auto">
                {renderPage()}
            </main>
        </div>
    );
}

// Le composant App racine n'a pas changé
function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;