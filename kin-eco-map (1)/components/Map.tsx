
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ArrowLeft, Truck, User, Search, X, MapPin, Trash2, Loader2, Navigation, Layers, Moon, Sun, Globe, Locate, Users } from 'lucide-react';
import L from 'leaflet';
import { Collector, User as UserType, UserType as UserEnum } from '../types';

// Fix for default Leaflet marker icons in React
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconShadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: iconShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom DivIcons for better aesthetics
const createCustomIcon = (type: 'user' | 'truck' | 'inactive' | 'disposal' | 'landmark' | 'address') => {
    let color = '#2962FF';
    let bg = '#E3F2FD';
    let iconSvg = '';

    switch (type) {
        case 'truck':
            color = '#00C853';
            bg = '#E8F5E9';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
            break;
        case 'inactive':
            color = '#FF5252';
            bg = '#FFEBEE';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;
            break;
        case 'disposal':
            color = '#FF6D00';
            bg = '#FFF3E0';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`;
            break;
        case 'landmark':
            color = '#6200EA';
            bg = '#EDE7F6';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
            break;
        case 'address':
            color = '#D500F9';
            bg = '#F3E5F5';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;
            break;
        default: // user
            color = '#2962FF';
            bg = '#E3F2FD';
            iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    }

    return L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: ${bg}; color: ${color}; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">${iconSvg}</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
        popupAnchor: [0, -20]
    });
};

interface MapViewProps {
    user: UserType;
    onBack: () => void;
}

// Données Mockées étendues
const COLLECTORS: Collector[] = [
    { id: 1, name: 'Collecteur #1', lat: -4.4419, lng: 15.2663, status: 'active', vehicle: 'Camion' },
    { id: 2, name: 'Collecteur #2', lat: -4.4350, lng: 15.2600, status: 'active', vehicle: 'Pick-up' },
    { id: 3, name: 'Collecteur #3', lat: -4.4480, lng: 15.2750, status: 'inactive', vehicle: 'Tricycle' },
];

const DISPOSAL_POINTS = [
    { id: 'd1', name: 'Point de Tri Gombe', lat: -4.3020, lng: 15.3050, type: 'Recyclage Plastique' },
    { id: 'd2', name: 'Déchetterie Limete', lat: -4.3450, lng: 15.3200, type: 'Tout venant' },
];

const LANDMARKS = [
    { id: 'l1', name: 'Marché Central', lat: -4.3160, lng: 15.3090, type: 'Lieu Public' },
    { id: 'l2', name: 'Gare Centrale', lat: -4.3050, lng: 15.3130, type: 'Transport' },
    { id: 'l3', name: 'Stade des Martyrs', lat: -4.3275, lng: 15.3056, type: 'Sport' },
];

const KINSHASA_CENTER: [number, number] = [-4.3250, 15.3222]; // Centré plus globalement

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

// Composant pour contrôler la carte programmatiquement
const MapController = ({ center, zoom }: { center: [number, number] | null, zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.flyTo(center, zoom, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, zoom, map]);
    return null;
};

interface SearchResult {
    id: string | number;
    name: string;
    type: string;
    category: 'collector' | 'disposal' | 'landmark' | 'address';
    lat: number;
    lng: number;
}

type FilterType = 'collectors' | 'disposal' | 'landmarks';

export const MapView: React.FC<MapViewProps> = ({ user, onBack }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
    const [selectedZoom, setSelectedZoom] = useState<number>(18);
    const [selectedAddress, setSelectedAddress] = useState<SearchResult | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // GPS Simulation State for Collectors
    const [userLocation, setUserLocation] = useState<[number, number]>([-4.4419, 15.2663]);
    
    // Filters & Map Style State
    const [activeFilters, setActiveFilters] = useState<FilterType[]>(['collectors', 'disposal', 'landmarks']);
    const [mapStyle, setMapStyle] = useState<MapStyle>('standard');
    const [showLayerMenu, setShowLayerMenu] = useState(false);

    // Mobile List Visibility State
    const [showAgentList, setShowAgentList] = useState(false);

    // --- Real-time GPS Logic ---
    useEffect(() => {
        // Tenter d'obtenir la position réelle au chargement pour tout le monde
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(newPos);
                    // Si on n'est pas un collecteur (qui a sa propre simulation), on centre la carte
                    if (user.type !== UserEnum.COLLECTOR) {
                        setSelectedLocation(newPos);
                    }
                },
                (error) => {
                    console.warn("Erreur géolocalisation:", error);
                }
            );
        }

        // Si Collecteur, activer la simulation de mouvement
        if (user.type === UserEnum.COLLECTOR) {
            const interval = setInterval(() => {
                setUserLocation(prev => {
                    // Simule un déplacement aléatoire léger
                    const latChange = (Math.random() - 0.5) * 0.0005;
                    const lngChange = (Math.random() - 0.5) * 0.0005;
                    return [prev[0] + latChange, prev[1] + lngChange];
                });
            }, 3000); // Mise à jour toutes les 3 secondes

            return () => clearInterval(interval);
        }
    }, [user.type]);

    const handleLocateMe = () => {
        if (navigator.geolocation) {
            setIsLoading(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPos: [number, number] = [position.coords.latitude, position.coords.longitude];
                    setUserLocation(newPos);
                    setSelectedLocation(newPos);
                    setSelectedZoom(16);
                    setIsLoading(false);
                },
                (error) => {
                    console.error(error);
                    alert("Impossible de récupérer votre position.");
                    setIsLoading(false);
                }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
        }
    };

    // Debounce Search Effect
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch(searchQuery);
            } else {
                setSearchResults([]);
                setIsLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async (query: string) => {
        setIsLoading(true);
        const lowerQuery = query.toLowerCase();
        
        // 1. Recherche locale (Rapide)
        const localResults: SearchResult[] = [
            ...COLLECTORS.filter(c => c.name.toLowerCase().includes(lowerQuery) || c.vehicle.toLowerCase().includes(lowerQuery))
                .map(c => ({ id: c.id, name: c.name, type: c.vehicle, category: 'collector' as const, lat: c.lat, lng: c.lng })),
            ...DISPOSAL_POINTS.filter(d => d.name.toLowerCase().includes(lowerQuery) || d.type.toLowerCase().includes(lowerQuery))
                .map(d => ({ id: d.id, name: d.name, type: d.type, category: 'disposal' as const, lat: d.lat, lng: d.lng })),
            ...LANDMARKS.filter(l => l.name.toLowerCase().includes(lowerQuery) || l.type.toLowerCase().includes(lowerQuery))
                .map(l => ({ id: l.id, name: l.name, type: l.type, category: 'landmark' as const, lat: l.lat, lng: l.lng }))
        ];

        // 2. Recherche externe (OpenStreetMap Nominatim)
        let externalResults: SearchResult[] = [];
        try {
            // On ajoute "Kinshasa" pour contextuliser la recherche géographiquement
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Kinshasa, DR Congo')}&limit=5&addressdetails=1`);
            
            if (response.ok) {
                const data = await response.json();
                externalResults = data.map((item: any) => ({
                    id: `osm-${item.place_id}`,
                    name: item.display_name.split(',')[0], // On garde la partie la plus pertinente
                    type: item.type || 'Adresse',
                    category: 'address' as const,
                    lat: parseFloat(item.lat),
                    lng: parseFloat(item.lon)
                }));
            }
        } catch (error) {
            console.error("Erreur recherche adresse:", error);
        }

        setSearchResults([...localResults, ...externalResults]);
        setIsLoading(false);
    };

    const handleSelectResult = (result: SearchResult) => {
        // Déterminer le zoom optimal selon la catégorie
        let zoomLevel = 18;
        if (result.category === 'landmark') zoomLevel = 16;
        if (result.category === 'disposal') zoomLevel = 17;
        
        setSelectedZoom(zoomLevel);
        setSelectedLocation([result.lat, result.lng]);
        setSearchQuery(result.name);
        setSearchResults([]);
        setIsSearching(false);

        if (result.category === 'address') {
            setSelectedAddress(result);
            if (!activeFilters.includes('landmarks')) toggleFilter('landmarks');
        } else {
            setSelectedAddress(null);
            const targetFilter = result.category === 'collector' ? 'collectors' : 
                                 result.category === 'disposal' ? 'disposal' : 'landmarks';
            if (!activeFilters.includes(targetFilter)) toggleFilter(targetFilter);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setSelectedLocation(null);
        setSelectedAddress(null);
        setIsSearching(false);
    };

    const toggleFilter = (filter: FilterType) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter) 
                : [...prev, filter]
        );
    };

    const getCategoryIcon = (category: string) => {
        switch(category) {
            case 'collector': return <Truck size={16} className="text-green-600" />;
            case 'disposal': return <Trash2 size={16} className="text-orange-600" />;
            case 'address': return <MapPin size={16} className="text-pink-600" />;
            default: return <Navigation size={16} className="text-purple-600" />;
        }
    };

    return (
        <div className="flex flex-col h-full relative z-0">
            {/* Search Bar & Filters Overlay */}
            <div className="absolute top-4 left-4 right-4 z-[900] flex flex-col items-center pointer-events-none">
                <div className="w-full md:w-96 flex flex-col gap-2 pointer-events-auto">
                    
                    {/* Top Row: Back Btn + Search Input */}
                    <div className="flex gap-2 w-full">
                        {/* Back Button (Mobile) */}
                        <button onClick={onBack} className="md:hidden bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-center shrink-0">
                            <ArrowLeft size={20} />
                        </button>

                        {/* Search Input */}
                        <div className="flex-1 relative shadow-lg rounded-xl">
                            <div className="absolute left-3 top-3.5 text-gray-400">
                                {isLoading ? <Loader2 size={20} className="animate-spin text-[#00C853]" /> : <Search size={20} />}
                            </div>
                            <input 
                                type="text" 
                                placeholder="Chercher une adresse..."
                                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-none outline-none focus:ring-2 focus:ring-[#00C853] transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearching(true);
                                }}
                                onFocus={() => setIsSearching(true)}
                            />
                            {searchQuery && (
                                <button 
                                    onClick={clearSearch}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>

                     {/* Filters Chips */}
                     {!isSearching && (
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 w-full">
                            <button 
                                onClick={() => toggleFilter('collectors')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-all ${
                                    activeFilters.includes('collectors') 
                                    ? 'bg-[#00C853] text-white' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                <Truck size={14} /> Collecteurs
                            </button>
                            <button 
                                onClick={() => toggleFilter('disposal')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-all ${
                                    activeFilters.includes('disposal') 
                                    ? 'bg-[#FF6D00] text-white' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                <Trash2 size={14} /> Points de dépôt
                            </button>
                            <button 
                                onClick={() => toggleFilter('landmarks')}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold whitespace-nowrap shadow-md transition-all ${
                                    activeFilters.includes('landmarks') 
                                    ? 'bg-[#6200EA] text-white' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700'
                                }`}
                            >
                                <MapPin size={14} /> Lieux
                            </button>
                        </div>
                    )}

                    {/* Dropdown Results */}
                    {isSearching && searchQuery.length >= 2 && (
                        <div className="absolute top-16 left-0 right-0 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto border border-gray-100 dark:border-gray-700 w-full">
                            {isLoading && searchResults.length === 0 && (
                                <div className="p-4 text-center text-gray-400 text-sm">Recherche en cours...</div>
                            )}
                            {!isLoading && searchResults.length === 0 && (
                                <div className="p-4 text-center text-gray-400 text-sm">Aucun résultat trouvé</div>
                            )}
                            {searchResults.map((result) => (
                                <div 
                                    key={`${result.category}-${result.id}`}
                                    onClick={() => handleSelectResult(result)}
                                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-3 border-b border-gray-50 dark:border-gray-700 last:border-none"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0">
                                        {getCategoryIcon(result.category)}
                                    </div>
                                    <div>
                                        <div className="font-semibold text-sm text-gray-800 dark:text-white line-clamp-1">{result.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{result.type}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Layer Controller (Top Right) - Position lowered on Mobile to avoid search bar */}
            <div className="absolute top-24 right-4 md:top-4 z-[800] flex flex-col items-end gap-2 transition-all duration-300">
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

            {/* Locate Me Button - Position stacked below Layer on Mobile */}
            <div className="absolute top-40 right-4 md:top-20 z-[800] flex flex-col items-end gap-2 transition-all duration-300">
                 <button 
                    onClick={handleLocateMe}
                    className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-100 dark:border-gray-700"
                    title="Ma Position"
                >
                    <Locate size={20} />
                </button>
            </div>

            {/* Mobile Toggle Agents List Button - Bottom Right */}
            {!isSearching && !selectedAddress && (
                <button 
                    onClick={() => setShowAgentList(!showAgentList)}
                    className={`md:hidden absolute bottom-28 right-4 z-[800] p-3 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all ${showAgentList ? 'bg-[#2962FF] text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}
                >
                    <Users size={20} />
                </button>
            )}

            <MapContainer 
                center={KINSHASA_CENTER} 
                zoom={13} 
                style={{ width: '100%', height: '100%', flex: 1 }} 
                zoomControl={false}
            >
                <TileLayer
                    attribution={MAP_LAYERS[mapStyle].attribution}
                    url={MAP_LAYERS[mapStyle].url}
                />
                
                <MapController center={selectedLocation} zoom={selectedZoom} />

                {/* User Marker (Dynamic if Collector) */}
                <Marker 
                    position={userLocation} 
                    icon={createCustomIcon(user.type === UserEnum.COLLECTOR ? 'truck' : 'user')}
                >
                    <Popup>
                        <div className="font-semibold">
                            {user.type === UserEnum.COLLECTOR ? "Ma Position (En direct)" : "Vous êtes ici"}
                        </div>
                        <div className="text-xs text-gray-600">{user.address}</div>
                        {user.type === UserEnum.COLLECTOR && <div className="text-xs text-green-600 font-bold">● GPS Actif</div>}
                    </Popup>
                </Marker>

                {/* Collectors Markers (Other trucks) */}
                {activeFilters.includes('collectors') && COLLECTORS.map(collector => (
                    <Marker 
                        key={`c-${collector.id}`}
                        position={[collector.lat, collector.lng]} 
                        icon={createCustomIcon(collector.status === 'active' ? 'truck' : 'inactive')}
                    >
                        <Popup>
                            <div className="font-bold">{collector.name}</div>
                            <div className="text-xs">Véhicule: {collector.vehicle}</div>
                            <div className={`text-xs font-semibold ${collector.status === 'active' ? 'text-green-600' : 'text-red-500'}`}>
                                {collector.status === 'active' ? '● En ligne' : '● Hors ligne'}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Disposal Points Markers */}
                {activeFilters.includes('disposal') && DISPOSAL_POINTS.map(point => (
                    <Marker 
                        key={`d-${point.id}`}
                        position={[point.lat, point.lng]} 
                        icon={createCustomIcon('disposal')}
                    >
                        <Popup>
                            <div className="font-bold">{point.name}</div>
                            <div className="text-xs text-orange-600 font-semibold">{point.type}</div>
                        </Popup>
                    </Marker>
                ))}

                {/* Landmarks Markers */}
                {activeFilters.includes('landmarks') && LANDMARKS.map(point => (
                    <Marker 
                        key={`l-${point.id}`}
                        position={[point.lat, point.lng]} 
                        icon={createCustomIcon('landmark')}
                    >
                        <Popup>
                            <div className="font-bold">{point.name}</div>
                            <div className="text-xs text-purple-600">{point.type}</div>
                        </Popup>
                    </Marker>
                ))}

                {/* Dynamic Address Marker (Search Result) */}
                {selectedAddress && activeFilters.includes('landmarks') && (
                    <Marker 
                        position={[selectedAddress.lat, selectedAddress.lng]} 
                        icon={createCustomIcon('address')}
                    >
                        <Popup>
                            <div className="font-bold pr-4">{selectedAddress.name}</div>
                            <div className="text-xs text-pink-600 font-medium">Adresse trouvée</div>
                        </Popup>
                    </Marker>
                )}

            </MapContainer>

            {/* Selected Address Card */}
            {selectedAddress && (
                <div className="absolute bottom-0 left-0 right-0 p-4 z-[600] md:bottom-6 md:left-6 md:right-auto md:w-96 animate-fade-in-up">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-5 border border-gray-100 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-900/20 text-pink-500 flex items-center justify-center shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-white line-clamp-1">{selectedAddress.name}</h3>
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 text-[10px] font-bold uppercase tracking-wide">
                                        {selectedAddress.type}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={() => setSelectedAddress(null)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-400 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <Navigation size={18} className="text-blue-500" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Coordonnées GPS</p>
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                        {selectedAddress.lat.toFixed(6)}, {selectedAddress.lng.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="py-3 bg-[#2962FF] hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2">
                                <Navigation size={16} /> Itinéraire
                            </button>
                            <button className="py-3 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                                <Globe size={16} /> Voir détails
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Sheet for List (Overlay on Mobile) - Only visible if not searching AND no address selected AND toggled on */}
            <div className={`bg-white dark:bg-gray-800 rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] -mt-6 z-[500] relative p-5 overflow-y-auto transition-colors duration-300 md:absolute md:top-20 md:right-4 md:w-80 md:rounded-2xl md:mt-0 md:h-auto md:max-h-[calc(100%-6rem)] md:shadow-xl ${
                (isSearching || selectedAddress) ? 'hidden md:block' : (showAgentList ? 'block' : 'hidden md:block')
            }`}>
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-6 md:hidden"></div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Agents à proximité</h3>
                    {/* Close button for mobile inside the sheet */}
                    <button 
                        onClick={() => setShowAgentList(false)}
                        className="md:hidden p-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-500"
                    >
                        <X size={16} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    {COLLECTORS.map(collector => (
                        <div key={collector.id} className="flex items-center justify-between p-3 border-b border-gray-50 dark:border-gray-700 last:border-none hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer" onClick={() => handleSelectResult({ id: collector.id, name: collector.name, type: collector.vehicle, category: 'collector', lat: collector.lat, lng: collector.lng })}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${collector.status === 'active' ? 'bg-[#00C853]' : 'bg-[#FF5252]'}`}>
                                    <Truck size={18} />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-800 dark:text-white">{collector.name}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{collector.vehicle}</div>
                                </div>
                            </div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${collector.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                {collector.status === 'active' ? 'Actif' : 'Inactif'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
