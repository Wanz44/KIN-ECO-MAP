
import React, { useState } from 'react';
import { ArrowLeft, Bell, Globe, Lock, Moon, Sun, Shield, HelpCircle, ChevronRight, LogOut, Smartphone, Mail, Save, X, Eye, EyeOff, Check, ChevronDown, ChevronUp, MessageCircle, Phone, FileText } from 'lucide-react';
import { Theme, User, Language } from '../types';

interface SettingsProps {
    user: User;
    theme: Theme;
    onToggleTheme: () => void;
    onBack: () => void;
    onLogout: () => void;
    currentLanguage: Language;
    onLanguageChange: (lang: Language) => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, theme, onToggleTheme, onBack, onLogout, currentLanguage, onLanguageChange, onToast }) => {
    const [notifications, setNotifications] = useState({
        push: true,
        email: true,
        sms: false
    });
    const [privacySettings, setPrivacySettings] = useState({
        publicProfile: false,
        shareUsageData: true,
        locationHistory: true
    });
    
    // Sub-view State
    const [activeSubView, setActiveSubView] = useState<'password' | 'privacy' | 'faq' | 'contact' | null>(null);

    // Helper text based on language
    const t = {
        title: currentLanguage === 'fr' ? 'Paramètres' : 'Settings',
        general: currentLanguage === 'fr' ? 'Général' : 'General',
        language: currentLanguage === 'fr' ? 'Langue' : 'Language',
        theme: currentLanguage === 'fr' ? 'Thème' : 'Theme',
        darkMode: currentLanguage === 'fr' ? 'Sombre' : 'Dark',
        lightMode: currentLanguage === 'fr' ? 'Clair' : 'Light',
        notifications: currentLanguage === 'fr' ? 'Notifications' : 'Notifications',
        security: currentLanguage === 'fr' ? 'Sécurité' : 'Security',
        changePass: currentLanguage === 'fr' ? 'Changer mot de passe' : 'Change Password',
        privacy: currentLanguage === 'fr' ? 'Confidentialité' : 'Privacy',
        support: currentLanguage === 'fr' ? 'Support' : 'Support',
        help: currentLanguage === 'fr' ? 'Aide & FAQ' : 'Help & FAQ',
        contact: currentLanguage === 'fr' ? 'Nous contacter' : 'Contact Us',
        logout: currentLanguage === 'fr' ? 'Déconnexion' : 'Logout',
        saved: currentLanguage === 'fr' ? 'Modifications enregistrées' : 'Changes saved',
    };

    const handleSave = () => {
        if (onToast) onToast(t.saved, "success");
    };

    const toggleNotification = (key: keyof typeof notifications) => {
        setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
        handleSave();
    };

    const togglePrivacy = (key: keyof typeof privacySettings) => {
        setPrivacySettings(prev => ({ ...prev, [key]: !prev[key] }));
        handleSave();
    };

    // --- Sub-Components ---

    const ChangePasswordView = () => {
        const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
        const [showPass, setShowPass] = useState(false);
        const [isLoading, setIsLoading] = useState(false);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();
            if (passData.new !== passData.confirm) {
                if (onToast) onToast("Les nouveaux mots de passe ne correspondent pas.", "error");
                return;
            }
            setIsLoading(true);
            setTimeout(() => {
                setIsLoading(false);
                if (onToast) onToast("Mot de passe mis à jour avec succès", "success");
                setActiveSubView(null);
            }, 1500);
        };

        return (
            <div className="flex flex-col h-full animate-fade-in bg-[#F5F7FA] dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                    <button onClick={() => setActiveSubView(null)} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.changePass}</h2>
                </div>
                <div className="p-5">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 mb-6">
                            <p className="text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                                <Shield size={18} className="shrink-0" />
                                Utilisez un mot de passe fort avec au moins 8 caractères, des chiffres et des symboles.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mot de passe actuel</label>
                            <div className="relative">
                                <input 
                                    type={showPass ? "text" : "password"}
                                    required
                                    className="w-full p-3 pr-10 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#00C853]"
                                    value={passData.current}
                                    onChange={e => setPassData({...passData, current: e.target.value})}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3.5 text-gray-400">
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nouveau mot de passe</label>
                            <input 
                                type={showPass ? "text" : "password"}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#00C853]"
                                value={passData.new}
                                onChange={e => setPassData({...passData, new: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmer nouveau mot de passe</label>
                            <input 
                                type={showPass ? "text" : "password"}
                                required
                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#00C853]"
                                value={passData.confirm}
                                onChange={e => setPassData({...passData, confirm: e.target.value})}
                            />
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-[#00C853] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2"
                        >
                            {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const PrivacyView = () => (
        <div className="flex flex-col h-full animate-fade-in bg-[#F5F7FA] dark:bg-gray-900">
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <button onClick={() => setActiveSubView(null)} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.privacy}</h2>
            </div>
            <div className="p-5 space-y-4">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <SettingItem 
                        icon={Globe} 
                        label="Profil Public" 
                        toggle={privacySettings.publicProfile} 
                        onClick={() => togglePrivacy('publicProfile')}
                        value={privacySettings.publicProfile ? "Visible" : "Privé"}
                    />
                    <div className="px-4 pb-3 text-xs text-gray-400">
                        Si activé, votre score éco et vos badges seront visibles par les autres utilisateurs du quartier.
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <SettingItem 
                        icon={Smartphone} 
                        label="Partage Données Usage" 
                        toggle={privacySettings.shareUsageData} 
                        onClick={() => togglePrivacy('shareUsageData')}
                    />
                    <SettingItem 
                        icon={Globe} 
                        label="Historique Localisation" 
                        toggle={privacySettings.locationHistory} 
                        onClick={() => togglePrivacy('locationHistory')}
                    />
                </div>

                <div className="mt-6">
                    <h3 className="text-sm font-bold text-gray-500 mb-3 px-1 uppercase">Documents Légaux</h3>
                    <button className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-center gap-3">
                            <FileText size={20} className="text-gray-400" />
                            <span className="text-gray-800 dark:text-white font-medium">Politique de Confidentialité</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                    </button>
                    <button className="w-full mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                        <div className="flex items-center gap-3">
                            <Shield size={20} className="text-gray-400" />
                            <span className="text-gray-800 dark:text-white font-medium">Conditions d'Utilisation</span>
                        </div>
                        <ChevronRight size={18} className="text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );

    const FAQView = () => {
        const [openIndex, setOpenIndex] = useState<number | null>(null);
        
        const faqs = [
            { q: "Comment payer mon abonnement ?", a: "Vous pouvez payer via Mobile Money (M-Pesa, Orange, Airtel, Africell) ou par carte Visa directement dans l'onglet 'Abonnement' de votre profil." },
            { q: "Le camion n'est pas passé, que faire ?", a: "Vérifiez d'abord votre jour de collecte dans le planning. Si le retard dépasse 2h, utilisez le bouton 'Signaler' sur le tableau de bord ou contactez-nous." },
            { q: "Quels déchets sont recyclables ?", a: "Les bouteilles plastiques, le verre, le papier/carton et les métaux. Veuillez les séparer des déchets organiques (restes de nourriture)." },
            { q: "Comment gagner des points ?", a: "Vous gagnez des points à chaque collecte validée, en parrainant des voisins, ou en complétant les cours de l'Academy." },
            { q: "Puis-je changer de plan ?", a: "Oui, à tout moment via l'onglet Abonnement. Le changement prendra effet au prochain cycle de facturation." }
        ];

        return (
            <div className="flex flex-col h-full animate-fade-in bg-[#F5F7FA] dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                    <button onClick={() => setActiveSubView(null)} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.help}</h2>
                </div>
                <div className="p-5 overflow-y-auto">
                    <div className="space-y-3">
                        {faqs.map((faq, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <button 
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full p-4 flex justify-between items-center text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                                >
                                    <span className="font-bold text-gray-800 dark:text-white text-sm pr-4">{faq.q}</span>
                                    {openIndex === index ? <ChevronUp size={18} className="text-blue-500" /> : <ChevronDown size={18} className="text-gray-400" />}
                                </button>
                                {openIndex === index && (
                                    <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-300 bg-gray-50/50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
                                        {faq.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const ContactView = () => {
        const [contactForm, setContactForm] = useState({ subject: '', message: '' });
        const [isSending, setIsSending] = useState(false);

        const handleSend = (e: React.FormEvent) => {
            e.preventDefault();
            setIsSending(true);
            // Simuler envoi
            setTimeout(() => {
                setIsSending(false);
                setContactForm({ subject: '', message: '' });
                if (onToast) onToast("Message envoyé avec succès !", "success");
                setActiveSubView(null);
            }, 1500);
        };

        return (
            <div className="flex flex-col h-full animate-fade-in bg-[#F5F7FA] dark:bg-gray-900">
                <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                    <button onClick={() => setActiveSubView(null)} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.contact}</h2>
                </div>
                <div className="p-5 overflow-y-auto">
                    
                    {/* Direct Contact Buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button onClick={() => window.open('tel:+243810000000')} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:border-green-500 hover:text-green-600 transition-all shadow-sm">
                            <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-full flex items-center justify-center">
                                <Phone size={20} />
                            </div>
                            <span className="font-bold text-sm">Appeler</span>
                        </button>
                        <button onClick={() => window.open('https://wa.me/243810000000')} className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center gap-2 hover:border-[#2962FF] hover:text-[#2962FF] transition-all shadow-sm">
                             <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-[#2962FF] rounded-full flex items-center justify-center">
                                <MessageCircle size={20} />
                            </div>
                            <span className="font-bold text-sm">WhatsApp</span>
                        </button>
                    </div>

                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">Envoyer un message</h3>
                    <form onSubmit={handleSend} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Sujet (ex: Problème facture)" 
                            required
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                            value={contactForm.subject}
                            onChange={e => setContactForm({...contactForm, subject: e.target.value})}
                        />
                        <textarea 
                            placeholder="Votre message détaillé..." 
                            required
                            rows={6}
                            className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF] resize-none"
                            value={contactForm.message}
                            onChange={e => setContactForm({...contactForm, message: e.target.value})}
                        ></textarea>
                        
                        <button 
                            type="submit"
                            disabled={isSending}
                            className="w-full py-4 bg-[#2962FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {isSending ? 'Envoi en cours...' : 'Envoyer le ticket'}
                        </button>
                    </form>
                </div>
            </div>
        );
    };

    const SectionHeader = ({ title }: { title: string }) => (
        <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1 mt-6">
            {title}
        </h3>
    );

    const SettingItem = ({ 
        icon: Icon, 
        label, 
        value, 
        onClick, 
        toggle,
        danger = false 
    }: { 
        icon: any, 
        label: string, 
        value?: string | React.ReactNode, 
        onClick?: () => void,
        toggle?: boolean,
        danger?: boolean
    }) => (
        <div 
            onClick={!toggle ? onClick : undefined}
            className={`flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-50 dark:border-gray-700 last:border-none first:rounded-t-2xl last:rounded-b-2xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${danger ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${danger ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                    <Icon size={18} />
                </div>
                <span className="font-medium">{label}</span>
            </div>
            
            <div className="flex items-center gap-2">
                {value && <span className="text-sm text-gray-500 dark:text-gray-400">{value}</span>}
                
                {toggle !== undefined ? (
                    <div 
                        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                        className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 ${toggle ? 'bg-[#00C853]' : 'bg-gray-300 dark:bg-gray-600'}`}
                    >
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${toggle ? 'translate-x-5' : 'translate-x-0'}`}></div>
                    </div>
                ) : (
                    !danger && <ChevronRight size={18} className="text-gray-400" />
                )}
            </div>
        </div>
    );

    // --- MAIN RENDER ROUTER ---
    
    if (activeSubView === 'password') return <ChangePasswordView />;
    if (activeSubView === 'privacy') return <PrivacyView />;
    if (activeSubView === 'faq') return <FAQView />;
    if (activeSubView === 'contact') return <ContactView />;

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300 relative">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.title}</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-20">
                
                <SectionHeader title={t.general} />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <SettingItem 
                        icon={Globe} 
                        label={t.language} 
                        value={currentLanguage === 'fr' ? 'Français' : 'English'} 
                        onClick={() => {
                            onLanguageChange(currentLanguage === 'fr' ? 'en' : 'fr');
                            handleSave();
                        }}
                    />
                    <SettingItem 
                        icon={theme === 'dark' ? Moon : Sun} 
                        label={t.theme} 
                        value={theme === 'dark' ? t.darkMode : t.lightMode} 
                        onClick={onToggleTheme}
                        toggle={theme === 'dark'}
                    />
                </div>

                <SectionHeader title={t.notifications} />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <SettingItem 
                        icon={Bell} 
                        label="Push Notifications" 
                        toggle={notifications.push} 
                        onClick={() => toggleNotification('push')}
                    />
                    <SettingItem 
                        icon={Mail} 
                        label="Email" 
                        toggle={notifications.email} 
                        onClick={() => toggleNotification('email')}
                    />
                    <SettingItem 
                        icon={Smartphone} 
                        label="SMS" 
                        toggle={notifications.sms} 
                        onClick={() => toggleNotification('sms')}
                    />
                </div>

                <SectionHeader title={t.security} />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <SettingItem 
                        icon={Lock} 
                        label={t.changePass} 
                        onClick={() => setActiveSubView('password')}
                    />
                    <SettingItem 
                        icon={Shield} 
                        label={t.privacy} 
                        onClick={() => setActiveSubView('privacy')}
                    />
                </div>

                <SectionHeader title={t.support} />
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <SettingItem 
                        icon={HelpCircle} 
                        label={t.help} 
                        onClick={() => setActiveSubView('faq')}
                    />
                    <SettingItem 
                        icon={Mail} 
                        label={t.contact} 
                        value="support@kinecomap.cd"
                        onClick={() => setActiveSubView('contact')}
                    />
                </div>

                <div className="mt-8">
                     <button 
                        onClick={onLogout}
                        className="w-full bg-red-50 dark:bg-red-900/20 text-red-500 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                     >
                        <LogOut size={20} />
                        {t.logout}
                     </button>
                     <p className="text-center text-xs text-gray-400 mt-4">
                        Version 1.0.3 • Kin Eco-Map
                     </p>
                </div>
            </div>
        </div>
    );
};
