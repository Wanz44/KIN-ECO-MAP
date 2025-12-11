
import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { MapView } from './components/Map';
import { Academy } from './components/Academy';
import { Marketplace } from './components/Marketplace'; // Nouveau
import { Profile } from './components/Profile';
import { Layout } from './components/Layout';
import { Subscription } from './components/Subscription';
import { Planning } from './components/Planning';
import { Notifications } from './components/Notifications';
import { Settings } from './components/Settings';
import { AdminUsers } from './components/AdminUsers';
import { AdminAds } from './components/AdminAds';
import { AdminSubscriptions } from './components/AdminSubscriptions';
import { AdminVehicles } from './components/AdminVehicles';
import { AdminAcademy } from './components/AdminAcademy';
import { CollectorJobs } from './components/CollectorJobs';
import { SplashScreen } from './components/SplashScreen';
import { User, AppView, UserType, Theme, SubscriptionPlan, Language, NotificationItem } from './types';

// Plans initiaux par défaut
const DEFAULT_PLANS: SubscriptionPlan[] = [
    { 
        id: 'standard', 
        name: 'Standard', 
        priceUSD: 10, 
        schedule: 'Mardi & Samedi',
        features: ['2 jours / semaine', 'Mardi & Samedi', 'Suivi basique'] 
    },
    { 
        id: 'plus', 
        name: 'Plus', 
        priceUSD: 15, 
        popular: true,
        schedule: 'Mardi, Jeudi & Samedi',
        features: ['3 jours / semaine', 'Mar, Jeu, Sam', 'Points doublés'] 
    },
    { 
        id: 'premium', 
        name: 'Premium', 
        priceUSD: 20, 
        schedule: 'Lun, Mer, Ven & Dim',
        features: ['4 jours / semaine', 'Lun, Mer, Ven, Dim', 'Certificat Eco', 'Support VIP'] 
    },
    { 
        id: 'special', 
        name: 'Spécial / Kilo', 
        priceUSD: 0, 
        isVariable: true,
        schedule: 'Sur demande',
        features: ['Paiement à la pesée', 'Idéal gros volumes', 'Horaires flexibles'] 
    },
];

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
    { id: '1', title: 'Bienvenue', message: 'Bienvenue sur KIN ECO-MAP ! Complétez votre profil pour commencer.', type: 'info', time: 'À l\'instant', read: false, targetUserId: 'ALL' }
];

