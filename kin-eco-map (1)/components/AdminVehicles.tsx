
import React, { useState } from 'react';
import { ArrowLeft, Plus, Search, Battery, Signal, Truck, Settings, Trash2, Radio, X, AlertTriangle, Filter, Layers, Sun, Moon, Globe } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Vehicle, VehicleType } from '../types';

interface AdminVehiclesProps {
    onBack: () => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Configuration des icônes Leaflet
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Configuration des Calques de Carte
const MAP_LAYERS = {
    standard: {
        name: 'Plan',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '&copy; OpenStreetMap contributors',
        textColor: 'text-gray-800'
    },
    satellite: {
        name: 'Satellite',
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
        textColor: 'text-white'
    },
    dark: {
        name: 'Trafic / Nuit',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        textColor: 'text-white'
    }
};

type MapStyle = 'standard' | 'satellite' | 'dark';

const createVehicleIcon = (type: VehicleType, status: string, heading: number = 0) => {
    let color = status === 'active' ? '#00C853' : status === 'maintenance' ? '#FF6D00' : '#FF5252';
    let iconSvg = '';

    switch (type) {
        case 'moto':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6h-5a3 3 0 0 0-3 3v8h14v-5l-4-6z"></path><path d="M10 6L7 3h4l2 3"></path></svg>`;
            break;
        case 'chariot':
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="19" r="2"></circle><circle cx="17" cy="19" r="2"></circle><path d="M5 17h14v-9H5v9zm0-9V5h2v3m12 0V5h-2v3"></path></svg>`;
            break;
        default: // Truck/Pickup
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
    }

    // Indicateur de direction (Flèche)
    const arrowHtml = `
        <div style="position: absolute; top: -12px; left: 0; width: 100%; height: 100%; transform: rotate(${heading}deg); pointer-events: none; display: flex; justify-content: center; align-items: flex-start;">
            <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-bottom: 10px solid ${color}; filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.3));"></div>
        </div>
    `;

    return L.divIcon({
        className: 'custom-vehicle-marker',
        html: `
            <div style="position: relative; width: 36px; height: 36px;">
                ${status === 'active' ? arrowHtml : ''}
                <div style="background-color: ${color}; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); color: white; position: relative; z-index: 2;">
                    ${iconSvg}
                </div>
            </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18]
    });
};

const MOCK_VEHICLES: Vehicle[] = [
    { id: '1', name: 'Moto 01', type: 'moto', plateNumber: 'KN 1234 BB', gpsId: 'GPS-8821', status: 'active', batteryLevel: 85, signalStrength: 90, lat: -4.4419, lng: 15.2663, heading: 45, lastUpdate: 'Il y a 2 min' },
    { id: '2', name: 'Camion Benne 04', type: 'camion', plateNumber: 'KN 5678 AA', gpsId: 'GPS-9932', status: 'maintenance', batteryLevel: 10, signalStrength: 45, lat: -4.4350, lng: 15.2600, heading: 180, lastUpdate: 'Il y a 4h' },
    { id: '3', name: 'Tricycle 12', type: 'tricycle', plateNumber: 'KN 9988 CC', gpsId: 'GPS-1123', status: 'active', batteryLevel: 62, signalStrength: 80, lat: -4.4480, lng: 15.2750, heading: 270, lastUpdate: 'Il y a 5 min' },
    { id: '4', name: 'Chariot Manuel A', type: 'chariot', plateNumber: 'N/A', gpsId: 'GPS-TAG-01', status: 'stopped', batteryLevel: 98, signalStrength: 100, lat: -4.4420, lng: 15.2640, heading: 0, lastUpdate: 'Il y a 10 min' },
    { id: '5', name: 'Pickup Zone 2', type: 'pickup', plateNumber: 'KN 4455 DD', gpsId: 'GPS-2234', status: 'active', batteryLevel: 15, signalStrength: 25, lat: -4.4380, lng: 15.2700, heading: 90, lastUpdate: 'Il y a 1 min' },
];

