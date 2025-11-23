import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean; // Pour afficher un spinner
}

const Spinner = () => (
    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
);

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    onCancel,
    onConfirm,
    confirmText = "Confirmer",
    cancelText = "Annuler",
    isLoading = false
}) => {
    if (!isOpen) {
        return null;
    }

    return (
        // Fond en overlay
        <div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
            onClick={onCancel} // Ferme si on clique à l'extérieur
        >
            {/* Contenu du Modal */}
            <div
                className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md"
                onClick={e => e.stopPropagation()} // Empêche la fermeture si on clique dessus
            >
                <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>

                {/* Boutons */}
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-500 transition-colors disabled:bg-gray-600 w-28 flex justify-center"
                    >
                        {isLoading ? <Spinner /> : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;