function App() {
    // State
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<AppView>(AppView.ONBOARDING);
    
    // User State with LocalStorage Persistence for Offline Support
    const [user, setUser] = useState<User | null>(() => {
        try {
            const savedUser = localStorage.getItem('kinecomap_user');
            return savedUser ? JSON.parse(savedUser) : null;
        } catch (e) {
            return null;
        }
    });

    const [theme, setTheme] = useState<Theme>('light');
    const [language, setLanguage] = useState<Language>('fr');
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Subscription Data State (Lifted Up)
    const [plans, setPlans] = useState<SubscriptionPlan[]>(DEFAULT_PLANS);
    const [exchangeRate, setExchangeRate] = useState(2800);

    // Global Branding State
    const [appLogo, setAppLogo] = useState('./logo.png');

    // Notifications Global State
    const [notifications, setNotifications] = useState<NotificationItem[]>(DEFAULT_NOTIFICATIONS);

    // --- TOAST STATE ---
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
        message: '',
        type: 'success',
        visible: false
    });

    // Initial View Logic based on persistent user
    useEffect(() => {
        if (user) {
            setView(AppView.DASHBOARD);
        }
    }, []); 

    // Persist User Changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('kinecomap_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('kinecomap_user');
        }
    }, [user]);

    // Simulate Splash Screen
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2500); 
        return () => clearTimeout(timer);
    }, []);

    // Theme Management
    useEffect(() => {
        const root = window.document.documentElement;
        const body = window.document.body;
        if (theme === 'dark') {
            root.classList.add('dark');
            body.classList.add('dark');
        } else {
            root.classList.remove('dark');
            body.classList.remove('dark');
        }
    }, [theme]);

    const handleThemeToggle = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
        handleShowToast(theme === 'light' ? 'Mode sombre activé' : 'Mode clair activé', 'info');
    };

    // Data Refresh Simulation
    const handleRefresh = () => {
        if (!navigator.onLine) return;
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            handleShowToast("Données mises à jour", "success");
        }, 1500);
    };

    // Notification Handler
    const handleSendNotification = (targetId: string | 'ADMIN' | 'ALL', title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') => {
        const newNotif: NotificationItem = {
            id: Date.now().toString(),
            title,
            message,
            type,
            time: 'À l\'instant',
            read: false,
            targetUserId: targetId
        };
        setNotifications(prev => [newNotif, ...prev]);
        
        // Toast feedback for admin/collector
        if (user?.type === UserType.ADMIN || user?.type === UserType.COLLECTOR) {
             if (type === 'success' || type === 'info') {
                 handleShowToast(title + ": " + message, 'success');
             }
        }
    };

    const handleMarkAllRead = () => {
        if (!user) return;
        setNotifications(prev => prev.map(n => 
            (n.targetUserId === user.id || n.targetUserId === 'ALL' || (user.type === UserType.ADMIN && n.targetUserId === 'ADMIN')) 
            ? { ...n, read: true } 
            : n
        ));
        handleShowToast("Toutes les notifications marquées comme lues", "info");
    };

    // --- TOAST HANDLER ---
    const handleShowToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        setToast({ message, type, visible: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    // Handlers
    const handleOnboardingComplete = (data: Partial<User>) => {
        const newUser: User = {
            id: 'u' + Date.now(),
            firstName: data.firstName || 'Utilisateur',
            lastName: data.lastName || '',
            phone: data.phone || '',
            type: data.type || UserType.CITIZEN,
            address: data.address || 'Kinshasa',
            points: 350,
            collections: 12,
            badges: 2,
            subscription: data.subscription || 'standard',
            companyName: data.companyName,
            companyPhone: data.companyPhone,
            sector: data.sector,
            vehicleType: data.vehicleType,
            housingType: data.housingType,
            zone: data.zone,
            permissions: data.type === UserType.ADMIN ? 
                ['manage_users', 'validate_docs', 'view_finance', 'manage_ads', 'export_data', 'system_settings', 'manage_fleet', 'manage_academy', 'manage_communications', 'manage_pos'] : 
                undefined
        };
        setUser(newUser);
        setView(AppView.DASHBOARD);
        handleShowToast(`Bienvenue, ${newUser.firstName} !`, 'success');
    };

    const handleLogout = () => {
        setUser(null);
        setView(AppView.ONBOARDING);
        localStorage.removeItem('kinecomap_user');
        handleShowToast("Déconnexion réussie", "info");
    };

    const handleUpdateUserPlan = (newPlan: 'standard' | 'plus' | 'premium' | 'special') => {
        if (user) {
            setUser({ ...user, subscription: newPlan });
            handleShowToast("Plan mis à jour avec succès", "success");
        }
    };

    // Admin Handlers
    const handleUpdatePlanConfig = (updatedPlan: SubscriptionPlan) => {
        setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
        handleShowToast("Configuration du plan enregistrée", "success");
    };

    const handleUpdateExchangeRate = (rate: number) => {
        setExchangeRate(rate);
        handleShowToast(`Nouveau taux : 1$ = ${rate} FC`, "success");
    };

    // Get Filtered Notifications
    const userNotifications = notifications.filter(n => {
        if (!user) return false;
        if (n.targetUserId === 'ALL') return true;
        if (n.targetUserId === 'ADMIN' && user.type === UserType.ADMIN) return true;
        return n.targetUserId === user.id;
    });

    const unreadCount = userNotifications.filter(n => !n.read).length;

    // View Router
    const renderContent = () => {
        if (!user) return null;

        const commonProps = { onToast: handleShowToast };

        switch (view) {
            case AppView.DASHBOARD:
                return <Dashboard user={user} onChangeView={setView} {...commonProps} />;
            case AppView.MAP:
                return <MapView user={user} onBack={() => setView(AppView.DASHBOARD)} />;
            case AppView.ACADEMY:
                return <Academy onBack={() => setView(AppView.DASHBOARD)} />;
            case AppView.MARKETPLACE: // Nouvelle Vue
                return <Marketplace user={user} onBack={() => setView(AppView.DASHBOARD)} {...commonProps} />;
            case AppView.PROFILE:
                return (
                    <Profile 
                        user={user} 
                        theme={theme}
                        onToggleTheme={handleThemeToggle}
                        onBack={() => setView(AppView.DASHBOARD)} 
                        onLogout={handleLogout}
                        onManageSubscription={() => setView(AppView.SUBSCRIPTION)}
                        onSettings={() => setView(AppView.SETTINGS)}
                        {...commonProps}
                    />
                );
            case AppView.SUBSCRIPTION:
                return (
                    <Subscription 
                        user={user} 
                        onBack={() => setView(AppView.PROFILE)} 
                        onUpdatePlan={handleUpdateUserPlan}
                        plans={plans}
                        exchangeRate={exchangeRate}
                        {...commonProps}
                    />
                );
            case AppView.PLANNING:
                return <Planning onBack={() => setView(AppView.DASHBOARD)} />;
            case AppView.NOTIFICATIONS:
                return (
                    <Notifications 
                        onBack={() => setView(AppView.DASHBOARD)} 
                        notifications={userNotifications}
                        onMarkAllRead={handleMarkAllRead}
                    />
                );
            case AppView.SETTINGS:
                return (
                    <Settings 
                        user={user}
                        theme={theme}
                        onToggleTheme={handleThemeToggle}
                        onBack={() => setView(AppView.PROFILE)}
                        onLogout={handleLogout}
                        currentLanguage={language}
                        onLanguageChange={setLanguage}
                        {...commonProps}
                    />
                );
            
            // --- ROUTES ADMIN / COLLECTOR ---
            case AppView.ADMIN_USERS:
                return <AdminUsers currentUser={user} onBack={() => setView(AppView.DASHBOARD)} onNotify={handleSendNotification} {...commonProps} />;
            case AppView.ADMIN_ADS:
                return <AdminAds onBack={() => setView(AppView.DASHBOARD)} {...commonProps} />;
            case AppView.ADMIN_SUBSCRIPTIONS:
                return (
                    <AdminSubscriptions 
                        onBack={() => setView(AppView.DASHBOARD)} 
                        plans={plans}
                        exchangeRate={exchangeRate}
                        onUpdatePlan={handleUpdatePlanConfig}
                        onUpdateExchangeRate={handleUpdateExchangeRate}
                        currentLogo={appLogo}
                        onUpdateLogo={setAppLogo}
                        {...commonProps}
                    />
                );
            case AppView.ADMIN_ACADEMY: 
                return <AdminAcademy onBack={() => setView(AppView.DASHBOARD)} {...commonProps} />;
            case AppView.ADMIN_VEHICLES:
                return <AdminVehicles onBack={() => setView(AppView.DASHBOARD)} {...commonProps} />;
            case AppView.COLLECTOR_JOBS:
                return (
                    <CollectorJobs 
                        user={user} 
                        onBack={() => setView(AppView.DASHBOARD)} 
                        onNotify={handleSendNotification}
                        {...commonProps}
                    />
                );
            
            default:
                return <Dashboard user={user} onChangeView={setView} />;
        }
    };

    if (loading) {
        return <SplashScreen appLogo={appLogo} />;
    }

    if (view === AppView.ONBOARDING) {
        return <Onboarding onComplete={handleOnboardingComplete} appLogo={appLogo} />;
    }

    return (
        <Layout 
            currentView={view} 
            onChangeView={setView} 
            onLogout={handleLogout} 
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            user={user}
            unreadNotifications={unreadCount}
            appLogo={appLogo}
            toast={toast}
            onCloseToast={() => setToast(prev => ({...prev, visible: false}))}
        >
            {renderContent()}
        </Layout>
    );
}

export default App;