export const AdminVehicles: React.FC<AdminVehiclesProps> = ({ onBack, onToast }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    
    // Filters State
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'maintenance' | 'stopped'>('all');
    const [batteryFilter, setBatteryFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
    const [signalFilter, setSignalFilter] = useState<'all' | 'weak' | 'average' | 'strong'>('all');
    
    // Map Style State
    const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
    const [showLayerMenu, setShowLayerMenu] = useState(false);

    // Delete Confirmation State
    const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);

    // Form State
    const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
        type: 'moto',
        status: 'active',
        batteryLevel: 100,
        signalStrength: 100
    });

    const filteredVehicles = vehicles.filter(v => {
        // Search Filter
        const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase()) || 
                              v.gpsId.toLowerCase().includes(search.toLowerCase()) ||
                              v.plateNumber.toLowerCase().includes(search.toLowerCase());
        
        // Status Filter
        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

        // Battery Filter
        let matchesBattery = true;
        if (batteryFilter === 'low') matchesBattery = v.batteryLevel < 20;
        else if (batteryFilter === 'medium') matchesBattery = v.batteryLevel >= 20 && v.batteryLevel <= 50;
        else if (batteryFilter === 'high') matchesBattery = v.batteryLevel > 50;

        // Signal Filter
        let matchesSignal = true;
        if (signalFilter === 'weak') matchesSignal = v.signalStrength < 30;
        else if (signalFilter === 'average') matchesSignal = v.signalStrength >= 30 && v.signalStrength <= 70;
        else if (signalFilter === 'strong') matchesSignal = v.signalStrength > 70;
        
        return matchesSearch && matchesStatus && matchesBattery && matchesSignal;
    });

    const handleAddVehicle = (e: React.FormEvent) => {
        e.preventDefault();
        const vehicle: Vehicle = {
            id: Date.now().toString(),
            name: newVehicle.name || 'Nouvel Engin',
            type: newVehicle.type || 'moto',
            plateNumber: newVehicle.plateNumber || 'N/A',
            gpsId: newVehicle.gpsId || `GPS-${Math.floor(Math.random()*10000)}`,
            status: newVehicle.status || 'active',
            batteryLevel: 100,
            signalStrength: 100,
            lat: -4.4419 + (Math.random() - 0.5) * 0.01,
            lng: 15.2663 + (Math.random() - 0.5) * 0.01,
            heading: 0,
            lastUpdate: 'À l\'instant'
        };
        setVehicles([...vehicles, vehicle]);
        setShowAddModal(false);
        setNewVehicle({ type: 'moto', status: 'active' });
        if (onToast) onToast(`Véhicule ${vehicle.name} ajouté`, "success");
    };

    const handleDeleteClick = (id: string) => {
        setVehicleToDelete(id);
    };

    const confirmDelete = () => {
        if (vehicleToDelete) {
            setVehicles(prev => prev.filter(v => v.id !== vehicleToDelete));
            if (selectedVehicle?.id === vehicleToDelete) setSelectedVehicle(null);
            setVehicleToDelete(null);
            if (onToast) onToast("Véhicule supprimé de la flotte", "success");
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300 relative">
             {/* Header */}
             <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex flex-col gap-4 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gestion Flotte & GPS</h2>
                    </div>
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="bg-[#2962FF] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <Plus size={18} /> Ajouter Engin
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                
                {/* LISTE VEHICULES (Gauche) */}
                <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col z-0">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 space-y-3">
                         <div className="relative">
                            <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                            <input 
                                type="text" 
                                placeholder="Rechercher engin, plaque, GPS..." 
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        
                        {/* Status Tabs */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            <button
                                onClick={() => setStatusFilter('all')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${statusFilter === 'all' ? 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-600 dark:text-white dark:border-gray-500' : 'bg-transparent text-gray-500 border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                Tous ({vehicles.length})
                            </button>
                            <button
                                onClick={() => setStatusFilter('active')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${statusFilter === 'active' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' : 'bg-transparent text-green-600 border-transparent hover:bg-green-50 dark:hover:bg-green-900/10'}`}
                            >
                                {vehicles.filter(v => v.status === 'active').length} Actifs
                            </button>
                            <button
                                onClick={() => setStatusFilter('maintenance')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${statusFilter === 'maintenance' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800' : 'bg-transparent text-orange-600 border-transparent hover:bg-orange-50 dark:hover:bg-orange-900/10'}`}
                            >
                                {vehicles.filter(v => v.status === 'maintenance').length} Maint.
                            </button>
                            <button
                                onClick={() => setStatusFilter('stopped')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap border transition-all ${statusFilter === 'stopped' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' : 'bg-transparent text-red-600 border-transparent hover:bg-red-50 dark:hover:bg-red-900/10'}`}
                            >
                                {vehicles.filter(v => v.status === 'stopped').length} Arrêt
                            </button>
                        </div>

                        {/* Technical Filters (Battery & Signal) */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                                <Battery size={14} className="absolute left-2.5 top-3 text-gray-400" />
                                <select 
                                    value={batteryFilter}
                                    onChange={(e) => setBatteryFilter(e.target.value as any)}
                                    className="w-full pl-8 pr-2 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 outline-none focus:border-[#2962FF]"
                                >
                                    <option value="all">Batterie: Tout</option>
                                    <option value="low">Faible (&lt;20%)</option>
                                    <option value="medium">Moyenne (20-50%)</option>
                                    <option value="high">Haute (&gt;50%)</option>
                                </select>
                            </div>
                            <div className="relative">
                                <Signal size={14} className="absolute left-2.5 top-3 text-gray-400" />
                                <select 
                                    value={signalFilter}
                                    onChange={(e) => setSignalFilter(e.target.value as any)}
                                    className="w-full pl-8 pr-2 py-2 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 outline-none focus:border-[#2962FF]"
                                >
                                    <option value="all">Signal: Tout</option>
                                    <option value="weak">Faible (Faible)</option>
                                    <option value="average">Moyen (Moyen)</option>
                                    <option value="strong">Fort (Fort)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {filteredVehicles.length === 0 && (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                Aucun engin ne correspond aux critères.
                            </div>
                        )}
                        {filteredVehicles.map(vehicle => (
                            <div 
                                key={vehicle.id}
                                onClick={() => setSelectedVehicle(vehicle)}
                                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                    selectedVehicle?.id === vehicle.id 
                                    ? 'border-[#2962FF] bg-blue-50 dark:bg-blue-900/10' 
                                    : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                                            vehicle.status === 'active' ? 'bg-green-500' : 
                                            vehicle.status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500'
                                        }`}>
                                            <Truck size={18} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white text-sm">{vehicle.name}</h4>
                                            <p className="text-xs text-gray-500 uppercase">{vehicle.plateNumber}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(vehicle.id); }}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-1.5 rounded-lg">
                                        <Radio size={12} className="text-blue-500" />
                                        <span>{vehicle.gpsId}</span>
                                    </div>
                                    <div className={`flex items-center gap-1.5 p-1.5 rounded-lg ${vehicle.batteryLevel < 20 ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-gray-50 text-gray-600 dark:bg-gray-700/50 dark:text-gray-300'}`}>
                                        <Battery size={12} />
                                        <span>{vehicle.batteryLevel}%</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                                    <span>Maj: {vehicle.lastUpdate}</span>
                                    <div className="flex items-center gap-1">
                                        <Signal size={10} className={vehicle.signalStrength > 70 ? 'text-green-500' : vehicle.signalStrength > 30 ? 'text-yellow-500' : 'text-red-500'} />
                                        <span className="capitalize">{vehicle.type}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CARTE & DETAILS (Droite) */}
                <div className="flex-1 relative bg-gray-100 dark:bg-gray-900">
                    
                    {/* Layer Controller */}
                    <div className="absolute top-4 right-4 z-[800] flex flex-col items-end gap-2">
                        <button 
                            onClick={() => setShowLayerMenu(!showLayerMenu)}
                            className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
                        >
                            <Layers size={20} />
                        </button>
                        
                        {showLayerMenu && (
                            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 flex flex-col gap-2 animate-fade-in origin-top-right">
                                <button 
                                    onClick={() => { setMapStyle('standard'); setShowLayerMenu(false); }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${mapStyle === 'standard' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <Sun size={16} /> Plan
                                </button>
                                <button 
                                    onClick={() => { setMapStyle('satellite'); setShowLayerMenu(false); }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${mapStyle === 'satellite' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <Globe size={16} /> Satellite
                                </button>
                                <button 
                                    onClick={() => { setMapStyle('dark'); setShowLayerMenu(false); }}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-all ${mapStyle === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                                >
                                    <Moon size={16} /> Trafic / Nuit
                                </button>
                            </div>
                        )}
                    </div>

                    <MapContainer 
                        center={[-4.4419, 15.2663]} 
                        zoom={14} 
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution={MAP_LAYERS[mapStyle].attribution}
                            url={MAP_LAYERS[mapStyle].url}
                        />
                        {vehicles.map(vehicle => (
                            <Marker 
                                key={vehicle.id} 
                                position={[vehicle.lat, vehicle.lng]}
                                icon={createVehicleIcon(vehicle.type, vehicle.status, vehicle.heading)}
                                eventHandlers={{
                                    click: () => setSelectedVehicle(vehicle),
                                }}
                            >
                                <Popup>
                                    <div className="font-bold">{vehicle.name}</div>
                                    <div className="text-xs">Batterie: {vehicle.batteryLevel}%</div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* OVERLAY DETAILS VEHICULE SELECTIONNÉ */}
                    {selectedVehicle && (
                        <div className="absolute bottom-6 left-6 right-6 lg:left-auto lg:right-6 lg:w-80 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-600 z-[400] animate-fade-in-up">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white">{selectedVehicle.name}</h3>
                                    <p className="text-sm text-gray-500">{selectedVehicle.type} • {selectedVehicle.plateNumber}</p>
                                </div>
                                <button onClick={() => setSelectedVehicle(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl flex justify-between items-center border border-gray-100 dark:border-gray-600">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                            <Radio size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">ID Puce GPS</p>
                                            <p className="font-bold text-gray-800 dark:text-white">{selectedVehicle.gpsId}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                                            <Signal size={12} /> {selectedVehicle.signalStrength}%
                                        </div>
                                        <p className="text-[10px] text-gray-400">Signal 4G</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Batterie GPS</p>
                                        <div className="flex items-center gap-2">
                                            <Battery size={20} className={selectedVehicle.batteryLevel < 20 ? 'text-red-500' : 'text-green-500'} />
                                            <span className="font-bold text-lg dark:text-white">{selectedVehicle.batteryLevel}%</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Statut</p>
                                        <span className={`text-sm font-bold uppercase ${selectedVehicle.status === 'active' ? 'text-green-600' : selectedVehicle.status === 'maintenance' ? 'text-orange-600' : 'text-red-600'}`}>
                                            {selectedVehicle.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-2 mt-2">
                                    <button className="flex-1 py-2 bg-[#2962FF] hover:bg-blue-700 text-white rounded-lg font-bold text-sm transition-colors">
                                        Historique Trajets
                                    </button>
                                    <button className="flex-1 py-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2">
                                        <Settings size={16} /> Configurer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL CONFIRMATION SUPPRESSION */}
            {vehicleToDelete && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setVehicleToDelete(null)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-xl relative z-10 animate-fade-in-up">
                        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-4 mx-auto">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 text-center">Supprimer l'engin ?</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6 text-center text-sm">
                            Cette action est irréversible. L'engin sera retiré de la flotte et du suivi GPS.
                        </p>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setVehicleToDelete(null)}
                                className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-colors shadow-lg shadow-red-200 dark:shadow-none"
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL AJOUT */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-fade-in-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">Ajouter un Engin</h3>
                            <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleAddVehicle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nom / Identifiant</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                    placeholder="Ex: Moto 05"
                                    value={newVehicle.name || ''}
                                    onChange={e => setNewVehicle({...newVehicle, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                                    <select 
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        value={newVehicle.type}
                                        onChange={e => setNewVehicle({...newVehicle, type: e.target.value as VehicleType})}
                                    >
                                        <option value="moto">Moto</option>
                                        <option value="tricycle">Tricycle</option>
                                        <option value="camion">Camion</option>
                                        <option value="pickup">Pickup</option>
                                        <option value="chariot">Chariot</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Plaque</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        placeholder="AA 123 BB"
                                        value={newVehicle.plateNumber || ''}
                                        onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ID Puce GPS</label>
                                <div className="relative">
                                    <Radio size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        placeholder="Ex: GPS-88219"
                                        value={newVehicle.gpsId || ''}
                                        onChange={e => setNewVehicle({...newVehicle, gpsId: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut Initial</label>
                                <select 
                                    className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                    value={newVehicle.status}
                                    onChange={e => setNewVehicle({...newVehicle, status: e.target.value as any})}
                                >
                                    <option value="active">Actif (En service)</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="stopped">À l'arrêt</option>
                                </select>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-3.5 mt-2 bg-[#00C853] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-colors"
                            >
                                Enregistrer l'engin
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
