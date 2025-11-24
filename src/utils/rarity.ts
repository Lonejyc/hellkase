// src/utils/rarity.ts

export const getRarityStyle = (rarity: string) => {
    const styles: { [key: string]: { border: string, shadow: string, text: string, bg: string } } = {
        'Consumer Grade': {
            border: 'border-slate-400',
            shadow: 'shadow-slate-400/20',
            text: 'text-slate-300',
            bg: 'from-slate-500/10 to-transparent'
        },
        'Industrial Grade': {
            border: 'border-sky-400',
            shadow: 'shadow-sky-400/40',
            text: 'text-sky-300',
            bg: 'from-sky-500/10 to-transparent'
        },
        'Mil-Spec': {
            border: 'border-blue-600',
            shadow: 'shadow-blue-600/40',
            text: 'text-blue-400',
            bg: 'from-blue-600/10 to-transparent'
        },
        'Restricted': {
            border: 'border-purple-500',
            shadow: 'shadow-purple-500/40',
            text: 'text-purple-400',
            bg: 'from-purple-500/10 to-transparent'
        },
        'Classified': {
            border: 'border-pink-500',
            shadow: 'shadow-pink-500/40',
            text: 'text-pink-400',
            bg: 'from-pink-500/10 to-transparent'
        },
        'Covert': {
            border: 'border-red-600',
            shadow: 'shadow-red-600/50',
            text: 'text-red-500',
            bg: 'from-red-600/10 to-transparent'
        },
        'Extraordinary': {
            border: 'border-yellow-400',
            shadow: 'shadow-yellow-400/50',
            text: 'text-yellow-400',
            bg: 'from-yellow-400/10 to-transparent'
        },
        'Contraband': {
            border: 'border-orange-500',
            shadow: 'shadow-orange-500/60',
            text: 'text-orange-500',
            bg: 'from-orange-500/10 to-transparent'
        },
    };
    return styles[rarity] || styles['Consumer Grade'];
};