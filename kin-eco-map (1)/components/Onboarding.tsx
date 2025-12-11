
import React, { useState } from 'react';
import { ChevronRight, ArrowLeft, Home, Building, Truck, Check, CreditCard, MapPin, LogIn, User as UserIcon, Shield, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { UserType, User } from '../types';
import { LegalDocs } from './LegalDocs';

interface OnboardingProps {
    onComplete: (user: Partial<User>) => void;
    appLogo?: string;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, appLogo = './logo.png' }) => {
    const [step, setStep] = useState(1);
    const [showLogin, setShowLogin] = useState(false);
    
    // Legal Docs State
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [legalModalType, setLegalModalType] = useState<'terms' | 'privacy' | null>(null);

    // Login State
    const [loginRole, setLoginRole] = useState<UserType.CITIZEN | UserType.COLLECTOR | UserType.ADMIN>(UserType.CITIZEN);
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Registration State
    const [formData, setFormData] = useState<Partial<User>>({
        firstName: '',
        lastName: '',
        phone: '',
        type: UserType.CITIZEN,
        address: '',
        subscription: 'plus',
        // Default empty fields
        companyName: '',
        companyPhone: '',
        sector: '',
        vehicleType: '',
        housingType: 'Maison'
    });

    const handleNext = () => setStep(prev => prev + 1);
    const handleBack = () => setStep(prev => prev - 1);

    const handleLoginSubmit = () => {
        if (!loginIdentifier || !loginPassword) return; // Validation basique

        setIsLoggingIn(true);
        
        // Simulation d'appel API
        setTimeout(() => {
            let userData: Partial<User> = {};

            switch (loginRole) {
                case UserType.CITIZEN:
                    userData = {
                        firstName: 'Christian',
                        lastName: 'Mapele',
                        phone: loginIdentifier,
                        type: UserType.CITIZEN,
                        address: 'Gombe, Kinshasa',
                        subscription: 'plus',
                        points: 450,
                        collections: 15
                    };
                    break;
                case UserType.COLLECTOR:
                    userData = {
                        firstName: 'Jean',
                        lastName: 'Collecteur',
                        phone: loginIdentifier,
                        type: UserType.COLLECTOR,
                        address: 'Limete Industriel',
                        vehicleType: 'Camion Benne',
                        zone: 'Limete',
                        subscription: 'standard', // Non pertinent pour collecteur mais requis par type
                        points: 1200,
                        collections: 342
                    };
                    break;
                case UserType.ADMIN:
                    userData = {
                        firstName: 'Admin',
                        lastName: 'Principal',
                        phone: loginIdentifier,
                        type: UserType.ADMIN,
                        address: 'Hôtel de Ville',
                        subscription: 'premium',
                        points: 9999,
                        collections: 0
                    };
                    break;
            }

            onComplete(userData);
            setIsLoggingIn(false);
        }, 1500);
    };

    const updateData = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    // --- Render Functions ---

    const renderWelcome = () => (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gradient-to-br from-[#00C853] to-[#2962FF] text-white animate-fade-in md:rounded-3xl">
            {/* Logo */}
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-8 shadow-xl overflow-hidden p-3">
                 <img src={appLogo} alt="KIN ECO-MAP Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">KIN ECO-MAP</h1>
            <p className="text-lg opacity-90 mb-12 font-light">Votre ville plus propre,<br/>votre avenir plus vert.</p>
            
            <div className="w-full space-y-4">
                <button onClick={handleNext} className="w-full bg-white text-[#00C853] font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                    Commencer
                    <ChevronRight size={20} />
                </button>
                
                <button onClick={() => setShowLogin(true)} className="w-full bg-white/20 backdrop-blur-sm border border-white/40 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                    Se connecter
                    <LogIn size={20} />
                </button>
            </div>
        </div>
    );

    const renderLogin = () => (
        <div className="flex flex-col h-full bg-white dark:bg-gray-900 animate-fade-in">
            {/* Header Login */}
            <div className="p-6 pb-0">
                <button onClick={() => setShowLogin(false)} className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors mb-4">
                    <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300" />
                </button>
                
                <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center p-1">
                        <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Bienvenue</h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Connectez-vous à votre espace.</p>
            </div>

            {/* Role Tabs */}
            <div className="px-6 py-6">
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
                    <button 
                        onClick={() => setLoginRole(UserType.CITIZEN)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginRole === UserType.CITIZEN ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Utilisateur
                    </button>
                    <button 
                        onClick={() => setLoginRole(UserType.COLLECTOR)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginRole === UserType.COLLECTOR ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Collecteur
                    </button>
                    <button 
                        onClick={() => setLoginRole(UserType.ADMIN)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${loginRole === UserType.ADMIN ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Admin
                    </button>
                </div>
            </div>

            {/* Form */}
            <div className="px-6 flex-1 space-y-5">
                {/* Role Icon Display */}
                <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-colors ${
                        loginRole === UserType.CITIZEN ? 'bg-[#00C853]' : 
                        loginRole === UserType.COLLECTOR ? 'bg-[#2962FF]' : 'bg-gray-800'
                    }`}>
                        {loginRole === UserType.CITIZEN && <UserIcon size={32} />}
                        {loginRole === UserType.COLLECTOR && <Truck size={32} />}
                        {loginRole === UserType.ADMIN && <Shield size={32} />}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {loginRole === UserType.ADMIN ? 'Identifiant Admin' : 'Téléphone ou Email'}
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-3.5 text-gray-400">
                            {loginRole === UserType.ADMIN ? <Shield size={20} /> : <Phone size={20} />}
                        </div>
                        <input 
                            type="text"
                            value={loginIdentifier}
                            onChange={(e) => setLoginIdentifier(e.target.value)}
                            placeholder={loginRole === UserType.ADMIN ? "admin@kin-eco.cd" : "+243..."}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mot de passe</label>
                    <div className="relative">
                        <div className="absolute left-4 top-3.5 text-gray-400">
                            <Lock size={20} />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-12 pr-12 py-3.5 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="flex justify-end mt-2">
                        <button className="text-sm text-[#00C853] font-semibold hover:underline">Mot de passe oublié ?</button>
                    </div>
                </div>

                <button 
                    onClick={handleLoginSubmit}
                    disabled={isLoggingIn || !loginIdentifier || !loginPassword}
                    className="w-full bg-[#00C853] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl mt-4 shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                >
                    {isLoggingIn ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Connexion...
                        </>
                    ) : (
                        <>
                            Se connecter
                            <ChevronRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    const renderUserInfo = () => (
        <div className="p-6 pt-12 animate-fade-in bg-white dark:bg-gray-900 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Créer un compte</h2>
            <div className="space-y-4 flex-1">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                    <input 
                        type="text" 
                        className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors"
                        placeholder="Jean"
                        value={formData.firstName}
                        onChange={e => updateData('firstName', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                    <input 
                        type="text" 
                        className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors"
                        placeholder="Kabasele"
                        value={formData.lastName}
                        onChange={e => updateData('lastName', e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                    <input 
                        type="tel" 
                        className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors"
                        placeholder="+243..."
                        value={formData.phone}
                        onChange={e => updateData('phone', e.target.value)}
                    />
                </div>
            </div>
            <button onClick={handleNext} className="w-full bg-[#00C853] text-white font-bold py-4 rounded-xl mt-8 shadow-lg hover:bg-green-600 transition-colors">
                Continuer
            </button>
        </div>
    );

    const renderRoleSelection = () => (
        <div className="p-6 pt-12 animate-fade-in bg-white dark:bg-gray-900 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Qui êtes-vous?</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Sélectionnez votre profil pour continuer.</p>
            
            <div className="space-y-4 flex-1">
                {[
                    { type: UserType.CITIZEN, icon: Home, label: 'Ménage / Citoyen', desc: 'Gérez vos collectes domestiques' },
                    { type: UserType.BUSINESS, icon: Building, label: 'Entreprise', desc: 'Gestion déchets commerciaux & certificats' },
                    // L'option Collecteur a été retirée pour empêcher l'inscription autonome
                ].map((role) => (
                    <div 
                        key={role.type}
                        onClick={() => updateData('type', role.type)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${formData.type === role.type ? 'border-[#00C853] bg-green-50 dark:bg-green-900/20 shadow-md transform scale-[1.02]' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                    >
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${formData.type === role.type ? 'bg-[#00C853] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}`}>
                            <role.icon size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-gray-800 dark:text-white">{role.label}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{role.desc}</div>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={handleNext} className="w-full bg-[#00C853] text-white font-bold py-4 rounded-xl mt-8 shadow-lg">
                Suivant
            </button>
        </div>
    );

    // --- Specific Form Rendering Logic ---
    const renderSpecificDetails = () => {
        const type = formData.type;
        // Since we only allow CITIZEN or BUSINESS in registration flow, this is always true
        const isPayingUser = type === UserType.CITIZEN || type === UserType.BUSINESS;

        return (
            <div className="p-6 pt-12 animate-fade-in bg-white dark:bg-gray-900 h-full flex flex-col">
                <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
                    {type === UserType.CITIZEN && "Adresse du Ménage"}
                    {type === UserType.BUSINESS && "Info Entreprise"}
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Complétez votre profil.</p>

                <div className="space-y-4 flex-1">
                    {/* Common Address Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Adresse complète
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                className="w-full p-4 pr-10 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors"
                                placeholder="Avenue, Numéro, Commune"
                                value={formData.address}
                                onChange={e => updateData('address', e.target.value)}
                            />
                            <MapPin size={20} className="absolute right-3 top-4 text-gray-400" />
                        </div>
                        <button 
                            className="text-[#2962FF] text-xs font-semibold flex items-center gap-1 hover:underline mt-2 ml-1"
                            onClick={() => updateData('address', 'Position actuelle: -4.4419, 15.2663')}
                        >
                           📍 Utiliser ma position actuelle
                        </button>
                    </div>

                    {/* CITIZEN SPECIFIC */}
                    {type === UserType.CITIZEN && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type de logement</label>
                            <select 
                                className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none"
                                onChange={e => updateData('housingType', e.target.value)}
                                value={formData.housingType}
                            >
                                <option>Maison individuelle</option>
                                <option>Appartement</option>
                                <option>Villa</option>
                                <option>Studio</option>
                            </select>
                        </div>
                    )}

                    {/* BUSINESS SPECIFIC */}
                    {type === UserType.BUSINESS && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'entreprise</label>
                                <input 
                                    type="text" 
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none"
                                    placeholder="Ex: Kinshasa Food SARL"
                                    onChange={e => updateData('companyName', e.target.value)}
                                    value={formData.companyName}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone Entreprise</label>
                                <input 
                                    type="tel" 
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none transition-colors"
                                    placeholder="+243..."
                                    value={formData.companyPhone}
                                    onChange={e => updateData('companyPhone', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secteur d'activité</label>
                                <select 
                                    className="w-full p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:border-[#00C853] outline-none"
                                    onChange={e => updateData('sector', e.target.value)}
                                >
                                    <option value="">Choisir...</option>
                                    <option>Restauration</option>
                                    <option>Industrie</option>
                                    <option>Commerce de détail</option>
                                    <option>Bureaux</option>
                                </select>
                            </div>
                        </>
                    )}
                </div>

                {isPayingUser ? (
                    <button onClick={handleNext} className="w-full bg-[#00C853] text-white font-bold py-4 rounded-xl mt-8 shadow-lg">
                        Continuer vers l'abonnement
                    </button>
                ) : (
                    // This branch is now unreachable for self-registration but kept for code safety
                    <button onClick={() => onComplete(formData)} className="w-full bg-[#2962FF] text-white font-bold py-4 rounded-xl mt-8 shadow-lg hover:bg-blue-600 transition-colors">
                        Créer mon compte professionnel
                    </button>
                )}
            </div>
        );
    };

    const renderSubscription = () => (
        <div className="p-6 pt-12 animate-fade-in bg-white dark:bg-gray-900 h-full flex flex-col">
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Abonnement</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Choisissez votre plan adapté à votre profil.</p>
            
            <div className="space-y-4 flex-1 overflow-y-auto">
                {[
                    { id: 'standard', name: 'Standard', price: '15,000 FC', features: ['2 collectes / semaine', 'Suivi basique'] },
                    { id: 'plus', name: 'Plus', price: '25,000 FC', features: ['3 collectes / semaine', 'Points doublés', 'Formation incluse'], popular: true },
                    { id: 'premium', name: 'Premium', price: '35,000 FC', features: ['Quotidien', 'Certificat Eco', 'Support prioritaire'] },
                ].map((plan) => (
                    <div 
                        key={plan.id}
                        onClick={() => updateData('subscription', plan.id)}
                        className={`p-5 rounded-xl border-2 cursor-pointer transition-all relative ${formData.subscription === plan.id ? 'border-[#00C853] bg-green-50 dark:bg-green-900/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}
                    >
                        {plan.popular && <div className="absolute top-0 right-0 bg-[#00C853] text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">Populaire</div>}
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-lg text-gray-800 dark:text-white">{plan.name}</span>
                            <span className="text-[#00C853] font-bold text-xl">{plan.price}</span>
                        </div>
                        <ul className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center gap-2">
                                    <Check size={14} className="text-[#00C853]" /> {f}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="mt-6 mb-4">
                <div className="flex items-start gap-3">
                    <div className="relative flex items-center">
                         <input 
                            type="checkbox" 
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-300 text-[#00C853] focus:ring-[#00C853]"
                         />
                    </div>
                    <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
                        Je confirme avoir lu et accepté les <span onClick={(e) => { e.preventDefault(); setLegalModalType('terms'); }} className="text-[#2962FF] font-bold cursor-pointer hover:underline">Conditions d'Utilisation</span> et la <span onClick={(e) => { e.preventDefault(); setLegalModalType('privacy'); }} className="text-[#2962FF] font-bold cursor-pointer hover:underline">Politique de Confidentialité</span> de KIN ECO-MAP.
                    </label>
                </div>
            </div>

            <button 
                onClick={() => onComplete(formData)} 
                disabled={!acceptedTerms}
                className={`w-full font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${
                    acceptedTerms 
                    ? 'bg-[#00C853] text-white hover:bg-green-600' 
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
            >
                <CreditCard size={20} />
                Payer et Activer
            </button>
        </div>
    );

    if (showLogin) {
        return (
             <div className="h-screen bg-white dark:bg-gray-900 flex flex-col md:items-center md:justify-center md:bg-gray-50 md:dark:bg-gray-900 transition-colors duration-300">
                <div className="w-full h-full md:max-w-md md:h-[90vh] md:max-h-[850px] md:shadow-2xl md:rounded-3xl overflow-hidden relative flex flex-col bg-white dark:bg-gray-900">
                    {renderLogin()}
                </div>
             </div>
        );
    }

    return (
        <div className="h-screen bg-white dark:bg-gray-900 flex flex-col md:items-center md:justify-center md:bg-gray-50 md:dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full h-full md:max-w-md md:h-[90vh] md:max-h-[850px] md:shadow-2xl md:rounded-3xl overflow-hidden relative flex flex-col bg-white dark:bg-gray-900">
                {step > 1 && (
                    <div className="p-4 flex items-center shrink-0">
                        <button onClick={handleBack} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div className="ml-4 flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00C853] transition-all duration-300 ease-out" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
                        </div>
                        <span className="ml-3 text-xs font-bold text-gray-400">{step}/5</span>
                    </div>
                )}
                
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    {step === 1 && renderWelcome()}
                    {step === 2 && renderUserInfo()}
                    {step === 3 && renderRoleSelection()}
                    {step === 4 && renderSpecificDetails()}
                    {step === 5 && renderSubscription()}
                </div>
            </div>

            {/* Legal Docs Modal */}
            <LegalDocs 
                isOpen={!!legalModalType} 
                type={legalModalType} 
                onClose={() => setLegalModalType(null)} 
            />
        </div>
    );
}
