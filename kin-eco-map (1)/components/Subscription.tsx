
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, CreditCard, ShieldCheck, Smartphone, X, Loader2, Scale, Calendar, Clock, AlertTriangle, Zap, Download, History, ChevronRight, Star } from 'lucide-react';
import { User, SubscriptionPlan, UserType } from '../types';

interface SubscriptionProps {
    user: User;
    onBack: () => void;
    onUpdatePlan: (plan: 'standard' | 'plus' | 'premium' | 'special') => void;
    plans: SubscriptionPlan[];
    exchangeRate: number;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type PaymentMethod = 'mobile_money' | 'card';
type MobileProvider = 'mpesa' | 'orange' | 'airtel' | 'africell';
type BillingCycle = 'monthly' | 'yearly';

export const Subscription: React.FC<SubscriptionProps> = ({ user, onBack, onUpdatePlan, plans, exchangeRate, onToast }) => {
    // State for Payment Modal
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<'standard' | 'plus' | 'premium' | 'special' | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
    const [mobileProvider, setMobileProvider] = useState<MobileProvider>('mpesa');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
    
    // New UI States
    const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
    const [showHistory, setShowHistory] = useState(false);

    // Mock History Data
    const transactions = [
        { id: 'TX-8821', date: '12 Mai 2024', amount: '25,000 FC', plan: 'Plus', status: 'Succès' },
        { id: 'TX-7734', date: '12 Avr 2024', amount: '25,000 FC', plan: 'Plus', status: 'Succès' },
        { id: 'TX-1102', date: '12 Mar 2024', amount: '15,000 FC', plan: 'Standard', status: 'Succès' },
    ];

    // Access Control
    const isPayingUser = user.type === UserType.CITIZEN || user.type === UserType.BUSINESS;

    if (!isPayingUser) {
        return (
            <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500">
                    <AlertTriangle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Accès Non Autorisé</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Votre type de compte ({user.type}) ne nécessite pas d'abonnement payant via cette interface.
                </p>
                <button onClick={onBack} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-6 py-3 rounded-xl font-bold">
                    Retour
                </button>
            </div>
        );
    }

    const getSelectedPlanDetails = () => plans.find(p => p.id === selectedPlanId);

    // Helper conversion prix
    const formatPrice = (priceUSD: number, forceMonthly = false) => {
        let finalPrice = priceUSD;
        if (billingCycle === 'yearly' && !forceMonthly) {
            finalPrice = priceUSD * 12 * 0.85; // -15% discount
        }
        return `${(finalPrice * exchangeRate).toLocaleString()} FC`;
    };

    const handleSelectPlan = (planId: string) => {
        if (planId === user.subscription) return;
        setSelectedPlanId(planId as any);
        setShowPaymentModal(true);
        setPaymentStatus('idle');
    };

    const handlePayment = () => {
        setPaymentStatus('processing');
        // Simulation du paiement
        setTimeout(() => {
            setPaymentStatus('success');
            if (onToast) onToast(selectedPlanId === 'special' ? "Demande envoyée avec succès !" : "Paiement confirmé !", "success");
            
            setTimeout(() => {
                if (selectedPlanId) {
                    onUpdatePlan(selectedPlanId);
                }
                setShowPaymentModal(false);
                setSelectedPlanId(null);
            }, 2000); 
        }, 2500); 
    };

    const getCurrentPlanDetails = () => plans.find(p => p.id === user.subscription);

    const renderPaymentModal = () => {
        if (!showPaymentModal || !selectedPlanId) return null;

        const plan = getSelectedPlanDetails();
        const isSpecial = plan?.id === 'special';
        const finalPriceDisplay = isSpecial ? 'Variable' : formatPrice(plan?.priceUSD || 0);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
                
                <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">
                            {isSpecial ? 'Demande de Service' : 'Paiement Sécurisé'}
                        </h3>
                        <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                            <X size={20} className="text-gray-500 dark:text-gray-300" />
                        </button>
                    </div>

                    {paymentStatus === 'success' ? (
                        <div className="p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 text-[#00C853] animate-bounce">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                                {isSpecial ? 'Demande Envoyée !' : 'Paiement Réussi !'}
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400">
                                {isSpecial 
                                    ? 'Un collecteur vous contactera pour la pesée.' 
                                    : `Votre abonnement ${plan?.name} est maintenant actif.`}
                            </p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-5">
                            {/* Recap */}
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white p-5 rounded-2xl mb-6 flex justify-between items-center shadow-lg">
                                <div>
                                    <span className="text-[10px] opacity-70 uppercase font-bold tracking-wider">Abonnement</span>
                                    <div className="font-bold text-xl flex items-center gap-2">
                                        {plan?.name}
                                        {billingCycle === 'yearly' && !isSpecial && <span className="text-[10px] bg-[#00C853] text-white px-2 py-0.5 rounded-full">ANNUEL</span>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] opacity-70 uppercase font-bold tracking-wider">Total à payer</span>
                                    <div className="font-bold text-xl text-[#00C853]">
                                        {finalPriceDisplay}
                                    </div>
                                </div>
                            </div>

                            {/* --- CONTENU SPECIAL --- */}
                            {isSpecial ? (
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-4">
                                    <div className="flex items-start gap-3">
                                        <Scale className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Fonctionnement au Poids</h4>
                                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                                Un agent passera peser vos déchets. Vous paierez selon le poids réel (Prix/Kg fixé par l'admin).
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Payment Method Tabs */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        <button 
                                            onClick={() => setPaymentMethod('mobile_money')}
                                            className={`py-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all border-2 ${paymentMethod === 'mobile_money' ? 'border-[#00C853] bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-500'}`}
                                        >
                                            <Smartphone size={20} /> Mobile Money
                                        </button>
                                        <button 
                                            onClick={() => setPaymentMethod('card')}
                                            className={`py-3 rounded-xl text-sm font-bold flex flex-col items-center justify-center gap-2 transition-all border-2 ${paymentMethod === 'card' ? 'border-[#2962FF] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-750 text-gray-500'}`}
                                        >
                                            <CreditCard size={20} /> Carte Visa
                                        </button>
                                    </div>

                                    {/* Mobile Money Options */}
                                    {paymentMethod === 'mobile_money' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="grid grid-cols-4 gap-2">
                                                {['mpesa', 'orange', 'airtel', 'africell'].map((provider) => (
                                                    <div 
                                                        key={provider}
                                                        onClick={() => setMobileProvider(provider as any)}
                                                        className={`cursor-pointer p-2 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all aspect-square ${mobileProvider === provider ? 'border-[#00C853] bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700 hover:border-gray-300'}`}
                                                    >
                                                        <div className={`w-3 h-3 rounded-full ${mobileProvider === provider ? 'bg-[#00C853]' : 'bg-gray-300'}`}></div>
                                                        <span className="capitalize font-bold text-[10px] text-gray-700 dark:text-gray-200">{provider.slice(0,3)}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Numéro {mobileProvider}</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-3.5 text-gray-500 font-bold">+243</span>
                                                    <input 
                                                        type="tel" 
                                                        className="w-full pl-14 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors font-bold tracking-wide"
                                                        placeholder="81 234 5678"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Visa Card Options */}
                                    {paymentMethod === 'card' && (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="p-5 bg-gradient-to-br from-[#1a1a1a] to-[#333] rounded-xl text-white shadow-lg mb-4 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <CreditCard size={100} />
                                                </div>
                                                <div className="flex justify-between mb-8 relative z-10">
                                                    <div className="text-xs opacity-70 uppercase tracking-widest">Carte Bancaire</div>
                                                    <span className="font-bold italic">VISA</span>
                                                </div>
                                                <div className="text-xl tracking-widest mb-4 font-mono relative z-10">•••• •••• •••• 4242</div>
                                                <div className="flex justify-between relative z-10">
                                                    <div className="text-xs opacity-70">Nom du titulaire</div>
                                                    <div className="text-xs opacity-70">Exp</div>
                                                </div>
                                            </div>
                                            <div>
                                                <input 
                                                    type="text" 
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:border-[#00C853] outline-none"
                                                    placeholder="Numéro de carte"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    {paymentStatus !== 'success' && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <button 
                                onClick={handlePayment}
                                disabled={paymentStatus === 'processing' || (!isSpecial && paymentMethod === 'mobile_money' && phoneNumber.length < 5)}
                                className="w-full py-4 bg-[#00C853] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {paymentStatus === 'processing' ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Traitement...
                                    </>
                                ) : (
                                    isSpecial ? 'Demander une collecte' : 'Confirmer le paiement'
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const currentPlan = getCurrentPlanDetails();

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Mon Abonnement</h2>
                </div>
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-full transition-colors ${showHistory ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    <History size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
                
                {/* --- CURRENT PLAN DASHBOARD --- */}
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <ShieldCheck size={120} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Abonnement Actuel</p>
                                <h3 className="text-3xl font-bold flex items-center gap-2">
                                    {currentPlan?.name} 
                                    {currentPlan?.id !== 'special' && <span className="bg-[#00C853] text-[10px] px-2 py-1 rounded-full text-white font-bold tracking-wide">ACTIF</span>}
                                </h3>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl">
                                <Zap size={24} className="text-yellow-400 fill-yellow-400" />
                            </div>
                        </div>

                        {currentPlan?.id !== 'special' ? (
                            <>
                                <div className="mb-4">
                                    <div className="flex justify-between text-xs text-gray-300 mb-1">
                                        <span>Jours restants</span>
                                        <span className="font-bold text-white">12 jours</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-[#00C853] to-emerald-400 w-[60%] rounded-full shadow-[0_0_10px_rgba(0,200,83,0.5)]"></div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/20 p-3 rounded-xl inline-flex">
                                    <Clock size={14} />
                                    Renouvellement automatique le <span className="text-white font-bold">24 Juin 2024</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-gray-300">Vous utilisez le service à la demande. Payez uniquement ce que vous jetez.</p>
                        )}
                    </div>
                </div>

                {/* --- TOGGLE MONTHLY / YEARLY --- */}
                {!showHistory && (
                    <div className="flex justify-center">
                        <div className="bg-gray-200 dark:bg-gray-800 p-1 rounded-xl flex relative">
                            <button 
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all relative z-10 ${billingCycle === 'monthly' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Mensuel
                            </button>
                            <button 
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all relative z-10 flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                Annuel
                                <span className="bg-[#00C853] text-white text-[9px] px-1.5 py-0.5 rounded-full">-15%</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* --- PLANS GRID --- */}
                {!showHistory ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-20">
                        {plans.map(plan => {
                            const isCurrent = user.subscription === plan.id;
                            const isSpecial = plan.id === 'special';
                            
                            return (
                                <div 
                                    key={plan.id}
                                    className={`relative rounded-3xl p-6 border-2 transition-all duration-300 ${
                                        isCurrent 
                                        ? 'border-[#00C853] bg-green-50/50 dark:bg-green-900/10' 
                                        : plan.popular 
                                            ? 'border-[#2962FF] bg-white dark:bg-gray-800 shadow-lg scale-[1.02] z-10' 
                                            : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#2962FF] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                                            <Star size={10} fill="white" /> POPULAIRE
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">{plan.name}</h4>
                                        {!isSpecial ? (
                                            <div className="mt-2">
                                                <span className="text-3xl font-black text-gray-900 dark:text-white">${billingCycle === 'yearly' ? (plan.priceUSD * 12 * 0.85).toFixed(0) : plan.priceUSD}</span>
                                                <span className="text-gray-500 text-sm font-medium">/{billingCycle === 'yearly' ? 'an' : 'mois'}</span>
                                            </div>
                                        ) : (
                                            <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">Variable</div>
                                        )}
                                        {!isSpecial && <p className="text-xs text-gray-400 mt-1">≈ {formatPrice(plan.priceUSD)}</p>}
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-start gap-3">
                                            <div className="p-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 mt-0.5">
                                                <Calendar size={12} />
                                            </div>
                                            <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">{plan.schedule}</span>
                                        </div>
                                        {plan.features.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="p-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 mt-0.5">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                <span className="text-sm text-gray-600 dark:text-gray-300">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <button 
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={isCurrent && !isSpecial}
                                        className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-md ${
                                            isCurrent 
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-default' 
                                            : plan.popular
                                                ? 'bg-[#2962FF] hover:bg-blue-700 text-white shadow-blue-200 dark:shadow-none'
                                                : 'bg-white border-2 border-gray-100 hover:border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white'
                                        }`}
                                    >
                                        {isCurrent ? 'Plan Actuel' : 'Choisir ce plan'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* --- HISTORY VIEW --- */
                    <div className="animate-fade-in space-y-4 pb-20">
                        <h3 className="font-bold text-gray-800 dark:text-white mb-2">Historique des paiements</h3>
                        {transactions.map((tx) => (
                            <div key={tx.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600">
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white">{tx.plan}</h4>
                                        <p className="text-xs text-gray-500">{tx.date} • {tx.amount}</p>
                                    </div>
                                </div>
                                <button className="p-2 text-gray-400 hover:text-[#2962FF] hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                                    <Download size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Render Payment Modal */}
            {renderPaymentModal()}
        </div>
    );
};
