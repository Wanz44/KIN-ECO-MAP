import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, Edit2, CheckCircle, RefreshCw, DollarSign, Calendar, Upload, Image as ImageIcon, Trash2, Shield, Settings, AlertTriangle, Lock, Smartphone, Server, Receipt, Printer, User, QrCode, FileText, Download, XCircle, RotateCcw } from 'lucide-react';
import { SubscriptionPlan } from '../types';

interface AdminSubscriptionsProps {
    onBack: () => void;
    plans: SubscriptionPlan[];
    exchangeRate: number;
    onUpdatePlan: (updatedPlan: SubscriptionPlan) => void;
    onUpdateExchangeRate: (rate: number) => void;
    currentLogo?: string;
    onUpdateLogo?: (newLogo: string) => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Interface pour l'historique local de session caisse
interface CashTransaction {
    id: string;
    timestamp: Date;
    clientName: string;
    planName: string;
    amountFC: number;
    amountUSD: number;
    status: 'completed' | 'voided'; // voided = annulé
    cashierName: string;
}

export const AdminSubscriptions: React.FC<AdminSubscriptionsProps> = ({ 
    onBack, 
    plans, 
    exchangeRate, 
    onUpdatePlan, 
    onUpdateExchangeRate,
    currentLogo = './logo.png',
    onUpdateLogo,
    onToast
}) => {
    const [activeTab, setActiveTab] = useState<'plans' | 'branding' | 'system' | 'security' | 'pos'>('pos');
    
    // State for Exchange Rate
    const [rateInput, setRateInput] = useState(exchangeRate.toString());
    
    // State for Plans
    const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
    const [editForm, setEditForm] = useState<Partial<SubscriptionPlan>>({});

    // State for Logo
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock State for System Settings
    const [systemSettings, setSystemSettings] = useState({
        maintenanceMode: false,
        supportEmail: 'support@kinecomap.cd',
        appVersion: '1.0.3'
    });

    // Mock State for Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        force2FA: false,
        sessionTimeout: 60, // minutes
        passwordPolicy: 'strong'
    });

    // POS / Cashier State
    const [posForm, setPosForm] = useState({
        clientName: '',
        clientPhone: '',
        selectedPlanId: 'standard',
        notes: ''
    });
    const [generatedReceipt, setGeneratedReceipt] = useState<any | null>(null);
    
    // Historique de session (Caisse Journalière)
    const [cashSession, setCashSession] = useState<CashTransaction[]>([
        { id: 'TX-SESSION-01', timestamp: new Date(Date.now() - 3600000), clientName: 'Maman Maguy', planName: 'Standard', amountFC: 28000, amountUSD: 10, status: 'completed', cashierName: 'Admin' }
    ]);

    // Calculs totaux session
    const totalCashFC = cashSession.filter(t => t.status === 'completed').reduce((acc, curr) => acc + curr.amountFC, 0);
    const totalTransactions = cashSession.filter(t => t.status === 'completed').length;

    // --- Handlers ---

    const handleSaveRate = () => {
        const rate = parseInt(rateInput);
        if (!isNaN(rate) && rate > 0) {
            onUpdateExchangeRate(rate);
            if (onToast) onToast("Taux de change mis à jour !", "success");
        }
    };

    const openEditModal = (plan: SubscriptionPlan) => {
        setEditingPlan(plan);
        setEditForm({ ...plan });
    };

    const handleSavePlan = () => {
        if (editingPlan && editForm) {
            onUpdatePlan({ ...editingPlan, ...editForm } as SubscriptionPlan);
            setEditingPlan(null);
            if (onToast) onToast("Plan mis à jour", "success");
        }
    };

    const handleChange = (field: keyof SubscriptionPlan, value: any) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && onUpdateLogo) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpdateLogo(reader.result as string);
                if (onToast) onToast("Logo mis à jour", "success");
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const resetLogo = () => {
        if (onUpdateLogo && confirm("Réinitialiser le logo par défaut ?")) {
            onUpdateLogo('./logo.png');
            if (onToast) onToast("Logo réinitialisé", "info");
        }
    };

    const toggleSystemSetting = (key: keyof typeof systemSettings) => {
        setSystemSettings(prev => {
            const newState = { ...prev, [key]: !prev[key as keyof typeof systemSettings] };
            if (onToast) onToast("Paramètre système modifié", "info");
            return newState;
        });
    };

    const toggleSecuritySetting = (key: keyof typeof securitySettings) => {
        setSecuritySettings(prev => {
            const newState = { ...prev, [key]: !prev[key as keyof typeof securitySettings] };
            if (onToast) onToast("Paramètre de sécurité modifié", "info");
            return newState;
        });
    };

    // POS Handlers
    const handleGenerateReceipt = (e: React.FormEvent) => {
        e.preventDefault();
        const plan = plans.find(p => p.id === posForm.selectedPlanId);
        if (!plan) return;

        const amountFC = plan.priceUSD * exchangeRate;
        const transactionId = `TX-${Math.floor(Math.random() * 1000000)}`;
        const now = new Date();

        const newTransaction: CashTransaction = {
            id: transactionId,
            timestamp: now,
            clientName: posForm.clientName || 'Client Anonyme',
            planName: plan.name,
            amountFC: amountFC,
            amountUSD: plan.priceUSD,
            status: 'completed',
            cashierName: 'Admin' // Should come from logged user context
        };

        // Add to history
        setCashSession(prev => [newTransaction, ...prev]);

        // Generate Receipt Data for View
        setGeneratedReceipt({
            ...newTransaction,
            phone: posForm.clientPhone || 'N/A',
            qrData: `KIN-ECO:${transactionId}|${amountFC}FC|${now.toISOString()}|${plan.name}`
        });

        // Reset Form partially
        setPosForm(prev => ({ ...prev, clientName: '', clientPhone: '', notes: '' }));
        if (onToast) onToast("Paiement enregistré avec succès", "success");
    };

    const handlePrintReceipt = () => {
        window.print();
    };

    const handleVoidTransaction = (id: string) => {
        if (confirm("Êtes-vous sûr de vouloir ANNULER cette transaction ? Cette action est irréversible dans le journal.")) {
            setCashSession(prev => prev.map(t => t.id === id ? { ...t, status: 'voided' } : t));
            if (onToast) onToast("Transaction annulée", "info");
        }
    };

    const handleReprint = (tx: CashTransaction) => {
        setGeneratedReceipt({
            ...tx,
            phone: 'N/A', // Info perdue dans l'historique simple, mais ok pour réimpression
            qrData: `KIN-ECO:${tx.id}|${tx.amountFC}FC|${tx.timestamp.toISOString()}|${tx.planName}`
        });
        if (onToast) onToast("Prêt pour réimpression", "info");
    };

    const handleExportDailyReport = () => {
        const headers = ["ID,Heure,Client,Plan,Montant FC,Statut,Caissier"];
        const rows = cashSession.map(t => 
            `${t.id},${t.timestamp.toLocaleTimeString()},${t.clientName},${t.planName},${t.amountFC},${t.status},${t.cashierName}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `caisse_journaliere_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        if (onToast) onToast("Rapport journalier exporté (CSV)", "success");
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #receipt-area, #receipt-area * {
                        visibility: visible;
                    }
                    #receipt-area {
                        position: fixed;
                        left: 50%;
                        top: 0;
                        transform: translateX(-50%);
                        width: 80mm; /* Largeur ticket thermique standard */
                        height: auto;
                        background: white;
                        color: black;
                        font-family: 'Courier New', Courier, monospace;
                        padding: 10px;
                        margin: 0;
                        box-shadow: none;
                        border: none;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex flex-col gap-4 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Configuration & Caisse</h2>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-x-auto no-scrollbar">
                    <button 
                        onClick={() => setActiveTab('pos')}
                        className={`flex-1 min-w-[120px] py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'pos' ? 'bg-white dark:bg-gray-600 text-[#2962FF] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Receipt size={16} /> Encaissement
                    </button>
                    <button 
                        onClick={() => setActiveTab('system')}
                        className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'system' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Settings size={16} /> Système
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'security' ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Shield size={16} /> Sécurité
                    </button>
                    <button 
                        onClick={() => setActiveTab('plans')}
                        className={`flex-1 min-w-[120px] py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'plans' ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <DollarSign size={16} /> Abonnements
                    </button>
                    <button 
                        onClick={() => setActiveTab('branding')}
                        className={`flex-1 min-w-[100px] py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'branding' ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <ImageIcon size={16} /> Branding
                    </button>
                </div>
            </div>

            <div className="p-5 flex-1 overflow-y-auto space-y-6">
                
                {/* === TAB: POS (Point of Sale) === */}
                {activeTab === 'pos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in h-full">
                        
                        {/* LEFT COLUMN: Cashier Form */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Daily Stats Card */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border-l-4 border-l-[#00C853] flex justify-between items-center">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Caisse Journalière</p>
                                    <h3 className="text-2xl font-black text-gray-800 dark:text-white">{totalCashFC.toLocaleString()} FC</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transactions</p>
                                    <h3 className="text-xl font-bold text-blue-600">{totalTransactions}</h3>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                                    <DollarSign size={20} className="text-green-500" /> Nouvelle Transaction
                                </h3>
                                
                                <form onSubmit={handleGenerateReceipt} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plan d'abonnement</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {plans.map(plan => (
                                                <div 
                                                    key={plan.id}
                                                    onClick={() => setPosForm({...posForm, selectedPlanId: plan.id})}
                                                    className={`cursor-pointer p-3 rounded-xl border-2 transition-all flex flex-col items-center text-center ${
                                                        posForm.selectedPlanId === plan.id 
                                                        ? 'border-[#2962FF] bg-blue-50 dark:bg-blue-900/20 text-[#2962FF]' 
                                                        : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    <span className="font-bold text-sm">{plan.name}</span>
                                                    <span className="text-xs">${plan.priceUSD}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Montant à percevoir :</span>
                                            <span className="text-2xl font-black text-gray-800 dark:text-white">
                                                {((plans.find(p => p.id === posForm.selectedPlanId)?.priceUSD || 0) * exchangeRate).toLocaleString()} FC
                                            </span>
                                        </div>
                                        <p className="text-xs text-right text-gray-400">Taux: 1$ = {exchangeRate} FC</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client</label>
                                        <div className="relative mb-2">
                                            <User size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                            <input 
                                                type="text" 
                                                placeholder="Nom du client (Optionnel)"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                                value={posForm.clientName}
                                                onChange={(e) => setPosForm({...posForm, clientName: e.target.value})}
                                            />
                                        </div>
                                        <div className="relative">
                                            <Smartphone size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                            <input 
                                                type="tel" 
                                                placeholder="Téléphone (Optionnel)"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                                value={posForm.clientPhone}
                                                onChange={(e) => setPosForm({...posForm, clientPhone: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Interne)</label>
                                        <input 
                                            type="text" 
                                            placeholder="Référence, commentaire..."
                                            className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF] text-sm"
                                            value={posForm.notes}
                                            onChange={(e) => setPosForm({...posForm, notes: e.target.value})}
                                        />
                                    </div>

                                    <button 
                                        type="submit"
                                        className="w-full py-4 bg-[#00C853] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2 mt-4 active:scale-95 transform"
                                    >
                                        <CheckCircle size={20} /> Valider Paiement
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: History & Receipt */}
                        <div className="lg:col-span-7 flex flex-col gap-6">
                            
                            {/* Receipt Preview Modal / Area */}
                            {generatedReceipt ? (
                                <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 relative">
                                    <button 
                                        onClick={() => setGeneratedReceipt(null)}
                                        className="absolute top-4 right-4 p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 transition-colors"
                                    >
                                        <XCircle size={20} className="text-gray-600 dark:text-gray-300" />
                                    </button>

                                    <div className="text-green-600 dark:text-green-400 font-bold mb-4 flex items-center gap-2">
                                        <CheckCircle size={24} /> Paiement enregistré !
                                    </div>

                                    <div id="receipt-area" className="bg-white text-black p-4 rounded-none shadow-xl w-[300px] font-mono text-sm relative">
                                        <div className="text-center border-b-2 border-black pb-2 mb-2">
                                            <h2 className="font-bold text-lg uppercase tracking-wider">KIN ECO-MAP</h2>
                                            <p className="text-xs">Services de Collecte</p>
                                            <p className="text-xs">Kinshasa, RDC</p>
                                            <p className="text-xs mt-1">{generatedReceipt.timestamp.toLocaleString('fr-FR')}</p>
                                        </div>

                                        <div className="space-y-1 mb-2">
                                            <div className="flex justify-between"><span>ID:</span> <span className="font-bold">{generatedReceipt.id}</span></div>
                                            <div className="flex justify-between"><span>Client:</span> <span>{generatedReceipt.clientName}</span></div>
                                            <div className="flex justify-between"><span>Plan:</span> <span className="font-bold">{generatedReceipt.planName}</span></div>
                                            <div className="flex justify-between"><span>Caissier:</span> <span>{generatedReceipt.cashierName}</span></div>
                                        </div>

                                        <div className="border-t-2 border-dashed border-black my-2"></div>
                                        
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>TOTAL</span>
                                            <span>{generatedReceipt.amountFC.toLocaleString()} FC</span>
                                        </div>
                                        <div className="text-xs text-right">({generatedReceipt.amountUSD} USD)</div>

                                        <div className="flex justify-center my-4">
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(generatedReceipt.qrData)}`} 
                                                alt="QR Code" 
                                                className="w-24 h-24"
                                            />
                                        </div>
                                        
                                        <p className="text-center text-xs uppercase">Merci de votre confiance.</p>
                                        <p className="text-center text-[10px] mt-1">Conservez ce ticket.</p>
                                    </div>

                                    <div className="mt-6 flex gap-3 w-full max-w-xs no-print">
                                        <button 
                                            onClick={handlePrintReceipt}
                                            className="flex-1 py-3 bg-[#2962FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Printer size={18} /> Imprimer
                                        </button>
                                        <button 
                                            onClick={() => setGeneratedReceipt(null)}
                                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                        >
                                            Nouveau
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full overflow-hidden">
                                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/30">
                                        <h3 className="font-bold text-gray-700 dark:text-white flex items-center gap-2">
                                            <FileText size={18} /> Historique Journalier
                                        </h3>
                                        <button onClick={handleExportDailyReport} className="text-[#2962FF] text-xs font-bold flex items-center gap-1 hover:underline">
                                            <Download size={14} /> Exporter Excel (CSV)
                                        </button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-0">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 uppercase">
                                                <tr>
                                                    <th className="px-4 py-3">Heure</th>
                                                    <th className="px-4 py-3">Client</th>
                                                    <th className="px-4 py-3 text-right">Montant</th>
                                                    <th className="px-4 py-3 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                                {cashSession.map((tx) => (
                                                    <tr key={tx.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${tx.status === 'voided' ? 'opacity-50 grayscale' : ''}`}>
                                                        <td className="px-4 py-3 font-mono text-xs text-gray-500">
                                                            {tx.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="font-bold text-gray-800 dark:text-white truncate max-w-[100px]">{tx.clientName}</div>
                                                            <div className="text-xs text-gray-500">{tx.planName}</div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold text-gray-800 dark:text-white">
                                                            {tx.status === 'voided' ? <span className="line-through">{tx.amountFC.toLocaleString()}</span> : tx.amountFC.toLocaleString()} FC
                                                        </td>
                                                        <td className="px-4 py-3 flex justify-center gap-2">
                                                            {tx.status === 'completed' && (
                                                                <>
                                                                    <button onClick={() => handleReprint(tx)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Réimprimer">
                                                                        <Printer size={16} />
                                                                    </button>
                                                                    <button onClick={() => handleVoidTransaction(tx.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg" title="Annuler">
                                                                        <XCircle size={16} />
                                                                    </button>
                                                                </>
                                                            )}
                                                            {tx.status === 'voided' && <span className="text-xs text-red-500 font-bold px-2 py-1 bg-red-50 rounded">ANNULÉ</span>}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {cashSession.length === 0 && (
                                            <div className="p-8 text-center text-gray-400">Aucune transaction aujourd'hui.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* === TAB: SYSTEM === */}
                {activeTab === 'system' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Maintenance Mode */}
                        <div className={`p-6 rounded-2xl border transition-all ${systemSettings.maintenanceMode ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${systemSettings.maintenanceMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'}`}>
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Mode Maintenance</h3>
                                        <p className="text-sm text-gray-500">Désactive l'accès à l'application pour les utilisateurs non-admins.</p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => toggleSystemSetting('maintenanceMode')}
                                    className={`w-14 h-8 rounded-full flex items-center transition-colors px-1 cursor-pointer ${systemSettings.maintenanceMode ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${systemSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                            {systemSettings.maintenanceMode && (
                                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-xl font-medium">
                                    ⚠️ L'application est actuellement inaccessible au public.
                                </div>
                            )}
                        </div>

                        {/* General Config */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                                <Server size={20} className="text-blue-500" /> Paramètres Généraux
                            </h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email Support Technique</label>
                                <input 
                                    type="email" 
                                    value={systemSettings.supportEmail}
                                    onChange={(e) => setSystemSettings({...systemSettings, supportEmail: e.target.value})}
                                    className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:border-[#2962FF]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Version Application Mobile</label>
                                <input 
                                    type="text" 
                                    value={systemSettings.appVersion}
                                    readOnly
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button className="px-6 py-3 bg-[#2962FF] text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                    <Save size={18} /> Sauvegarder
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB: SECURITY === */}
                {activeTab === 'security' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-green-500" /> Politiques de Sécurité
                            </h3>

                            {/* 2FA Toggle */}
                            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800 dark:text-white">Double Authentification (2FA)</h4>
                                        <p className="text-xs text-gray-500">Forcer le 2FA pour tous les comptes Admin et Collecteur.</p>
                                    </div>
                                </div>
                                <div 
                                    onClick={() => toggleSecuritySetting('force2FA')}
                                    className={`w-12 h-7 rounded-full flex items-center transition-colors px-1 cursor-pointer ${securitySettings.force2FA ? 'bg-[#00C853]' : 'bg-gray-300 dark:bg-gray-600'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${securitySettings.force2FA ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                            </div>

                            {/* Session Timeout */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Expiration Session Inactive</label>
                                    <span className="text-sm font-bold text-[#2962FF]">{securitySettings.sessionTimeout} minutes</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="5" 
                                    max="120" 
                                    step="5"
                                    value={securitySettings.sessionTimeout}
                                    onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: parseInt(e.target.value)})}
                                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-[#2962FF]"
                                />
                                <div className="flex justify-between text-xs text-gray-400 mt-1">
                                    <span>5 min</span>
                                    <span>2 heures</span>
                                </div>
                            </div>

                            {/* Password Policy */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Politique Mots de Passe</label>
                                <select 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                    value={securitySettings.passwordPolicy}
                                    onChange={(e) => setSecuritySettings({...securitySettings, passwordPolicy: e.target.value})}
                                >
                                    <option value="standard">Standard (8 caractères)</option>
                                    <option value="strong">Fort (10+ carac, Symbole, Maj)</option>
                                    <option value="strict">Strict (12+ carac, Rotation 90j)</option>
                                </select>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                <button className="px-6 py-3 bg-[#00C853] text-white rounded-xl font-bold shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2">
                                    <Lock size={18} /> Appliquer les règles
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB: BRANDING === */}
                {activeTab === 'branding' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <ImageIcon size={20} className="text-purple-500" /> 
                                Logo & Identité Visuelle
                            </h3>
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="w-32 h-32 bg-gray-50 dark:bg-gray-700 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center relative overflow-hidden">
                                    <img src={currentLogo} alt="Current Logo" className="w-full h-full object-contain p-2" />
                                </div>
                                <div className="flex-1 space-y-4 w-full">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Ce logo sera utilisé sur l'écran de connexion, le menu latéral, et les documents générés (factures, rapports).
                                        <br/>Format recommandé : PNG Transparent, 512x512px.
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleLogoUpload} 
                                            accept="image/*" 
                                            className="hidden" 
                                        />
                                        <button 
                                            onClick={triggerFileInput}
                                            className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <Upload size={18} /> Uploader une image
                                        </button>
                                        <button 
                                            onClick={resetLogo}
                                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <RefreshCw size={18} /> Réinitialiser
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === TAB: PLANS === */}
                {activeTab === 'plans' && (
                    <div className="space-y-6 animate-fade-in">
                        {/* Exchange Rate Card */}
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                                <RefreshCw size={20} className="text-blue-500" /> 
                                Taux de Change
                            </h3>
                            <div className="flex flex-col md:flex-row items-end gap-4">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                        1 USD vaut en CDF (Franc Congolais)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-3.5 text-gray-400 font-bold">FC</span>
                                        <input 
                                            type="number" 
                                            value={rateInput}
                                            onChange={(e) => setRateInput(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white font-bold outline-none focus:border-[#2962FF]"
                                        />
                                    </div>
                                </div>
                                <button 
                                    onClick={handleSaveRate}
                                    className="w-full md:w-auto py-3.5 px-6 bg-[#2962FF] hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={18} /> Mettre à jour
                                </button>
                            </div>
                        </div>

                        {/* Plans Grid */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Gestion des Abonnements</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {plans.map(plan => (
                                    <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                                        {plan.popular && (
                                            <div className="absolute top-0 right-0 bg-[#00C853] text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                                                POPULAIRE
                                            </div>
                                        )}
                                        
                                        <div className="flex justify-between items-start mb-4">
                                            <h4 className="font-bold text-xl text-gray-800 dark:text-white">{plan.name}</h4>
                                            <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg text-xs font-bold uppercase">
                                                {plan.id}
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <span className="text-3xl font-bold text-[#2962FF]">${plan.priceUSD}</span>
                                            <span className="text-gray-400 text-sm"> / mois</span>
                                            <div className="text-xs text-gray-500 font-medium mt-1">
                                                ≈ {(plan.priceUSD * exchangeRate).toLocaleString()} CDF
                                            </div>
                                        </div>

                                        <div className="space-y-2 mb-6 min-h-[80px]">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <Calendar size={14} className="text-gray-400 shrink-0" />
                                                {plan.schedule}
                                            </div>
                                            {plan.features.slice(0, 2).map((f, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                                                    <CheckCircle size={14} className="text-[#00C853] shrink-0" />
                                                    <span className="truncate">{f}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={() => openEditModal(plan)}
                                            className="w-full py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Edit2 size={16} /> Modifier
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingPlan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingPlan(null)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-fade-in-up">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Modifier le plan : {editingPlan.name}</h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom du plan</label>
                                <input 
                                    type="text" 
                                    value={editForm.name || ''}
                                    onChange={(e) => handleChange('name', e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prix (USD)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-3.5 text-gray-400" />
                                        <input 
                                            type="number" 
                                            value={editForm.priceUSD}
                                            onChange={(e) => handleChange('priceUSD', parseFloat(e.target.value))}
                                            className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Populaire ?</label>
                                    <button 
                                        onClick={() => handleChange('popular', !editForm.popular)}
                                        className={`w-full py-3 rounded-xl font-bold transition-colors ${editForm.popular ? 'bg-[#00C853] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}
                                    >
                                        {editForm.popular ? 'OUI' : 'NON'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jours de collecte</label>
                                <input 
                                    type="text" 
                                    value={editForm.schedule || ''}
                                    onChange={(e) => handleChange('schedule', e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button 
                                onClick={() => setEditingPlan(null)}
                                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSavePlan}
                                className="flex-1 py-3 rounded-xl font-bold bg-[#2962FF] text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                            >
                                Enregistrer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};