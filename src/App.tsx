import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AuthPage } from './components/AuthPage';
import CaseOpener from "./components/CaseOpener";
import { Navbar } from './components/Navbar';
import InventoryPage from './components/InventoryPage';
import CaseListPage from './components/CaseListPage';
import ContractPage from './components/ContractPage';
import SubscriptionPage from './components/SubscriptionPage';

function AppContent() {
    const { user, loading } = useAuth();
    const [page, setPage] = useState('home');
    const AuthComp: any = AuthPage;

    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    useEffect(() => {
        if (!user && (page.startsWith('case/') || page === 'inventory' || page === 'contract' || page === 'subscriptions')) {
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

        if (page.startsWith('case/')) {
            const caseId = page.split('/')[1];

            return <CaseOpener
                getCaseUrl={`${baseUrl}/case/${caseId}`}
                openCaseUrl={`${baseUrl}/case/${caseId}/open`}
            />;
        }

        if (!user) {
             if (page === 'register') {
                 return <AuthComp key="register" view="register" setPage={setPage} />;
             }
             return <AuthComp key="login" view="login" setPage={setPage} />;
        }

        switch (page) {
            case 'home':
                return <CaseListPage setPage={setPage} />;
            case 'inventory':
                return <InventoryPage />;
            case 'contract':
                return <ContractPage />;
            case 'subscriptions':
                return <SubscriptionPage />;
            default:
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

function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;