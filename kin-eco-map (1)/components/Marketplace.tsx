import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Upload, Search, Filter, DollarSign, Scale, Tag, Check, Loader2, Image as ImageIcon, MapPin, X, Plus, Phone, MessageCircle, ChevronDown, SlidersHorizontal, ArrowUpRight, Sparkles, User, Info, Star, ShieldCheck, Lock, CreditCard, Smartphone } from 'lucide-react';
import { MarketplaceItem, User as UserType } from '../types';
import { analyzeWasteItem } from '../services/geminiService';

interface MarketplaceProps {
    user: UserType;
    onBack: () => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Configuration de la commission plateforme (5%)
const PLATFORM_FEE_PERCENTAGE = 0.05;

// Données enrichies pour la démo
const MOCK_ITEMS: MarketplaceItem[] = [
    { id: '1', sellerId: 'u2', sellerName: 'Jean Kabeya', title: 'Lot 5 Laptops HP (HS)', category: 'electronics', description: 'Pour récupération pièces. Disques durs retirés. Écrans intacts.', weight: 12.5, price: 150000, imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=500&q=60', date: 'Aujourd\'hui, 10:30', status: 'available' },
    { id: '2', sellerId: 'u3', sellerName: 'Kin Metal SARL', title: 'Câbles Cuivre Dénudés', category: 'metal', description: 'Cuivre pur, qualité A. Idéal pour fonderie.', weight: 25, price: 450000, imageUrl: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=500&q=60', date: 'Hier, 14:20', status: 'available' },
    { id: '3', sellerId: 'u1', sellerName: 'Maman Maguy', title: 'Batteries Solaires 12V', category: 'other', description: 'Batteries gel usagées, à recycler. 3 unités.', weight: 45, price: 90000, imageUrl: 'https://images.unsplash.com/photo-1616744679268-c91834273b0f?auto=format&fit=crop&w=500&q=60', date: '12 Mai', status: 'available' },
    { id: '4', sellerId: 'u4', sellerName: 'Cyber Café Gombe', title: 'Vieux Routeurs Cisco', category: 'electronics', description: 'Matériel réseau obsolète fonctionnel.', weight: 3.2, price: 45000, imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bbc7c?auto=format&fit=crop&w=500&q=60', date: '10 Mai', status: 'available' },
];

const CATEGORIES = [
    { id: 'all', label: 'Tout', icon: null },
    { id: 'electronics', label: 'Électronique', icon: '💻' },
    { id: 'metal', label: 'Métaux', icon: '🔩' },
    { id: 'plastic', label: 'Plastique', icon: '🥤' },
    { id: 'other', label: 'Autre', icon: '📦' },
];

// Mock Database of ratings
const INITIAL_RATINGS: Record<string, { average: number, count: number }> = {
    'u1': { average: 4.8, count: 24 },
    'u2': { average: 3.5, count: 8 },
    'u3': { average: 5.0, count: 42 },
    'u4': { average: 4.2, count: 15 },
};

export const Marketplace: React.FC<MarketplaceProps> = ({ user, onBack, onToast }) => {
    const [view, setView] = useState<'browse' | 'sell'>('browse');
    const [items, setItems] = useState<MarketplaceItem[]>(MOCK_ITEMS);
    
    // Ratings State
    const [sellerRatings, setSellerRatings] = useState(INITIAL_RATINGS);

    // Filters & Search
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc'>('date');
    const [selectedItem, setSelectedItem] = useState<MarketplaceItem | null>(null);

    // Transaction & Payment State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
    const [paymentMethod, setPaymentMethod] = useState<'mobile' | 'card'>('mobile');

    // Contact Modal State
    const [contactItem, setContactItem] = useState<MarketplaceItem | null>(null);

    // Sell Form State
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStep, setAnalysisStep] = useState(0); // 0: None, 1: Uploading, 2: Identifying, 3: Pricing
    const [sellForm, setSellForm] = useState<Partial<MarketplaceItem>>({
        category: 'electronics',
        price: 0,
        weight: 0,
        title: '',
        description: ''
    });
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Logic ---

    const handleRateSeller = (e: React.MouseEvent, sellerId: string, rating: number) => {
        e.stopPropagation(); // Prevent opening the modal
        
        setSellerRatings(prev => {
            const current = prev[sellerId] || { average: 0, count: 0 };
            const newCount = current.count + 1;
            const newAverage = ((current.average * current.count) + rating) / newCount;
            
            return {
                ...prev,
                [sellerId]: { average: newAverage, count: newCount }
            };
        });

        if (onToast) onToast(`Vous avez donné ${rating} étoiles ! Merci pour votre avis.`, "success");
    };

    const handleContactClick = (e: React.MouseEvent, item: MarketplaceItem) => {
        e.stopPropagation();
        setContactItem(item);
    };

    const handleStartChat = () => {
        if (onToast) onToast(`Chat ouvert avec ${contactItem?.sellerName}`, "info");
        setContactItem(null);
    };

    const handleCall = () => {
        window.open('tel:+243000000000');
        setContactItem(null);
    };

    const handleWhatsApp = () => {
        window.open(`https://wa.me/?text=Bonjour ${contactItem?.sellerName}, je suis intéressé par votre annonce : ${contactItem?.title}`);
        setContactItem(null);
    };

    const handleBuyClick = (e: React.MouseEvent, item: MarketplaceItem) => {
        e.stopPropagation();
        setSelectedItem(item);
        setPaymentStep('details');
        setShowPaymentModal(true);
    };

    const handleProcessPayment = () => {
        setPaymentStep('processing');
        // Simulation Paiement
        setTimeout(() => {
            setPaymentStep('success');
            if (onToast) onToast("Paiement sécurisé effectué. Fonds bloqués jusqu'à réception.", "success");
            
            // Mark item as sold in local state
            if (selectedItem) {
                setItems(prev => prev.map(i => i.id === selectedItem.id ? { ...i, status: 'sold' } : i));
            }
        }, 2500);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setCapturedImage(base64);
                
                // Trigger AI Analysis Animation & Logic
                setIsAnalyzing(true);
                setAnalysisStep(1);
                
                setTimeout(() => setAnalysisStep(2), 1000);
                setTimeout(() => setAnalysisStep(3), 2500);

                try {
                    const analysis = await analyzeWasteItem(base64);
                    
                    setTimeout(() => {
                        setSellForm({
                            ...sellForm,
                            title: analysis.title,
                            category: analysis.category,
                            weight: analysis.weight,
                            price: analysis.price,
                            description: analysis.description
                        });
                        setIsAnalyzing(false);
                        setAnalysisStep(0);
                        if (onToast) onToast("Analyse terminée ! Vérifiez les détails.", "success");
                    }, 3500); 
                    
                } catch (err) {
                    setIsAnalyzing(false);
                    setAnalysisStep(0);
                    if (onToast) onToast("Erreur d'analyse, veuillez remplir manuellement.", "error");
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePublish = (e: React.FormEvent) => {
        e.preventDefault();
        if (!sellForm.title || !sellForm.price || !capturedImage) {
            if (onToast) onToast("Veuillez remplir tous les champs obligatoires.", "error");
            return;
        }

        const newItem: MarketplaceItem = {
            id: Date.now().toString(),
            sellerId: user.id || 'unknown',
            sellerName: `${user.firstName} ${user.lastName?.charAt(0)}.`,
            title: sellForm.title,
            category: sellForm.category as any,
            description: sellForm.description || '',
            weight: Number(sellForm.weight),
            price: Number(sellForm.price),
            imageUrl: capturedImage,
            date: 'À l\'instant',
            status: 'available'
        };

        setItems([newItem, ...items]);
        if (onToast) onToast("Annonce publiée avec succès !", "success");
        setView('browse');
        setCapturedImage(null);
        setSellForm({ category: 'electronics', price: 0, weight: 0, title: '', description: '' });
    };

    // Filter Logic
    const filteredItems = items
        .filter(i => filterCategory === 'all' || i.category === filterCategory)
        .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.description.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            return 0; // Default date sort
        });

    // --- Sub-Components ---

    const ItemCard = ({ item }: { item: MarketplaceItem }) => {
        const ratingData = sellerRatings[item.sellerId] || { average: 0, count: 0 };
        const stars = Math.round(ratingData.average);

        return (
            <div 
                onClick={() => setSelectedItem(item)}
                className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full relative"
            >
                <div className="h-40 bg-gray-200 relative overflow-hidden">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide flex items-center gap-1">
                    {CATEGORIES.find(c => c.id === item.category)?.icon} {item.category}
                    </div>
                    {item.status === 'sold' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="bg-red-500 text-white font-bold px-4 py-1 rounded-full transform -rotate-12 border-2 border-white">VENDU</span>
                        </div>
                    )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                    <div className="mb-2">
                        <h3 className="font-bold text-gray-800 dark:text-white text-base line-clamp-1 leading-tight">{item.title}</h3>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0 border border-gray-200 dark:border-gray-600">
                            {item.sellerName.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">{item.sellerName}</span>
                        <div className="flex items-center gap-0.5">
                            <Star size={10} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-bold text-gray-600 dark:text-gray-300">{ratingData.average.toFixed(1)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-gray-50 dark:border-gray-700 mt-auto">
                        <div className="text-[#00C853] font-black text-lg">{item.price.toLocaleString()} FC</div>
                        
                        <div className="flex gap-2">
                            <button 
                                onClick={(e) => handleContactClick(e, item)}
                                className="px-2 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center gap-1 text-[10px] font-bold"
                                title="Contacter"
                            >
                                <MessageCircle size={14} /> Contacter
                            </button>
                            {item.status !== 'sold' && (
                                <button 
                                    onClick={(e) => handleBuyClick(e, item)}
                                    className="px-3 py-2 rounded-lg bg-[#2962FF] hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1"
                                >
                                    <ShieldCheck size={14} /> Acheter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ContactOptionModal = () => {
        if (!contactItem) return null;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setContactItem(null)}></div>
                <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-fade-in-up">
                    <button onClick={() => setContactItem(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                        <X size={20} className="text-gray-500" />
                    </button>
                    
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">Contacter le vendeur</h3>
                    <p className="text-sm text-gray-500 mb-6">Comment souhaitez-vous joindre {contactItem.sellerName} ?</p>

                    <div className="space-y-3">
                        <button onClick={handleStartChat} className="w-full p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 flex items-center gap-4 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                                <MessageCircle size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold">Chat In-App</div>
                                <div className="text-xs opacity-80">Messagerie sécurisée</div>
                            </div>
                        </button>

                        <button onClick={handleWhatsApp} className="w-full p-4 rounded-2xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 flex items-center gap-4 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                                <MessageCircle size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold">WhatsApp</div>
                                <div className="text-xs opacity-80">Message direct</div>
                            </div>
                        </button>

                        <button onClick={handleCall} className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center">
                                <Phone size={20} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold">Appeler</div>
                                <div className="text-xs opacity-80">Appel téléphonique</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const SecurePaymentModal = () => {
        if (!showPaymentModal || !selectedItem) return null;

        const fee = selectedItem.price * PLATFORM_FEE_PERCENTAGE;
        const total = selectedItem.price + fee;

        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
                <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
                    
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className="text-[#00C853]" />
                            <h3 className="font-bold text-gray-800 dark:text-white">Paiement Sécurisé</h3>
                        </div>
                        <button onClick={() => setShowPaymentModal(false)} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full">
                            <X size={20} className="text-gray-500" />
                        </button>
                    </div>

                    {paymentStep === 'details' && (
                        <div className="p-6 space-y-6">
                             {/* Item Recap */}
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                    <img src={selectedItem.imageUrl} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-800 dark:text-white line-clamp-1">{selectedItem.title}</h4>
                                    <p className="text-xs text-gray-500">{selectedItem.category} • {selectedItem.weight}kg</p>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl space-y-3 border border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span>Prix vendeur</span>
                                    <span>{selectedItem.price.toLocaleString()} FC</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300">
                                    <span className="flex items-center gap-1">Frais de service (5%) <Info size={12} className="text-gray-400"/></span>
                                    <span>{fee.toLocaleString()} FC</span>
                                </div>
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between items-center">
                                    <span className="font-bold text-gray-800 dark:text-white">Total à payer</span>
                                    <span className="font-black text-xl text-[#2962FF]">{total.toLocaleString()} FC</span>
                                </div>
                            </div>

                            {/* Safety Notice */}
                            <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-xl text-xs leading-relaxed">
                                <Lock size={16} className="shrink-0 mt-0.5" />
                                <p>Votre argent est bloqué sur un compte de séquestre KIN ECO. Le vendeur ne sera payé qu'après confirmation de la réception.</p>
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Moyen de paiement</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => setPaymentMethod('mobile')}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'mobile' ? 'border-[#00C853] bg-green-50 dark:bg-green-900/20 text-green-700' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <Smartphone size={20} />
                                        <span className="text-xs font-bold">Mobile Money</span>
                                    </button>
                                    <button 
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-[#2962FF] bg-blue-50 dark:bg-blue-900/20 text-blue-700' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <CreditCard size={20} />
                                        <span className="text-xs font-bold">Carte Bancaire</span>
                                    </button>
                                </div>
                            </div>

                            <button 
                                onClick={handleProcessPayment}
                                className="w-full py-4 bg-[#2962FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                            >
                                <ShieldCheck size={20} /> Payer {total.toLocaleString()} FC
                            </button>
                        </div>
                    )}

                    {paymentStep === 'processing' && (
                         <div className="p-10 flex flex-col items-center justify-center text-center h-full">
                            <Loader2 size={48} className="text-[#2962FF] animate-spin mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Traitement sécurisé...</h3>
                            <p className="text-gray-500 text-sm">Veuillez valider sur votre téléphone.</p>
                         </div>
                    )}

                    {paymentStep === 'success' && (
                         <div className="p-10 flex flex-col items-center justify-center text-center h-full animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-[#00C853] mb-4 shadow-sm">
                                <Check size={40} strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Paiement Validé !</h3>
                            <p className="text-gray-500 text-sm mb-6">L'argent est sécurisé. Vous pouvez maintenant récupérer l'objet.</p>
                            <button 
                                onClick={() => { setShowPaymentModal(false); setSelectedItem(null); }}
                                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-white rounded-xl font-bold transition-colors"
                            >
                                Fermer
                            </button>
                         </div>
                    )}
                </div>
            </div>
        );
    };

    const ItemDetailModal = () => {
        if (!selectedItem) return null;
        const ratingData = sellerRatings[selectedItem.sellerId] || { average: 0, count: 0 };
        const fee = selectedItem.price * PLATFORM_FEE_PERCENTAGE;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}></div>
                <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden relative z-10 flex flex-col md:flex-row shadow-2xl animate-scale-up">
                    <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 z-20 p-2 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full text-white md:text-gray-500 transition-colors">
                        <X size={24} />
                    </button>

                    {/* Image Side */}
                    <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                        <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-sm font-medium flex items-center gap-2">
                             <MapPin size={16} className="text-red-400" />
                             Kinshasa, Gombe
                        </div>
                    </div>

                    {/* Details Side */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2 mb-2">
                             <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {CATEGORIES.find(c => c.id === selectedItem.category)?.label}
                             </span>
                             <span className="text-gray-400 text-xs">• Publié {selectedItem.date}</span>
                        </div>
                        
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">{selectedItem.title}</h2>
                        
                        <div className="flex items-end gap-2 mb-6">
                            <span className="text-4xl font-black text-[#00C853]">{selectedItem.price.toLocaleString()}</span>
                            <span className="text-lg font-bold text-gray-500 mb-1">FC</span>
                        </div>

                        {/* Safety Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300 font-bold text-sm mb-1">
                                <ShieldCheck size={18} /> Paiement Sécurisé
                            </div>
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                                Pour votre sécurité, ne payez jamais en espèces. Utilisez le paiement in-app pour bénéficier de la protection acheteur.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Vendeur</span>
                                <div className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 truncate">
                                    <User size={20} className="text-purple-500" /> {selectedItem.sellerName}
                                </div>
                                <div className="flex items-center gap-1 mt-1 cursor-pointer">
                                    <Star size={12} className="fill-yellow-400 text-yellow-400"/>
                                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{ratingData.average.toFixed(1)}</span>
                                    <span className="text-[10px] text-gray-400">({ratingData.count} avis)</span>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                <span className="text-xs text-gray-400 uppercase font-bold block mb-1">Poids</span>
                                <div className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Scale size={20} className="text-blue-500" /> {selectedItem.weight} kg
                                </div>
                            </div>
                        </div>

                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                                {selectedItem.description}
                            </p>
                        </div>

                        <div className="mt-auto grid grid-cols-2 gap-4">
                            <button 
                                onClick={(e) => handleContactClick(e, selectedItem)}
                                className="py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700"
                            >
                                <MessageCircle size={20} /> Contacter
                            </button>
                            {selectedItem.status !== 'sold' ? (
                                <button 
                                    onClick={() => { setPaymentStep('details'); setShowPaymentModal(true); }}
                                    className="py-3.5 bg-[#2962FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <ShieldCheck size={20} /> Acheter Maintenant
                                </button>
                            ) : (
                                <button disabled className="py-3.5 bg-gray-300 text-gray-500 font-bold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                                    Vendu
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 px-4 py-3 shadow-sm flex items-center justify-between sticky top-0 z-30 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            Marketplace <span className="bg-[#2962FF] text-white text-[10px] px-2 py-0.5 rounded-full">BETA</span>
                        </h2>
                    </div>
                </div>
                {view === 'browse' && (
                    <button 
                        onClick={() => setView('sell')}
                        className="bg-[#00C853] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-200 dark:shadow-none hover:-translate-y-0.5"
                    >
                        <Camera size={18} /> <span className="hidden md:inline">Vendre un déchet</span>
                    </button>
                )}
            </div>

            {/* --- BROWSE VIEW --- */}
            {view === 'browse' && (
                <div className="flex-1 overflow-y-auto">
                    {/* Search & Filters Header */}
                    <div className="bg-white dark:bg-gray-800 px-4 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-20">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                <input 
                                    type="text" 
                                    placeholder="Rechercher des matériaux, appareils..." 
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-[#2962FF] transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                    <SlidersHorizontal size={20} />
                                </button>
                                <select 
                                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-800 dark:text-white font-medium outline-none cursor-pointer appearance-none min-w-[140px]"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                >
                                    <option value="date">Plus récent</option>
                                    <option value="price_asc">Prix croissant</option>
                                    <option value="price_desc">Prix décroissant</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setFilterCategory(cat.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                                        filterCategory === cat.id 
                                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md transform scale-105' 
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    <span>{cat.icon}</span> {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Listings Grid */}
                    <div className="p-4 pb-24">
                        {filteredItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                                <Search size={48} className="mb-4 text-gray-300" />
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Aucun résultat</h3>
                                <p className="text-sm text-gray-500">Essayez de changer vos filtres ou termes de recherche.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredItems.map(item => (
                                    <ItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- SELL VIEW --- */}
            {view === 'sell' && (
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-4xl mx-auto p-4 md:p-8">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100 dark:border-gray-700">
                            
                            {/* Left: Image Upload & Preview */}
                            <div className="w-full md:w-5/12 bg-gray-100 dark:bg-gray-900/50 p-6 md:p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-700 relative">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    accept="image/*" 
                                    className="hidden" 
                                    onChange={handleImageUpload}
                                />
                                
                                {!capturedImage ? (
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square w-full rounded-3xl border-4 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#2962FF] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer flex flex-col items-center justify-center group"
                                    >
                                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Camera size={32} className="text-[#2962FF]" />
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-700 dark:text-gray-200">Ajouter une photo</h3>
                                        <p className="text-sm text-gray-500 text-center max-w-[200px] mt-2">
                                            Prenez une photo claire de l'objet. Notre IA s'occupe du reste.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="relative aspect-square w-full rounded-3xl overflow-hidden shadow-lg group">
                                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                                        
                                        {/* AI Scanning Overlay */}
                                        {isAnalyzing && (
                                            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                                                <div className="relative mb-6">
                                                    <div className="w-16 h-16 border-4 border-t-[#00C853] border-white/20 rounded-full animate-spin"></div>
                                                    <Sparkles size={24} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#00C853]" />
                                                </div>
                                                <h3 className="text-xl font-bold animate-pulse">
                                                    {analysisStep === 1 && "Analyse des pixels..."}
                                                    {analysisStep === 2 && "Identification de l'objet..."}
                                                    {analysisStep === 3 && "Estimation du prix..."}
                                                </h3>
                                                <p className="text-sm text-white/70 mt-2">Biso Peto AI travaille pour vous</p>
                                            </div>
                                        )}

                                        <button 
                                            onClick={() => { setCapturedImage(null); setSellForm({}); }}
                                            className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all z-10"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Right: Smart Form */}
                            <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Détails de l'annonce</h2>
                                    {sellForm.title && !isAnalyzing && (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-fade-in">
                                            <Sparkles size={12} /> Pré-rempli par IA
                                        </span>
                                    )}
                                </div>

                                <form onSubmit={handlePublish} className="space-y-5 flex-1">
                                    
                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Titre</label>
                                        <input 
                                            type="text" 
                                            required
                                            placeholder="Ex: Vieux téléphone Samsung..."
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-[#2962FF] outline-none transition-all font-medium"
                                            value={sellForm.title}
                                            onChange={e => setSellForm({...sellForm, title: e.target.value})}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Catégorie</label>
                                            <div className="relative">
                                                <select 
                                                    className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-[#2962FF] outline-none appearance-none font-medium"
                                                    value={sellForm.category}
                                                    onChange={e => setSellForm({...sellForm, category: e.target.value as any})}
                                                >
                                                    <option value="electronics">Électronique</option>
                                                    <option value="metal">Métaux</option>
                                                    <option value="plastic">Plastique</option>
                                                    <option value="other">Autre</option>
                                                </select>
                                                <ChevronDown size={18} className="absolute right-4 top-4 text-gray-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Poids (Kg)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    className="w-full p-4 pl-10 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-[#2962FF] outline-none font-medium"
                                                    value={sellForm.weight}
                                                    onChange={e => setSellForm({...sellForm, weight: parseFloat(e.target.value)})}
                                                />
                                                <Scale size={18} className="absolute left-3 top-4 text-gray-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Prix de vente</label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                required
                                                className="w-full p-4 pl-12 rounded-xl bg-green-50/50 dark:bg-green-900/10 text-green-700 dark:text-green-400 border-2 border-green-100 dark:border-green-900 focus:border-[#00C853] outline-none font-black text-xl"
                                                value={sellForm.price}
                                                onChange={e => setSellForm({...sellForm, price: parseFloat(e.target.value)})}
                                            />
                                            <div className="absolute left-4 top-4.5 font-bold text-green-600">FC</div>
                                            
                                            {/* AI Confidence Badge */}
                                            {!isAnalyzing && sellForm.price && sellForm.price > 0 && (
                                                <div className="absolute right-4 top-3 bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-600 px-2 py-1 rounded-lg flex items-center gap-1">
                                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                    <span className="text-[10px] font-bold text-gray-500">Confiance IA: 92%</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 block">Description / État</label>
                                        <textarea 
                                            rows={3}
                                            className="w-full p-4 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-[#2962FF] outline-none resize-none font-medium text-sm"
                                            placeholder="Décrivez l'état (neuf, usagé, pour pièces...)"
                                            value={sellForm.description}
                                            onChange={e => setSellForm({...sellForm, description: e.target.value})}
                                        ></textarea>
                                    </div>

                                    <div className="pt-4 flex gap-4 mt-auto">
                                        <button 
                                            type="button"
                                            onClick={() => setView('browse')}
                                            className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit"
                                            className="flex-1 py-4 bg-[#2962FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2 hover:-translate-y-1"
                                        >
                                            <Upload size={20} /> Publier maintenant
                                        </button>
                                    </div>

                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal Detail Item */}
            <ItemDetailModal />
            
            {/* Payment Modal */}
            <SecurePaymentModal />

            {/* Contact Options Modal */}
            <ContactOptionModal />
        </div>
    );
};