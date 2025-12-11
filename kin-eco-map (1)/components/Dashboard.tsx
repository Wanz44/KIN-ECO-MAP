
import React, { useState, useEffect } from 'react';
import { 
    Trash2, 
    Recycle, 
    Star, 
    Award, 
    Map as MapIcon, 
    Calendar, 
    CreditCard, 
    GraduationCap, 
    Leaf,
    Users,
    TrendingUp,
    AlertTriangle,
    Activity,
    Truck,
    CheckCircle,
    Navigation,
    Megaphone,
    Weight,
    Share2,
    MapPin,
    ArrowRight,
    Server,
    Database,
    Wifi,
    Globe,
    BookOpen,
    Copy,
    X,
    Smartphone,
    BarChart3,
    MousePointer,
    Eye,
    ListFilter,
    Plus,
    Upload,
    Building2,
    Mail,
    Phone,
    Edit2
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell, 
    PieChart, Pie, Legend, AreaChart, Area, CartesianGrid, YAxis,
    RadialBarChart, RadialBar 
} from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { User, AppView, UserType } from '../types';

// --- LEAFLET SETUP FOR DASHBOARD ---
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const createDashboardMapIcon = (type: 'truck' | 'trash' | 'done') => {
    let bg = '#2962FF';
    let iconSvg = '';

    switch (type) {
        case 'truck':
            bg = '#2962FF';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
            break;
        case 'trash':
            bg = '#FF6D00';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>`;
            break;
        case 'done':
            bg = '#00C853';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            break;
    }

    return L.divIcon({
        className: 'custom-dashboard-marker',
        html: `<div style="background-color: ${bg}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">${iconSvg}</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

interface DashboardProps {
    user: User;
    onChangeView: (view: AppView) => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// --- CITIZEN DASHBOARD ---
const CitizenDashboard: React.FC<DashboardProps> = ({ user, onChangeView }) => {
    const [showShareModal, setShowShareModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Generate a consistent referral code based on user name
    const referralCode = `KIN-${user.firstName.substring(0, 3).toUpperCase()}-${user.id ? user.id.slice(-4) : '2024'}`;

    const data = [
      { name: 'Lun', uv: 2 },
      { name: 'Mar', uv: 1 },
      { name: 'Mer', uv: 3 },
      { name: 'Jeu', uv: 0 },
      { name: 'Ven', uv: 2 },
      { name: 'Sam', uv: 4 },
      { name: 'Dim', uv: 1 },
    ];

    const handleShareStatus = () => {
        if (navigator.share) {
            navigator.share({
                title: 'KIN ECO-MAP - Mon Quartier',
                text: `Mon quartier est propre à 75% sur KIN ECO-MAP ! Ensemble pour Kinshasa la Belle. 🌿🇨🇩`,
                url: 'https://kinecomap.cd',
            }).catch((error) => console.log('Error sharing', error));
        } else {
            alert("Partage simulé : Mon quartier est propre à 75% !");
        }
        setShowShareModal(false);
    };

    const handleReferralShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Rejoins KIN ECO-MAP',
                text: `Salut ! Utilise mon code de parrainage ${referralCode} pour gagner 50 points gratuits sur KIN ECO-MAP. Ensemble rendons Kinshasa propre ! 🚛🇨🇩`,
                url: 'https://kinecomap.cd/invite',
            }).catch((error) => console.log('Error sharing', error));
        } else {
            alert(`Lien copié : https://kinecomap.cd/invite?code=${referralCode}`);
        }
        setShowShareModal(false);
    };

    const handleAppShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Télécharge KIN ECO-MAP',
                text: 'Gère tes déchets, suis les camions en temps réel et gagne des points avec KIN ECO-MAP ! Ensemble pour un environnement sain. 🌿🇨🇩',
                url: 'https://kinecomap.cd/download',
            }).catch((error) => console.log('Error sharing', error));
        } else {
            alert("Lien de l'application copié : https://kinecomap.cd/download");
        }
        setShowShareModal(false);
    };

    const copyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="p-5 md:p-8 space-y-6 animate-fade-in pb-24 md:pb-8">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-[#00C853] to-[#2962FF] rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-green-200/50 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Leaf size={120} />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 tracking-tight">Bonjour, {user.firstName}! 👋</h1>
                <p className="opacity-90 mb-4 text-sm md:text-base font-medium max-w-lg">Votre prochaine collecte est prévue aujourd'hui à 10:30. Préparez vos déchets ménagers.</p>
                
                <div className="max-w-md">
                    <div className="bg-white/20 h-2 rounded-full mb-2 overflow-hidden backdrop-blur-sm">
                        <div className="bg-white h-full rounded-full w-3/4 shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                        <p className="text-xs opacity-90 font-medium">Niveau de propreté du quartier: 75%</p>
                        <button 
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all backdrop-blur-md active:scale-95"
                        >
                            <Share2 size={14} /> Partager & Parrainer
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-3">
                        <Trash2 size={20} className="md:w-6 md:h-6" />
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{user.collections}</span>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Collectes</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                        <Recycle size={20} className="md:w-6 md:h-6" />
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">85%</span>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Recyclage</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center mb-3">
                        <Star size={20} className="md:w-6 md:h-6" />
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{user.points}</span>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Points</span>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center hover:shadow-md transition-all">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
                        <Award size={20} className="md:w-6 md:h-6" />
                    </div>
                    <span className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">{user.badges}</span>
                    <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">Badges</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Chart Section */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Volume collecté (kg)</h3>
                    <div className="h-48 md:h-64 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data}>
                                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}} 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backgroundColor: '#fff', color: '#000' }} 
                                />
                                <Bar dataKey="uv" radius={[4, 4, 0, 0]}>
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00C853' : '#69F0AE'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Upcoming Schedule */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white">Prochaines Collectes</h3>
                        <button onClick={() => onChangeView(AppView.PLANNING)} className="text-green-600 dark:text-green-400 text-sm font-semibold hover:underline">Voir tout</button>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden divide-y divide-gray-50 dark:divide-gray-700 flex-1">
                        <div className="p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mr-4 shrink-0">
                                <Trash2 size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Déchets ménagers</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Aujourd'hui, 10:30 - 11:30</p>
                            </div>
                            <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-[10px] uppercase font-bold px-2 py-1 rounded-md">À venir</span>
                        </div>
                        <div className="p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-4 shrink-0">
                                <Recycle size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-semibold text-gray-800 dark:text-white">Déchets recyclables</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Mercredi, 14:00 - 15:00</p>
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-[10px] uppercase font-bold px-2 py-1 rounded-md">Prévu</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 px-1">Actions Rapides</h3>
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                    <button onClick={() => onChangeView(AppView.MAP)} className="bg-white dark:bg-gray-800 p-3 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:border-green-200 dark:hover:border-green-700 hover:shadow-md transition-all active:scale-95 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 dark:bg-gray-700 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <MapIcon size={20} className="md:w-6 md:h-6" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300">Carte</span>
                    </button>
                    <button onClick={() => onChangeView(AppView.PLANNING)} className="bg-white dark:bg-gray-800 p-3 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:border-green-200 dark:hover:border-green-700 hover:shadow-md transition-all active:scale-95 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 dark:bg-gray-700 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <Calendar size={20} className="md:w-6 md:h-6" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300">Planning</span>
                    </button>
                    <button onClick={() => onChangeView(AppView.SUBSCRIPTION)} className="bg-white dark:bg-gray-800 p-3 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:border-green-200 dark:hover:border-green-700 hover:shadow-md transition-all active:scale-95 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 dark:bg-gray-700 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <CreditCard size={20} className="md:w-6 md:h-6" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300">Payer</span>
                    </button>
                    <button onClick={() => onChangeView(AppView.ACADEMY)} className="bg-white dark:bg-gray-800 p-3 md:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center hover:border-green-200 dark:hover:border-green-700 hover:shadow-md transition-all active:scale-95 group">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-50 dark:bg-gray-700 text-green-600 dark:text-green-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <GraduationCap size={20} className="md:w-6 md:h-6" />
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-gray-700 dark:text-gray-300">École</span>
                    </button>
                </div>
            </div>

            {/* --- SHARE MODAL --- */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl p-6 relative z-10 shadow-2xl animate-fade-in-up">
                        <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Partage & Parrainage</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Invitez vos voisins à rejoindre Kin Eco-Map !</p>
                        </div>

                        <div className="space-y-4">
                            {/* Referral Section */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">Votre Code Parrain</span>
                                    <Users size={16} className="text-blue-500" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="flex-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 rounded-xl flex items-center justify-center font-mono font-bold text-gray-700 dark:text-gray-200 text-lg tracking-wider">
                                        {referralCode}
                                    </div>
                                    <button 
                                        onClick={copyCode}
                                        className="bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                                    >
                                        {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-blue-500/80 mt-2 text-center">Gagnez 50 points par ami parrainé !</p>
                            </div>

                            <button 
                                onClick={handleReferralShare}
                                className="w-full py-3 bg-[#2962FF] text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Users size={18} /> Parrainer un ami
                            </button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-400 font-bold">Ou</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleShareStatus}
                                className="w-full py-3 bg-white dark:bg-gray-700 border-2 border-[#00C853] text-[#00C853] dark:text-green-400 font-bold rounded-xl hover:bg-green-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Share2 size={18} /> Partager mon statut
                            </button>

                            <button 
                                onClick={handleAppShare}
                                className="w-full py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Smartphone size={18} /> Partager l'application
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard: React.FC<DashboardProps> = ({ user, onChangeView }) => {
    // Live Users Simulation State
    const [onlineUsers, setOnlineUsers] = useState(124);

    useEffect(() => {
        const interval = setInterval(() => {
            setOnlineUsers(prev => {
                const change = Math.floor(Math.random() * 7) - 3; // -3 to +3
                return Math.max(80, prev + change);
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Advanced Mock Data for Charts
    const analyticsData = [
        { name: 'Lun', revenue: 4000, users: 2400, amt: 2400 },
        { name: 'Mar', revenue: 3000, users: 1398, amt: 2210 },
        { name: 'Mer', revenue: 2000, users: 5800, amt: 2290 },
        { name: 'Jeu', revenue: 2780, users: 3908, amt: 2000 },
        { name: 'Ven', revenue: 1890, users: 4800, amt: 2181 },
        { name: 'Sam', revenue: 2390, users: 3800, amt: 2500 },
        { name: 'Dim', revenue: 3490, users: 4300, amt: 2100 },
    ];

    const wasteTypeData = [
        { name: 'Ménager', value: 45, color: '#2962FF' },
        { name: 'Plastique', value: 25, color: '#00C853' },
        { name: 'Verre', value: 15, color: '#FF6D00' },
        { name: 'Métal', value: 10, color: '#FFD600' },
        { name: 'Autre', value: 5, color: '#6200EA' },
    ];

    const systemHealthData = [
        { name: 'Serveurs', uv: 95, fill: '#00C853' },
        { name: 'GPS', uv: 88, fill: '#2962FF' },
        { name: 'Base de données', uv: 99, fill: '#6200EA' },
        { name: 'Réseau', uv: 82, fill: '#FFD600' },
    ];

    return (
        <div className="p-5 md:p-8 space-y-6 animate-fade-in pb-24 md:pb-8">
            <div className="flex justify-between items-center mb-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Admin Control Center</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Vue d'ensemble et statistiques temps réel</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    <span className="text-sm font-bold text-green-500">SYSTEM ONLINE</span>
                </div>
            </div>

            {/* Futuristic Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                
                {/* Live Online Users Card */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-l-4 border-l-cyan-500 shadow-lg relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <Globe size={80} />
                    </div>
                    <div className="flex justify-between items-start">
                        <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">En Ligne</p>
                         <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                        </span>
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white mt-1">{onlineUsers}</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-cyan-500 text-xs font-bold">Live</span>
                        <span className="text-xs text-gray-400">Actifs maintenant</span>
                    </div>
                </div>

                <div 
                    onClick={() => onChangeView(AppView.ADMIN_USERS)}
                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-l-4 border-l-blue-500 shadow-lg relative overflow-hidden group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <Users size={80} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Total Utilisateurs</p>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white mt-1">2,543</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-bold flex items-center">+12%</span>
                        <span className="text-xs text-gray-400">vs semaine dernière</span>
                    </div>
                </div>

                <div 
                    onClick={() => onChangeView(AppView.ADMIN_VEHICLES)}
                    className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-l-4 border-l-green-500 shadow-lg relative overflow-hidden group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                    <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <Truck size={80} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Flotte Active</p>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white mt-1">28<span className="text-lg text-gray-400 font-normal">/35</span></h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden max-w-[100px]">
                            <div className="h-full bg-green-500 w-[80%]"></div>
                        </div>
                        <span className="text-xs text-gray-400">80% op.</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-l-4 border-l-yellow-500 shadow-lg relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <CreditCard size={80} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Revenus (FC)</p>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white mt-1">1.2M</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-xs font-bold flex items-center">+5.2%</span>
                        <span className="text-xs text-gray-400">vs mois dernier</span>
                    </div>
                </div>

                 <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border-l-4 border-l-red-500 shadow-lg relative overflow-hidden group">
                     <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110">
                        <AlertTriangle size={80} />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Alertes Système</p>
                    <h2 className="text-3xl font-black text-gray-800 dark:text-white mt-1">3</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-red-500 text-xs font-bold animate-pulse">Action Requise</span>
                    </div>
                </div>
            </div>

            {/* Main Graphs Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Area Chart: Revenue & Users Trend */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                            <Activity size={20} className="text-blue-500" /> Performance Globale
                        </h3>
                        <div className="flex gap-2">
                             <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Revenus
                             </div>
                             <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span> Utilisateurs
                             </div>
                        </div>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2962FF" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#2962FF" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00C853" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#00C853" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.3} />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)', 
                                        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                                        color: '#fff',
                                        backdropFilter: 'blur(8px)'
                                    }} 
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2962FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                <Area type="monotone" dataKey="users" stroke="#00C853" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Donut Chart: Waste Types */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        <Weight size={20} className="text-purple-500" /> Répartition Déchets
                    </h3>
                    <div className="h-64 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={wasteTypeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {wasteTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                                        color: '#fff'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">100%</span>
                            <span className="text-xs text-gray-400">Volume</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {wasteTypeData.map((type, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                                <span className="w-2 h-2 rounded-full" style={{backgroundColor: type.color}}></span>
                                {type.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Section: System Health & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* System Health (Radial Bars) */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Server size={20} className="text-orange-500" /> Santé Système
                    </h3>
                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="100%" barSize={10} data={systemHealthData}>
                                <RadialBar
                                    label={{ position: 'insideStart', fill: '#fff' }}
                                    background
                                    dataKey="uv"
                                />
                                <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{right: 0}} />
                                <Tooltip />
                            </RadialBarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Grid */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                     <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Wifi size={20} className="text-green-500" /> Connectivité
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Database size={18} className="text-blue-500"/>
                                <div>
                                    <p className="font-bold text-sm dark:text-white">API Gateway</p>
                                    <p className="text-xs text-gray-400">12ms latency</p>
                                </div>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                         <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <Truck size={18} className="text-orange-500"/>
                                <div>
                                    <p className="font-bold text-sm dark:text-white">GPS Tracker</p>
                                    <p className="text-xs text-gray-400">Sync: 2s ago</p>
                                </div>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                         <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="flex items-center gap-3">
                                <CreditCard size={18} className="text-purple-500"/>
                                <div>
                                    <p className="font-bold text-sm dark:text-white">Payment Gateway</p>
                                    <p className="text-xs text-gray-400">Visa / Mobile</p>
                                </div>
                            </div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>

                {/* Management Actions */}
                <div className="flex flex-col gap-4">
                    <div className="flex gap-4">
                        <div 
                            onClick={() => onChangeView(AppView.ADMIN_USERS)}
                            className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-lg transition-all group flex flex-col items-center justify-center gap-2"
                        >
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Users size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Utilisateurs</span>
                        </div>

                        <div 
                            onClick={() => onChangeView(AppView.ADMIN_VEHICLES)}
                            className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-lg transition-all group flex flex-col items-center justify-center gap-2"
                        >
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Truck size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Flotte</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div 
                            onClick={() => onChangeView(AppView.ADMIN_ACADEMY)}
                            className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-lg transition-all group flex flex-col items-center justify-center gap-2"
                        >
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <BookOpen size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Academy</span>
                        </div>

                        <div 
                            onClick={() => onChangeView(AppView.ADMIN_ADS)}
                            className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-lg transition-all group flex flex-col items-center justify-center gap-2"
                        >
                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Megaphone size={20} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Publicités</span>
                        </div>
                    </div>

                    <div 
                        onClick={() => onChangeView(AppView.MAP)}
                        className="flex-1 bg-white dark:bg-gray-800 p-4 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm cursor-pointer hover:shadow-lg transition-all group flex flex-row items-center justify-between px-6"
                    >
                        <div>
                            <h3 className="font-bold text-sm text-gray-800 dark:text-white group-hover:text-cyan-500 transition-colors">Carte Supervision</h3>
                            <p className="text-[10px] text-gray-500 mt-0.5">Vue Temps Réel</p>
                        </div>
                        <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- COLLECTOR DASHBOARD ---
const CollectorDashboard: React.FC<DashboardProps> = ({ user, onChangeView }) => {
    // Données pour les graphiques (Volume et Nombre)
    const weeklyStats = [
        { day: 'Lun', kg: 450, count: 12 },
        { day: 'Mar', kg: 520, count: 15 },
        { day: 'Mer', kg: 480, count: 10 },
        { day: 'Jeu', kg: 600, count: 18 },
        { day: 'Ven', kg: 550, count: 14 },
        { day: 'Sam', kg: 720, count: 22 },
        { day: 'Dim', kg: 300, count: 8 },
    ];

    // Points de collecte fictifs pour la mini-carte
    const nearbyCollections = [
        { id: 1, lat: -4.4419, lng: 15.2663, type: 'truck', name: 'Ma Position' },
        { id: 2, lat: -4.4430, lng: 15.2680, type: 'trash', name: 'Rue de la Paix 12' },
        { id: 3, lat: -4.4400, lng: 15.2640, type: 'trash', name: 'Av. Lukusa 45' },
        { id: 4, lat: -4.4450, lng: 15.2650, type: 'done', name: 'Résidence Kinois' },
    ];

    return (
        <div className="p-5 md:p-8 space-y-6 animate-fade-in pb-24 md:pb-8">
            {/* Status Card */}
            <div className="bg-[#2962FF] rounded-3xl p-6 text-white shadow-xl shadow-blue-200/50 dark:shadow-none flex flex-col md:flex-row items-center justify-between">
                <div className="mb-4 md:mb-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-sm font-bold uppercase tracking-wider opacity-80">En Service</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold">Zone: {user.zone || 'Non assignée'}</h1>
                    <p className="opacity-80 mt-1">Véhicule: {user.vehicleType || 'Standard'}</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none bg-white/20 backdrop-blur-md border border-white/30 py-3 px-6 rounded-xl font-bold hover:bg-white/30 transition-colors">
                        Pause
                    </button>
                    <button className="flex-1 md:flex-none bg-red-500 py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-red-600 transition-colors">
                        Fin de service
                    </button>
                </div>
            </div>

            {/* Operational Stats & Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Volume Chart */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Weight size={20} className="text-[#00C853]"/> Volume Quotidien (kg)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyStats}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`${value} kg`, 'Poids']}
                                />
                                <Bar dataKey="kg" fill="#00C853" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Collections Count Chart */}
                <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                         <CheckCircle size={20} className="text-[#2962FF]"/> Collectes Effectuées
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyStats}>
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#E5E7EB" />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    formatter={(value: number) => [`${value} arrêts`, 'Collectes']}
                                />
                                <Bar dataKey="count" fill="#2962FF" radius={[4, 4, 0, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Interactive Mini Map Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-96 relative">
                <div className="absolute top-4 left-4 z-[400] bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600">
                    <h3 className="font-bold text-gray-800 dark:text-white text-sm flex items-center gap-2">
                        <MapPin size={16} className="text-red-500" />
                        Supervision Zone: {user.zone || 'Limete'}
                    </h3>
                </div>
                
                <MapContainer 
                    center={[-4.4419, 15.2663]} 
                    zoom={16} 
                    style={{ height: '100%', width: '100%' }} 
                    zoomControl={true}
                    scrollWheelZoom={false} // Keep false to avoid scrolling page mess
                    dragging={true}
                >
                    <TileLayer
                        attribution='&copy; OpenStreetMap'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Zone Circle */}
                    <Circle 
                        center={[-4.4419, 15.2663]} 
                        radius={500} 
                        pathOptions={{ color: '#2962FF', fillColor: '#2962FF', fillOpacity: 0.1 }} 
                    />

                    {nearbyCollections.map(pt => (
                        <Marker 
                            key={pt.id} 
                            position={[pt.lat, pt.lng]}
                            icon={createDashboardMapIcon(pt.type as any)}
                        >
                            <Popup>
                                <div className="p-1">
                                    <div className="font-bold text-sm mb-1">{pt.name}</div>
                                    <div className="text-xs text-gray-500 mb-2">
                                        {pt.type === 'truck' ? 'Votre véhicule' : pt.type === 'trash' ? 'Déchets à récupérer' : 'Collecte terminée'}
                                    </div>
                                    {pt.type === 'trash' && (
                                        <button 
                                            onClick={() => onChangeView(AppView.COLLECTOR_JOBS)}
                                            className="w-full bg-[#00C853] text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-1"
                                        >
                                            <Navigation size={12} /> S'y rendre
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
                
                <button 
                    onClick={() => onChangeView(AppView.MAP)}
                    className="absolute bottom-4 right-4 z-[400] bg-[#2962FF] text-white px-4 py-2 rounded-xl shadow-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    Agrandir la carte <ArrowRight size={16} />
                </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <button 
                    onClick={() => onChangeView(AppView.COLLECTOR_JOBS)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 hover:border-[#2962FF] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group h-32"
                 >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <CheckCircle size={24} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">Valider une collecte</span>
                 </button>

                 <button 
                    onClick={() => onChangeView(AppView.MAP)}
                    className="bg-white dark:bg-gray-800 p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-3 hover:border-[#00C853] hover:bg-green-50 dark:hover:bg-green-900/10 transition-all group h-32"
                 >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Navigation size={24} />
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200">Itinéraire Sites</span>
                 </button>
            </div>
        </div>
    );
};

export const Dashboard: React.FC<DashboardProps> = (props) => {
    // Router le dashboard selon le type d'utilisateur
    switch (props.user.type) {
        case UserType.ADMIN:
            return <AdminDashboard {...props} />;
        case UserType.COLLECTOR:
            return <CollectorDashboard {...props} />;
        default:
            return <CitizenDashboard {...props} />;
    }
};
