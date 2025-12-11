
import React, { useState } from 'react';
import { ArrowLeft, Search, MoreVertical, Shield, User, Truck, Filter, CheckCircle, XCircle, FileText, Download, Ban, Edit, Save, CreditCard, Activity, Calendar, Mail, Phone, MapPin, X, AlertTriangle, Eye, FileCheck, Image as ImageIcon, Send, Users, TrendingUp, AlertCircle, Lock, Unlock, Clock, Plus, ChevronDown, ChevronUp, Weight, Map, CheckSquare, Square, Trash2, MessageSquare, Key, Receipt } from 'lucide-react';
import { UserPermission, User as AppUser, UserType } from '../types';

interface AdminUsersProps {
    onBack: () => void;
    currentUser: AppUser;
    onNotify: (targetId: string | 'ADMIN' | 'ALL', title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// ... (Types Enrichis et Mock Data inchangés)
// --- Types Enrichis ---

interface Transaction {
    id: string;
    date: string;
    amount: string;
    type: 'Subscription' | 'Fine' | 'Donation';
    status: 'completed' | 'failed';
}

interface ActivityLog {
    id: string;
    action: string;
    date: string;
    details: string;
}

interface UserDocument {
    id: string;
    type: string; // 'ID Card', 'Permis', 'RCCM'
    name: string;
    status: 'pending' | 'approved' | 'rejected';
    url: string;
    uploadDate: string;
}

interface MockUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: 'Citoyen' | 'Collecteur' | 'Entreprise' | 'Admin';
    status: 'Actif' | 'Suspendu' | 'En attente';
    location: string;
    zone?: string; // Pour les collecteurs
    joinDate: string;
    subscription: 'Standard' | 'Plus' | 'Premium';
    subscriptionExpiry: string;
    verificationStatus: 'verified' | 'unverified' | 'pending';
    transactions: Transaction[];
    logs: ActivityLog[];
    documents: UserDocument[];
    permissions: UserPermission[];
}

// --- Données Mockées ---

const MOCK_USERS: MockUser[] = [
    { 
        id: '1', 
        firstName: 'Christian', 
        lastName: 'Mapele', 
        email: 'christian.m@gmail.com',
        phone: '+243 81 234 5678',
        role: 'Citoyen', 
        status: 'Actif', 
        location: 'Gombe, Av. Lukusa', 
        joinDate: '12/01/2024',
        subscription: 'Plus',
        subscriptionExpiry: '12/06/2024',
        verificationStatus: 'verified',
        transactions: [
            { id: 'TX123', date: '12/05/2024', amount: '25,000 FC', type: 'Subscription', status: 'completed' },
            { id: 'TX120', date: '12/04/2024', amount: '25,000 FC', type: 'Subscription', status: 'completed' }
        ],
        logs: [
            { id: 'L1', action: 'Connexion', date: 'Aujourd\'hui 10:30', details: 'IP: 192.168.1.1' },
            { id: 'L2', action: 'Collecte Validée', date: 'Hier 14:00', details: 'Collecteur: Jean' }
        ],
        documents: [
            { id: 'D1', type: 'ID Card', name: 'Carte d\'électeur.jpg', status: 'approved', url: 'https://picsum.photos/400/300', uploadDate: '12/01/2024' }
        ],
        permissions: []
    },
    { 
        id: '2', 
        firstName: 'Jean', 
        lastName: 'Kabeya', 
        email: 'j.kabeya@kinecomap.cd',
        phone: '+243 99 876 5432',
        role: 'Collecteur', 
        status: 'Actif', 
        location: 'Limete Industriel',
        zone: 'Limete - Quartier 1',
        joinDate: '15/02/2024',
        subscription: 'Standard',
        subscriptionExpiry: 'N/A',
        verificationStatus: 'verified',
        transactions: [],
        logs: [
            { id: 'L3', action: 'Début de service', date: 'Aujourd\'hui 08:00', details: 'Véhicule: Camion Benne' }
        ],
        documents: [
            { id: 'D2', type: 'Permis', name: 'Permis de Conduire.pdf', status: 'approved', url: 'https://picsum.photos/400/300', uploadDate: '15/02/2024' },
            { id: 'D3', type: 'Assurance', name: 'Assurance Véhicule.pdf', status: 'pending', url: 'https://picsum.photos/400/300', uploadDate: '20/05/2024' }
        ],
        permissions: []
    },
    { 
        id: '3', 
        firstName: 'Kin Food', 
        lastName: 'SARL', 
        email: 'contact@kinfood.cd',
        phone: '+243 82 000 0000',
        role: 'Entreprise', 
        status: 'En attente', 
        location: 'Kintambo Magasin', 
        joinDate: '01/03/2024',
        subscription: 'Premium',
        subscriptionExpiry: '01/01/2025',
        verificationStatus: 'pending',
        transactions: [
             { id: 'TX999', date: '01/03/2024', amount: '350,000 FC', type: 'Subscription', status: 'completed' }
        ],
        logs: [],
        documents: [
            { id: 'D4', type: 'RCCM', name: 'Registre Commerce.pdf', status: 'pending', url: 'https://picsum.photos/400/300', uploadDate: '01/03/2024' },
            { id: 'D5', type: 'ID Nat', name: 'Id Nat.pdf', status: 'pending', url: 'https://picsum.photos/400/300', uploadDate: '01/03/2024' }
        ],
        permissions: []
    },
    { 
        id: '4', 
        firstName: 'Michel', 
        lastName: 'Kasongo', 
        email: 'michel.k@yahoo.fr',
        phone: '+243 85 111 2222',
        role: 'Citoyen', 
        status: 'Suspendu', 
        location: 'Lingwala', 
        joinDate: '20/04/2024',
        subscription: 'Standard',
        subscriptionExpiry: '20/05/2024',
        verificationStatus: 'verified',
        transactions: [],
        logs: [
            { id: 'L9', action: 'Suspension', date: 'Il y a 5 jours', details: 'Motif: Non-paiement récurrent' }
        ],
        documents: [],
        permissions: []
    },
    { 
        id: '5', 
        firstName: 'Super', 
        lastName: 'Admin', 
        email: 'admin@kinecomap.cd',
        phone: '+243 00 000 0000',
        role: 'Admin', 
        status: 'Actif', 
        location: 'QG Kinshasa', 
        joinDate: '01/01/2024',
        subscription: 'Premium',
        subscriptionExpiry: 'N/A',
        verificationStatus: 'verified',
        transactions: [],
        logs: [],
        documents: [],
        permissions: ['manage_users', 'validate_docs', 'view_finance', 'manage_ads', 'export_data', 'system_settings', 'manage_fleet', 'manage_academy', 'manage_communications', 'manage_pos']
    },
];

const PERMISSION_DEFINITIONS: { key: string, label: string, desc: string, restricted?: boolean }[] = [
    { key: 'manage_users', label: 'Gestion Utilisateurs', desc: 'Créer, modifier et bannir des comptes.' },
    { key: 'manage_communications', label: 'Communication', desc: 'Envoyer des messages et notifications.' },
    { key: 'manage_pos', label: 'Gestion Caisse (POS)', desc: 'Encaisser les paiements en espèces.' },
    { key: 'validate_docs', label: 'Validation KYC', desc: 'Approuver ou rejeter les documents légaux.' },
    { key: 'view_finance', label: 'Accès Financier', desc: 'Voir les revenus, transactions et abonnements.' },
    { key: 'manage_ads', label: 'Gestion Publicités', desc: 'Créer et gérer les campagnes publicitaires.' },
    { key: 'manage_fleet', label: 'Gestion Flotte & GPS', desc: 'Suivi des véhicules et maintenance.' },
    { key: 'manage_academy', label: 'Gestion Academy', desc: 'Créer des cours et gérer les quiz.' },
    { key: 'export_data', label: 'Export Données', desc: 'Télécharger la base de données en CSV/Excel.' },
    { key: 'system_settings', label: 'Super Admin', desc: 'Configuration globale et gestion des admins.', restricted: true },
];

export const AdminUsers: React.FC<AdminUsersProps> = ({ onBack, currentUser, onNotify, onToast }) => {
    // --- States ---
    const [users, setUsers] = useState<MockUser[]>(MOCK_USERS);
    const [roleFilter, setRoleFilter] = useState('Tous');
    const [statusFilter, setStatusFilter] = useState('Tous');
    const [search, setSearch] = useState('');
    
    // Batch Actions State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showBulkConfirmModal, setShowBulkConfirmModal] = useState(false);
    const [pendingBulkAction, setPendingBulkAction] = useState<'suspend' | 'activate' | 'delete' | null>(null);

    // Panel & Edit States
    const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'history'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<MockUser>>({});
    const [isPermissionsExpanded, setIsPermissionsExpanded] = useState(false);

    // Messaging State
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [messageText, setMessageText] = useState('');

    // Collector History Filter
    const [collectionFilter, setCollectionFilter] = useState<'week' | 'month'>('week');

    // Add User State
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserForm, setNewUserForm] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        role: 'Citoyen' | 'Collecteur' | 'Entreprise' | 'Admin';
        location: string;
        zone?: string;
        permissions: UserPermission[];
    }>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'Citoyen',
        location: '',
        zone: '',
        permissions: []
    });

    // --- Helpers ---

    const filteredUsers = users.filter(u => {
        const matchesRole = roleFilter === 'Tous' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'Tous' || u.status === statusFilter;
        
        const query = search.toLowerCase();
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        
        const matchesSearch = 
            fullName.includes(query) || 
            u.email.toLowerCase().includes(query) ||
            u.phone.toLowerCase().includes(query) ||
            u.id.toLowerCase().includes(query);

        return matchesRole && matchesStatus && matchesSearch;
    });

    const pendingVerifications = users.filter(u => u.verificationStatus === 'pending').length;

    // Check Permissions Hierarchy
    const isSuperAdmin = currentUser.permissions?.includes('system_settings');
    const canManageUsers = isSuperAdmin || currentUser.permissions?.includes('manage_users');
    const canCommunicate = isSuperAdmin || currentUser.permissions?.includes('manage_communications');

    // Mock Collection History Generator
    const getCollectorHistory = (filter: 'week' | 'month') => {
        const count = filter === 'week' ? 12 : 45; // Mock counts
        const weight = filter === 'week' ? 450 : 1850; // Mock weights
        const efficiency = filter === 'week' ? 92 : 88; // Mock efficiency

        const historyItems = [];
        const limit = filter === 'week' ? 5 : 10;
        
        for (let i = 0; i < limit; i++) {
            historyItems.push({
                id: i,
                date: new Date(Date.now() - i * 86400000).toLocaleDateString('fr-FR'),
                address: `Point de collecte #${100 + i}, Limete`,
                weight: Math.floor(Math.random() * 50) + 10,
                status: 'completed'
            });
        }
        return { count, weight, efficiency, historyItems };
    };

    // --- Handlers ---

    // Batch Select Handlers
    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === filteredUsers.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredUsers.map(u => u.id));
        }
    };

    const initiateBulkAction = (action: 'suspend' | 'activate' | 'delete') => {
        setPendingBulkAction(action);
        setShowBulkConfirmModal(true);
    };

    const executeBulkAction = () => {
        if (!pendingBulkAction) return;

        if (pendingBulkAction === 'delete') {
            setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
        } else {
            const newStatus = pendingBulkAction === 'suspend' ? 'Suspendu' : 'Actif';
            setUsers(prev => prev.map(u => selectedIds.includes(u.id) ? { ...u, status: newStatus } : u));
        }
        
        const actionLabel = pendingBulkAction === 'delete' ? 'supprimés' : pendingBulkAction === 'suspend' ? 'suspendus' : 'activés';
        onNotify('ADMIN', 'Action Groupée', `${selectedIds.length} utilisateurs ont été ${actionLabel}.`, 'success');
        if (onToast) onToast(`${selectedIds.length} utilisateurs ${actionLabel} avec succès`, "success");
        
        setSelectedIds([]);
        setShowBulkConfirmModal(false);
        setPendingBulkAction(null);
    };

    const handleExport = () => {
        // Simuler la création CSV
        const headers = ["ID,Prénom,Nom,Email,Rôle,Statut,Date Inscription"];
        const rows = filteredUsers.map(u => 
            `${u.id},${u.firstName},${u.lastName},${u.email},${u.role},${u.status},${u.joinDate}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        
        // Créer un lien invisible pour le téléchargement
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        if (onToast) onToast("Fichier CSV généré avec succès", "success");
    };

    const handleSelectUser = (user: MockUser) => {
        setSelectedUser(user);
        setActiveTab('profile');
        setIsEditing(false);
        setIsPermissionsExpanded(false);
        setEditForm({});
    };

    const handleSaveUser = () => {
        if (!selectedUser) return;
        const updatedUsers = users.map(u => 
            u.id === selectedUser.id ? { ...u, ...editForm } as MockUser : u
        );
        setUsers(updatedUsers);
        setSelectedUser({ ...selectedUser, ...editForm } as MockUser);
        setIsEditing(false);
        if (onToast) onToast("Modifications enregistrées", "success");
    };

    const handleStatusChange = (newStatus: 'Actif' | 'Suspendu') => {
        if (!selectedUser) return;
        if (window.confirm(`Confirmer le changement de statut vers : ${newStatus} ?`)) {
            const updatedUsers = users.map(u => 
                u.id === selectedUser.id ? { ...u, status: newStatus } : u
            );
            setUsers(updatedUsers);
            setSelectedUser({ ...selectedUser, status: newStatus });
            if (onToast) onToast(`Compte ${newStatus === 'Actif' ? 'activé' : 'suspendu'}`, "info");
        }
    };

    const handleTogglePermission = (perm: UserPermission) => {
        if (!selectedUser) return;
        
        // --- SECURITY & HIERARCHY CHECKS ---
        const isTargetAdmin = selectedUser.role === 'Admin';
        
        // 1. Only Super Admin can change permissions of another Admin
        if (isTargetAdmin && !isSuperAdmin) {
            if (onToast) onToast("Action refusée : Super Admin requis", "error");
            return;
        }

        // 2. Only Super Admin can grant/revoke 'system_settings'
        if (perm === 'system_settings' && !isSuperAdmin) {
            if (onToast) onToast("Action refusée : Super Admin requis", "error");
            return;
        }

        // 3. Root Account Protection
        if (selectedUser.id === '5' && perm === 'system_settings') {
             if (onToast) onToast("Le compte racine ne peut être modifié", "error");
             return;
        }

        // 4. Anti-Lockout (Prevent removing own critical permissions)
        if (currentUser.id === selectedUser.id && (perm === 'manage_users' || perm === 'system_settings')) {
             if (onToast) onToast("Impossible de révoquer vos propres droits admin", "error");
             return;
        }

        let newPermissions = selectedUser.permissions ? [...selectedUser.permissions] : [];
        if (newPermissions.includes(perm)) {
            newPermissions = newPermissions.filter(p => p !== perm);
        } else {
            newPermissions.push(perm);
        }

        const updatedUser = { ...selectedUser, permissions: newPermissions };
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
        setSelectedUser(updatedUser);
    };

    const handleDocumentAction = (docId: string, action: 'approved' | 'rejected') => {
        if (!selectedUser) return;
        
        const updatedDocs = selectedUser.documents.map(d => 
            d.id === docId ? { ...d, status: action } : d
        );

        const allApproved = updatedDocs.every(d => d.status === 'approved');
        const newVerificationStatus = allApproved ? 'verified' : selectedUser.verificationStatus;

        const updatedUser = { ...selectedUser, documents: updatedDocs, verificationStatus: newVerificationStatus };
        
        setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
        setSelectedUser(updatedUser);
        if (onToast) onToast(`Document ${action === 'approved' ? 'approuvé' : 'rejeté'}`, action === 'approved' ? 'success' : 'info');
    };

    const handleSendMessage = () => {
        if (!messageText.trim()) return;
        
        // Cas 1 : Message individuel
        if (selectedUser) {
            const newLog: ActivityLog = {
                id: `LOG-${Date.now()}`,
                action: 'Message Envoyé',
                date: 'Aujourd\'hui',
                details: `Admin: ${messageText.substring(0, 30)}...`
            };

            const updatedUser = {
                ...selectedUser,
                logs: [newLog, ...selectedUser.logs]
            };

            setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
            setSelectedUser(updatedUser);
            onNotify(selectedUser.id, 'Message de l\'Administration', messageText, 'info');
            onNotify('ADMIN', 'Message Envoyé', `Message envoyé avec succès à ${selectedUser.firstName} ${selectedUser.lastName}`, 'success');
        } 
        // Cas 2 : Message Groupé (Bulk)
        else if (selectedIds.length > 0) {
            selectedIds.forEach(id => {
                onNotify(id, 'Message de l\'Administration', messageText, 'info');
            });
            onNotify('ADMIN', 'Envoi Groupé', `Message envoyé à ${selectedIds.length} utilisateurs.`, 'success');
            if (onToast) onToast(`Message envoyé à ${selectedIds.length} utilisateurs`, "success");
            setSelectedIds([]); // Clear selection after sending
        }

        setMessageText('');
        setShowMessageModal(false);
    };

    const handleNewUserPermissionToggle = (perm: UserPermission) => {
        setNewUserForm(prev => {
            const current = prev.permissions;
            const newPerms = current.includes(perm)
                ? current.filter(p => p !== perm)
                : [...current, perm];
            return { ...prev, permissions: newPerms };
        });
    };

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        
        const newUser: MockUser = {
            id: Date.now().toString(),
            firstName: newUserForm.firstName,
            lastName: newUserForm.lastName,
            email: newUserForm.email,
            phone: newUserForm.phone,
            role: newUserForm.role,
            status: 'Actif',
            location: newUserForm.location,
            zone: newUserForm.zone,
            joinDate: new Date().toLocaleDateString('fr-FR'),
            subscription: 'Standard',
            subscriptionExpiry: 'N/A',
            verificationStatus: 'unverified',
            transactions: [],
            logs: [{
                id: `LOG-${Date.now()}`,
                action: 'Création compte',
                date: 'Aujourd\'hui',
                details: 'Compte créé par administrateur'
            }],
            documents: [],
            permissions: newUserForm.role === 'Admin' ? newUserForm.permissions : []
        };

        setUsers([newUser, ...users]);
        setShowAddUserModal(false);
        setNewUserForm({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            role: 'Citoyen',
            location: '',
            zone: '',
            permissions: []
        });
        handleSelectUser(newUser);
        if (onToast) onToast(`Utilisateur ${newUser.firstName} créé avec succès`, "success");
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300 relative overflow-hidden">
            
            {/* --- HEADER --- */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex flex-col gap-4 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gestion Utilisateurs</h2>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowAddUserModal(true)}
                            className="px-4 py-2 bg-[#00C853] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-green-600 transition-all shadow-lg shadow-green-200 dark:shadow-none transform active:scale-95"
                        >
                            <Plus size={18} /> <span className="hidden md:inline">Nouvel Utilisateur</span>
                        </button>
                        <button 
                            onClick={handleExport}
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            <Download size={18} /> <span className="hidden md:inline">Exporter CSV</span>
                        </button>
                    </div>
                </div>

                {/* --- ANALYTICS CARDS --- */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-800 flex flex-col">
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Total Users</span>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold text-blue-800 dark:text-white">{users.length}</span>
                            <Users size={16} className="text-blue-400" />
                        </div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-800 flex flex-col">
                        <span className="text-xs text-green-600 dark:text-green-400 font-bold uppercase mb-1">Revenus (Mensuel)</span>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold text-green-800 dark:text-white">2.5M <span className="text-xs font-normal">FC</span></span>
                            <TrendingUp size={16} className="text-green-400" />
                        </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-100 dark:border-orange-800 flex flex-col relative overflow-hidden">
                        <span className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase mb-1">Vérifications</span>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold text-orange-800 dark:text-white">{pendingVerifications}</span>
                            <FileCheck size={16} className="text-orange-400" />
                        </div>
                        {pendingVerifications > 0 && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl border border-purple-100 dark:border-purple-800 flex flex-col">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase mb-1">Actifs (7j)</span>
                        <div className="flex justify-between items-end">
                            <span className="text-2xl font-bold text-purple-800 dark:text-white">85%</span>
                            <Activity size={16} className="text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 overflow-hidden flex relative">
                
                {/* --- LIST AREA --- */}
                <div className={`flex-1 overflow-y-auto p-5 transition-all duration-300 ${selectedUser ? 'hidden lg:block lg:w-7/12 xl:w-2/3' : 'w-full'}`}>
                    
                    {/* Advanced Filters */}
                    <div className="mb-4 flex flex-col gap-3">
                        <div className="relative w-full">
                            <Search size={20} className="absolute left-3 top-3.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Rechercher par nom, email, téléphone, ID..." 
                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF] transition-all shadow-sm focus:shadow-md"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button 
                                    onClick={() => setSearch('')}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                        
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                                <div className="px-2 text-xs font-bold text-gray-400 uppercase">Rôle</div>
                                <select 
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer"
                                >
                                    <option value="Tous">Tous</option>
                                    <option value="Citoyen">Citoyen</option>
                                    <option value="Collecteur">Collecteur</option>
                                    <option value="Entreprise">Entreprise</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm shrink-0">
                                <div className="px-2 text-xs font-bold text-gray-400 uppercase">Statut</div>
                                <select 
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-700 dark:text-white outline-none cursor-pointer"
                                >
                                    <option value="Tous">Tous</option>
                                    <option value="Actif">Actif</option>
                                    <option value="Suspendu">Suspendu</option>
                                    <option value="En attente">En attente</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table Header (Desktop) */}
                    <div className="hidden md:grid grid-cols-12 px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 gap-4">
                        <div className="col-span-1 flex items-center justify-center">
                            <button onClick={handleSelectAll} className="hover:text-[#2962FF]">
                                {selectedIds.length === filteredUsers.length && filteredUsers.length > 0 ? <CheckSquare size={18} /> : <Square size={18} />}
                            </button>
                        </div>
                        <div className="col-span-4">Utilisateur</div>
                        <div className="col-span-3">Rôle & Zone</div>
                        <div className="col-span-2">Statut</div>
                        <div className="col-span-2 text-right">Action</div>
                    </div>

                    {/* Users List */}
                    <div className="space-y-3 pb-24">
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                Aucun utilisateur trouvé.
                            </div>
                        )}
                        {filteredUsers.map(user => (
                            <div 
                                key={user.id} 
                                className={`bg-white dark:bg-gray-800 p-4 rounded-xl border flex flex-col md:grid md:grid-cols-12 gap-3 transition-all hover:shadow-md ${
                                    selectedUser?.id === user.id ? 'border-[#2962FF] ring-1 ring-[#2962FF]' : 'border-gray-100 dark:border-gray-700'
                                } ${selectedIds.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className="flex items-center gap-4 md:col-span-5">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleToggleSelect(user.id); }}
                                        className={`p-1 rounded transition-colors ${selectedIds.includes(user.id) ? 'text-[#2962FF]' : 'text-gray-300 hover:text-gray-500'}`}
                                    >
                                        {selectedIds.includes(user.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                                    </button>
                                    
                                    <div 
                                        className="flex items-center gap-3 cursor-pointer flex-1"
                                        onClick={() => handleSelectUser(user)}
                                    >
                                        <div className="relative shrink-0">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                user.role === 'Collecteur' ? 'bg-[#2962FF]' : 
                                                user.role === 'Entreprise' ? 'bg-purple-600' : 
                                                user.role === 'Admin' ? 'bg-gray-800' : 'bg-[#00C853]'
                                            }`}>
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            {user.verificationStatus === 'verified' && (
                                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
                                                    <CheckCircle size={14} className="text-blue-500" fill="white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="font-bold text-gray-800 dark:text-white truncate">{user.firstName} {user.lastName}</h4>
                                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col justify-center md:col-span-3 pl-8 md:pl-0">
                                    <span className="font-medium text-gray-700 dark:text-gray-200 text-sm">{user.role}</span>
                                    {user.zone && <span className="text-xs text-gray-400 truncate flex items-center gap-1"><MapPin size={10}/> {user.zone}</span>}
                                </div>

                                <div className="flex items-center md:col-span-2 pl-8 md:pl-0">
                                    <span className={`flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full ${
                                        user.status === 'Actif' ? 'bg-green-50 text-green-600' : 
                                        user.status === 'Suspendu' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                                    }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            user.status === 'Actif' ? 'bg-green-500' : 
                                            user.status === 'Suspendu' ? 'bg-red-500' : 'bg-orange-500'
                                        }`}></div>
                                        {user.status}
                                    </span>
                                </div>

                                <div className="flex justify-end items-center md:col-span-2">
                                    <button 
                                        onClick={() => handleSelectUser(user)}
                                        className="text-[#2962FF] hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        Gérer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- BULK ACTIONS BAR --- */}
                {selectedIds.length > 0 && (
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#1a202c] text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-6 animate-fade-in-up border border-gray-700">
                        <span className="font-bold text-sm whitespace-nowrap">{selectedIds.length} sélectionné(s)</span>
                        <div className="h-6 w-px bg-gray-600"></div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => { setShowMessageModal(true); setMessageText(''); }}
                                disabled={!canCommunicate}
                                className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${!canCommunicate ? 'text-gray-500 cursor-not-allowed' : 'hover:bg-blue-500/20 hover:text-blue-400'}`}
                                title="Message Groupé"
                            >
                                <MessageSquare size={20} />
                            </button>
                            <button 
                                onClick={() => initiateBulkAction('suspend')}
                                disabled={!canManageUsers}
                                className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${!canManageUsers ? 'text-gray-500 cursor-not-allowed' : 'hover:bg-red-500/20 hover:text-red-400'}`}
                                title="Suspendre"
                            >
                                <Ban size={20} />
                            </button>
                            <button 
                                onClick={() => initiateBulkAction('activate')}
                                disabled={!canManageUsers}
                                className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${!canManageUsers ? 'text-gray-500 cursor-not-allowed' : 'hover:bg-green-500/20 hover:text-green-400'}`}
                                title="Activer"
                            >
                                <CheckCircle size={20} />
                            </button>
                            <button 
                                onClick={() => initiateBulkAction('delete')}
                                disabled={!canManageUsers}
                                className={`p-2 rounded-lg transition-colors flex flex-col items-center gap-1 ${!canManageUsers ? 'text-gray-500 cursor-not-allowed' : 'hover:bg-red-500/20 hover:text-red-400'}`}
                                title="Supprimer"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                        <button 
                            onClick={() => setSelectedIds([])}
                            className="ml-2 p-1 hover:bg-white/10 rounded-full"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* --- SIDE PANEL (DETAIL) --- */}
                {selectedUser && (
                    <div className="fixed lg:static inset-0 lg:w-5/12 xl:w-1/3 bg-white dark:bg-gray-800 lg:border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col animate-slide-in-right">
                        
                        {/* Header Panel */}
                        <div className="p-6 pb-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                     <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg ${
                                        selectedUser.role === 'Collecteur' ? 'bg-[#2962FF]' : 
                                        selectedUser.role === 'Entreprise' ? 'bg-purple-600' : 
                                        selectedUser.role === 'Admin' ? 'bg-gray-800' : 'bg-[#00C853]'
                                    }`}>
                                        {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                            {selectedUser.firstName} {selectedUser.lastName}
                                        </h2>
                                        <p className="text-sm text-gray-500 mb-1">{selectedUser.role}</p>
                                        <div className="flex items-center gap-2">
                                            {selectedUser.verificationStatus === 'verified' && (
                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                                    <CheckCircle size={10} /> VÉRIFIÉ
                                                </span>
                                            )}
                                            {selectedUser.verificationStatus === 'pending' && (
                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                                    <AlertTriangle size={10} /> DOCS EN ATTENTE
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full lg:hidden">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-6">
                                {[
                                    { id: 'profile', label: 'Profil' },
                                    { id: 'documents', label: 'Documents', badge: selectedUser.documents.filter(d => d.status === 'pending').length },
                                    { id: 'history', label: 'Historique' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`pb-3 text-sm font-bold relative transition-colors ${
                                            activeTab === tab.id 
                                            ? 'text-[#2962FF]' 
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab.label}
                                        {tab.badge ? <span className="ml-1.5 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{tab.badge}</span> : null}
                                        {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2962FF] rounded-t-full"></div>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800">
                            
                            {/* --- TAB: PROFILE --- */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    {/* Action Bar */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                                                isEditing 
                                                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                                                : 'bg-white border-gray-100 hover:border-blue-200 hover:text-blue-600 text-gray-600'
                                            }`}
                                        >
                                            {isEditing ? <Save size={18} /> : <Edit size={18} />}
                                            {isEditing ? 'Enregistrer' : 'Modifier'}
                                        </button>
                                        <button 
                                            onClick={() => { setShowMessageModal(true); setMessageText(''); }}
                                            disabled={!canCommunicate}
                                            className={`py-3 rounded-xl border-2 border-gray-100 bg-white hover:bg-gray-50 font-bold flex items-center justify-center gap-2 ${!canCommunicate ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600'}`}
                                        >
                                            <Mail size={18} /> Envoyer un message
                                        </button>
                                    </div>

                                    {/* Statut & Abonnement Highlight */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase">Statut & Abonnement</h4>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Statut du compte</span>
                                            <button 
                                                onClick={() => handleStatusChange(selectedUser.status === 'Actif' ? 'Suspendu' : 'Actif')}
                                                disabled={!canManageUsers}
                                                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors ${!canManageUsers ? 'opacity-50 cursor-not-allowed' : ''} ${
                                                    selectedUser.status === 'Actif' 
                                                    ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' 
                                                    : 'bg-red-100 text-red-700 hover:bg-green-100 hover:text-green-700'
                                                }`}
                                            >
                                                {selectedUser.status === 'Actif' ? <Unlock size={14} /> : <Lock size={14} />}
                                                {selectedUser.status === 'Actif' ? 'Actif' : 'Suspendu'}
                                            </button>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                                             <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Expiration Abo.</span>
                                             <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-md border border-orange-200 dark:border-orange-800">
                                                <Calendar size={14} />
                                                <span className="text-sm font-bold">{selectedUser.subscriptionExpiry}</span>
                                             </div>
                                        </div>
                                    </div>

                                    {/* Info Block */}
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase">Coordonnées</h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm text-gray-500 block mb-1">Email</label>
                                                {isEditing ? (
                                                    <input className="w-full p-2 border rounded" defaultValue={selectedUser.email} />
                                                ) : (
                                                    <div className="font-medium flex items-center gap-2"><Mail size={14} /> {selectedUser.email}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 block mb-1">Téléphone</label>
                                                {isEditing ? (
                                                    <input className="w-full p-2 border rounded" defaultValue={selectedUser.phone} />
                                                ) : (
                                                    <div className="font-medium flex items-center gap-2"><Phone size={14} /> {selectedUser.phone}</div>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-500 block mb-1">Adresse</label>
                                                {isEditing ? (
                                                    <input className="w-full p-2 border rounded" defaultValue={selectedUser.location} />
                                                ) : (
                                                    <div className="font-medium flex items-center gap-2"><MapPin size={14} /> {selectedUser.location}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* --- GESTION PERMISSIONS --- */}
                                    <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <button 
                                            onClick={() => setIsPermissionsExpanded(!isPermissionsExpanded)}
                                            className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Shield size={20} className="text-[#2962FF]" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-800 dark:text-white text-left">Permissions & Accès</h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 text-left">Gérer les droits d'administration</p>
                                                </div>
                                            </div>
                                            {isPermissionsExpanded ? <ChevronUp size={20} className="text-gray-400"/> : <ChevronDown size={20} className="text-gray-400"/>}
                                        </button>
                                        
                                        {isPermissionsExpanded && (
                                            <div className={`bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-4 border border-gray-100 dark:border-gray-600 animate-fade-in ${!canManageUsers ? 'opacity-60 grayscale cursor-not-allowed' : ''}`}>
                                                
                                                {/* Security Notice for Admins */}
                                                {selectedUser.role === 'Admin' && !isSuperAdmin && (
                                                    <div className="text-center p-3 mb-2 text-xs text-red-500 font-bold bg-red-50 dark:bg-red-900/10 rounded-lg flex items-center justify-center gap-2">
                                                        <Lock size={12} />
                                                        Accès restreint : Seul un Super Admin peut modifier un autre Admin.
                                                    </div>
                                                )}

                                                {!canManageUsers && selectedUser.role !== 'Admin' && (
                                                    <div className="text-center p-2 mb-2 text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/10 rounded-lg">
                                                        Droits 'Gestion Utilisateurs' requis.
                                                    </div>
                                                )}
                                                
                                                {PERMISSION_DEFINITIONS.map((perm) => {
                                                    const isActive = selectedUser.permissions ? selectedUser.permissions.includes(perm.key as UserPermission) : false;
                                                    const isRestricted = perm.restricted && !isSuperAdmin;
                                                    const isDisabled = !canManageUsers || (selectedUser.role === 'Admin' && !isSuperAdmin) || isRestricted;

                                                    return (
                                                        <div key={perm.key} className={`flex justify-between items-center group p-2 rounded-lg transition-colors ${isDisabled ? 'opacity-50' : 'hover:bg-white dark:hover:bg-gray-600'}`}>
                                                            <div className="flex-1 pr-4">
                                                                <div className="flex items-center gap-2">
                                                                    <p className={`text-sm font-bold ${isActive ? 'text-gray-800 dark:text-white' : 'text-gray-500'}`}>{perm.label}</p>
                                                                    {perm.restricted && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 rounded font-bold">SUPER</span>}
                                                                </div>
                                                                <p className="text-xs text-gray-400">{perm.desc}</p>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleTogglePermission(perm.key as UserPermission)}
                                                                disabled={isDisabled}
                                                                className={`w-11 h-6 rounded-full flex items-center transition-colors px-1 shrink-0 ${
                                                                    isActive ? 'bg-[#2962FF]' : 'bg-gray-300 dark:bg-gray-600'
                                                                } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                                            >
                                                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                                                                    isActive ? 'translate-x-5' : 'translate-x-0'
                                                                }`}></div>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: DOCUMENTS --- */}
                            {activeTab === 'documents' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-bold text-gray-700 dark:text-white">Documents Soumis ({selectedUser.documents.length})</h4>
                                    </div>
                                    
                                    {selectedUser.documents.length === 0 && (
                                        <div className="text-center py-10 text-gray-400">
                                            <FileText size={40} className="mx-auto mb-2 opacity-50" />
                                            <p>Aucun document soumis</p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {selectedUser.documents.map(doc => (
                                            <div key={doc.id} className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl p-4 shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center text-gray-500">
                                                            <ImageIcon size={20} />
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-gray-800 dark:text-white text-sm">{doc.type}</h5>
                                                            <p className="text-xs text-gray-500">{doc.name}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase ${
                                                        doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                        doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                        {doc.status}
                                                    </span>
                                                </div>
                                                
                                                {/* Mock Preview Area */}
                                                <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded-lg mb-4 overflow-hidden relative group">
                                                    <img src={doc.url} alt="Document preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                                        <button className="bg-white text-gray-800 px-3 py-1 rounded-lg text-xs font-bold shadow-sm">Voir</button>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                {doc.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleDocumentAction(doc.id, 'approved')}
                                                            className="flex-1 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Approuver
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDocumentAction(doc.id, 'rejected')}
                                                            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors"
                                                        >
                                                            Rejeter
                                                        </button>
                                                    </div>
                                                )}
                                                {doc.status !== 'pending' && (
                                                     <div className="text-xs text-gray-400 text-center italic">
                                                        Traité le {new Date().toLocaleDateString()}
                                                     </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* --- TAB: HISTORY (Modified for Collectors) --- */}
                            {activeTab === 'history' && (
                                <div className="space-y-6">
                                     
                                     {selectedUser.role === 'Collecteur' ? (
                                        <>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-sm font-bold text-gray-700 dark:text-white">Performance de Collecte</h4>
                                                
                                                {/* COLLECTOR FILTER */}
                                                <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                                    <button 
                                                        onClick={() => setCollectionFilter('week')}
                                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${collectionFilter === 'week' ? 'bg-white text-[#2962FF] shadow-sm' : 'text-gray-500'}`}
                                                    >
                                                        Semaine
                                                    </button>
                                                    <button 
                                                        onClick={() => setCollectionFilter('month')}
                                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${collectionFilter === 'month' ? 'bg-white text-[#2962FF] shadow-sm' : 'text-gray-500'}`}
                                                    >
                                                        Mois
                                                    </button>
                                                </div>
                                            </div>

                                            {/* STATISTICS CARDS */}
                                            {(() => {
                                                const stats = getCollectorHistory(collectionFilter);
                                                return (
                                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl text-center">
                                                            <p className="text-[10px] text-blue-500 font-bold uppercase mb-1">Volume (kg)</p>
                                                            <p className="text-lg font-black text-blue-700 dark:text-blue-300">{stats.weight}</p>
                                                        </div>
                                                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-center">
                                                            <p className="text-[10px] text-green-500 font-bold uppercase mb-1">Arrêts</p>
                                                            <p className="text-lg font-black text-green-700 dark:text-green-300">{stats.count}</p>
                                                        </div>
                                                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl text-center">
                                                            <p className="text-[10px] text-purple-500 font-bold uppercase mb-1">Taux</p>
                                                            <p className="text-lg font-black text-purple-700 dark:text-purple-300">{stats.efficiency}%</p>
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* HISTORY LIST */}
                                            <div className="space-y-3">
                                                {getCollectorHistory(collectionFilter).historyItems.map(item => (
                                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center">
                                                                <Weight size={14} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-800 dark:text-white">{item.address}</p>
                                                                <p className="text-xs text-gray-500">{item.date}</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{item.weight} kg</span>
                                                            <div className="text-[10px] text-green-600 font-bold uppercase">Validé</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                     ) : (
                                        <>
                                            <h4 className="text-sm font-bold text-gray-700 dark:text-white mb-4">Journal d'activité</h4>
                                            
                                            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-3 space-y-6">
                                                {/* Transactions */}
                                                {selectedUser.transactions.map(tx => (
                                                    <div key={tx.id} className="ml-6 relative">
                                                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-green-500"></div>
                                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                                                            <div className="flex justify-between mb-1">
                                                                <span className="font-bold text-gray-800 dark:text-white text-sm">Paiement {tx.type}</span>
                                                                <span className="font-bold text-[#00C853] text-sm">{tx.amount}</span>
                                                            </div>
                                                            <div className="flex justify-between text-xs text-gray-500">
                                                                <span>{tx.date}</span>
                                                                <span className="capitalize">{tx.status}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Activity Logs */}
                                                {selectedUser.logs.map(log => (
                                                    <div key={log.id} className="ml-6 relative">
                                                        <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-blue-500"></div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 dark:text-white">{log.action}</p>
                                                            <p className="text-xs text-gray-500 mb-1">{log.date}</p>
                                                            <p className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 inline-block px-2 py-1 rounded">{log.details}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                     )}
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMessageModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-xl">
                        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">
                            {selectedUser ? `Message à ${selectedUser.firstName}` : `Message Groupé (${selectedIds.length})`}
                        </h3>
                        <textarea 
                            className="w-full h-32 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF] mb-4 resize-none"
                            placeholder="Écrivez votre message ici..."
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                        ></textarea>
                        <div className="flex justify-end gap-2">
                            <button 
                                onClick={() => setShowMessageModal(false)}
                                className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSendMessage}
                                className="px-4 py-2 bg-[#2962FF] text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <Send size={16} /> Envoyer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Action Confirmation Modal (New) */}
            {showBulkConfirmModal && pendingBulkAction && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setShowBulkConfirmModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 relative z-10 shadow-xl animate-scale-up">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                            pendingBulkAction === 'delete' ? 'bg-red-100 text-red-500' :
                            pendingBulkAction === 'suspend' ? 'bg-orange-100 text-orange-500' :
                            'bg-green-100 text-green-500'
                        }`}>
                            {pendingBulkAction === 'delete' ? <Trash2 size={28} /> :
                             pendingBulkAction === 'suspend' ? <Ban size={28} /> :
                             <CheckCircle size={28} />}
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">Confirmation</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-6">
                            Vous êtes sur le point de {
                                pendingBulkAction === 'delete' ? 'supprimer définitivement' :
                                pendingBulkAction === 'suspend' ? 'suspendre l\'accès de' :
                                'réactiver l\'accès de'
                            } <strong>{selectedIds.length} utilisateurs</strong>. Cette action affectera leur capacité à utiliser l'application.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setShowBulkConfirmModal(false)}
                                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={executeBulkAction}
                                className={`flex-1 py-3 rounded-xl font-bold text-white shadow-lg transition-colors ${
                                    pendingBulkAction === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' :
                                    pendingBulkAction === 'suspend' ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' :
                                    'bg-green-500 hover:bg-green-600 shadow-green-200'
                                }`}
                            >
                                Confirmer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add User Modal */}
            {showAddUserModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddUserModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ajouter un utilisateur</h3>
                            <button onClick={() => setShowAddUserModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prénom</label>
                                    <input 
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        value={newUserForm.firstName}
                                        onChange={e => setNewUserForm({...newUserForm, firstName: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom</label>
                                    <input 
                                        required
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        value={newUserForm.lastName}
                                        onChange={e => setNewUserForm({...newUserForm, lastName: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input 
                                    required
                                    type="email"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                    value={newUserForm.email}
                                    onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                                    placeholder="exemple@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Téléphone</label>
                                <input 
                                    required
                                    type="tel"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                    value={newUserForm.phone}
                                    onChange={e => setNewUserForm({...newUserForm, phone: e.target.value})}
                                    placeholder="+243..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rôle</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {['Citoyen', 'Collecteur', 'Entreprise', 'Admin'].map((role) => (
                                        <div 
                                            key={role}
                                            onClick={() => setNewUserForm({...newUserForm, role: role as any, permissions: []})}
                                            className={`cursor-pointer px-3 py-2 rounded-lg text-sm font-bold text-center border transition-all ${
                                                newUserForm.role === role 
                                                ? 'bg-[#00C853] text-white border-[#00C853]' 
                                                : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600'
                                            }`}
                                        >
                                            {role}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* ADMIN PERMISSIONS SELECTOR */}
                            {newUserForm.role === 'Admin' && (
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-white mb-3">Permissions Administrateur</label>
                                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {PERMISSION_DEFINITIONS.map((perm) => (
                                            <div 
                                                key={perm.key}
                                                onClick={() => handleNewUserPermissionToggle(perm.key as UserPermission)}
                                                className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                                            >
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                                                    newUserForm.permissions.includes(perm.key as UserPermission)
                                                    ? 'bg-[#2962FF] border-[#2962FF] text-white' 
                                                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-500'
                                                }`}>
                                                    {newUserForm.permissions.includes(perm.key as UserPermission) && <CheckSquare size={14} />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800 dark:text-white">{perm.label}</p>
                                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight">{perm.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse / Localisation</label>
                                <input 
                                    required
                                    type="text"
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                    value={newUserForm.location}
                                    onChange={e => setNewUserForm({...newUserForm, location: e.target.value})}
                                    placeholder="Commune, Quartier..."
                                />
                            </div>

                            {newUserForm.role === 'Collecteur' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Zone de Collecte</label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        value={newUserForm.zone}
                                        onChange={e => setNewUserForm({...newUserForm, zone: e.target.value})}
                                        placeholder="Ex: Limete Q.1"
                                    />
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setShowAddUserModal(false)}
                                    className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Annuler
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 rounded-xl font-bold bg-[#00C853] text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-200 dark:shadow-none"
                                >
                                    Créer le compte
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
