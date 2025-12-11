
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, CheckCircle, Navigation, Clock, Trash2, Scale, Calculator, Plus, Save, Search, X, ChevronRight, QrCode, Camera, AlertTriangle, Zap, ZapOff, Image as ImageIcon } from 'lucide-react';
import { User as UserType } from '../types';

interface CollectorJobsProps {
    user: UserType;
    onBack: () => void;
    onNotify: (targetId: string | 'ADMIN', title: string, message: string, type: 'info' | 'success' | 'warning' | 'alert') => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

interface Job {
    id: number;
    name: string;
    address: string;
    wasteType: string;
    status: 'pending' | 'completed';
    distance: string;
    time: string;
    qrCode?: string; // Code attendu pour validation
}

interface SpecialCollection {
    id: string;
    clientName: string;
    wasteType: string;
    weight: number;
    pricePerKg: number;
    totalAmount: number;
    timestamp: string;
    pointsEarned: number;
}

const MOCK_JOBS: Job[] = [
    { id: 1, name: 'Famille Mapele', address: 'Av. Lukusa 12, Gombe', wasteType: 'Ménager', status: 'pending', distance: '0.5 km', time: '10:00', qrCode: 'USER-001' },
    { id: 2, name: 'Restaurant Chez Ntemba', address: 'Av. Libération, Gombe', wasteType: 'Organique & Verre', status: 'pending', distance: '1.2 km', time: '10:30', qrCode: 'USER-002' },
    { id: 3, name: 'Immeuble Futur', address: 'Blvd du 30 Juin', wasteType: 'Papier & Plastique', status: 'completed', distance: '2.0 km', time: '09:15', qrCode: 'USER-003' },
    { id: 4, name: 'Famille Kabeya', address: 'Rue de la Paix', wasteType: 'Ménager', status: 'pending', distance: '0.8 km', time: '11:00', qrCode: 'USER-004' },
];

const MOCK_CLIENTS = [
    { id: 'c1', name: 'Kinshasa Food SARL', address: 'Gombe' },
    { id: 'c2', name: 'Hôtel Memling', address: 'Gombe' },
    { id: 'c3', name: 'Supermarché Kin Mart', address: 'Gombe' },
    { id: 'c4', name: 'Bracongo', address: 'Lingwala' },
];

export const CollectorJobs: React.FC<CollectorJobsProps> = ({ user, onBack, onNotify, onToast }) => {
    const [activeTab, setActiveTab] = useState<'route' | 'special'>('route');
    const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
    const [validatingId, setValidatingId] = useState<number | null>(null);

    // QR Scanner State
    const [isScanning, setIsScanning] = useState(false);
    const [isTorchOn, setIsTorchOn] = useState(false);
    const [hasTorch, setHasTorch] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Special Collection State
    const [showSpecialForm, setShowSpecialForm] = useState(false);
    const [specialHistory, setSpecialHistory] = useState<SpecialCollection[]>([]);
    const [specialForm, setSpecialForm] = useState({
        clientId: '',
        wasteType: 'Plastique',
        weight: '',
        pricePerKg: '500', // Default price in FC
    });
    const [generatedTime, setGeneratedTime] = useState('');

    // Initialize time when form opens
    useEffect(() => {
        if (showSpecialForm) {
            const now = new Date();
            setGeneratedTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
        }
    }, [showSpecialForm]);

    // --- QR SCANNING LOGIC ---
    useEffect(() => {
        let animationFrameId: number;
        let stream: MediaStream | null = null;

        const startScanning = async () => {
            if (!isScanning) return;

            // Check if global library is loaded from index.html script tag
            const jsQR = (window as any).jsQR;
            if (!jsQR) {
                setScanError("Librairie scanner non chargée. Vérifiez votre connexion.");
                return;
            }

            try {
                stream = await navigator.mediaDevices.getUserMedia({ 
                    video: { facingMode: "environment" } 
                });
                
                // Check for Torch capability
                const track = stream.getVideoTracks()[0];
                const capabilities = (track.getCapabilities && track.getCapabilities()) as any;
                if (capabilities && capabilities.torch) {
                    setHasTorch(true);
                }

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true"); // requis pour iOS
                    videoRef.current.play();
                    requestAnimationFrame(tick);
                }
            } catch (err) {
                console.error("Erreur caméra:", err);
                setScanError("Impossible d'accéder à la caméra. Vérifiez les permissions.");
            }
        };

        const tick = () => {
            if (!isScanning || !videoRef.current || !canvasRef.current) return;

            if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                const video = videoRef.current;
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                const jsQR = (window as any).jsQR;

                if (ctx && jsQR) {
                    canvas.height = video.videoHeight;
                    canvas.width = video.videoWidth;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                        inversionAttempts: "dontInvert",
                    });

                    if (code) {
                        // Draw bounding box
                        const color = "#FF3B58";
                        ctx.beginPath();
                        ctx.lineWidth = 4;
                        ctx.strokeStyle = color;
                        ctx.moveTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                        ctx.lineTo(code.location.topRightCorner.x, code.location.topRightCorner.y);
                        ctx.lineTo(code.location.bottomRightCorner.x, code.location.bottomRightCorner.y);
                        ctx.lineTo(code.location.bottomLeftCorner.x, code.location.bottomLeftCorner.y);
                        ctx.lineTo(code.location.topLeftCorner.x, code.location.topLeftCorner.y);
                        ctx.stroke();

                        handleScanSuccess(code.data);
                        return; // Stop loop on success
                    }
                }
            }
            animationFrameId = requestAnimationFrame(tick);
        };

        if (isScanning) {
            startScanning();
        } else {
            // Stop logic
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            setHasTorch(false);
            setIsTorchOn(false);
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [isScanning]);

    // Handle Torch Toggle
    const toggleTorch = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            const track = stream.getVideoTracks()[0];
            const newStatus = !isTorchOn;
            
            track.applyConstraints({
                advanced: [{ torch: newStatus } as any]
            }).then(() => {
                setIsTorchOn(newStatus);
            }).catch(err => console.log('Torch error:', err));
        }
    };

    // Handle File Upload for scanning
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const jsQR = (window as any).jsQR;
        
        if (!jsQR) {
            if (onToast) onToast("Librairie scanner non disponible.", "error");
            return;
        }
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);
                    
                    if (code) {
                        handleScanSuccess(code.data);
                    } else {
                        if (onToast) onToast("Aucun QR code détecté sur cette image.", "error");
                    }
                }
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
    };

    const handleScanSuccess = (data: string) => {
        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(200);

        setIsScanning(false);
        
        // Logic: Find job matching QR Code
        const matchedJob = jobs.find(j => j.qrCode === data || data.includes(j.name));
        
        if (matchedJob) {
            if (matchedJob.status === 'completed') {
                if (onToast) onToast(`Ce point (${matchedJob.name}) a déjà été collecté.`, "info");
            } else {
                handleValidateRoute(matchedJob.id, true);
            }
        } else {
            if (data === "DEMO" || data.includes("KIN-ECO")) {
                const firstPending = jobs.find(j => j.status === 'pending');
                if (firstPending) handleValidateRoute(firstPending.id, true);
            } else {
                if (onToast) onToast(`Code QR scanné non reconnu: ${data}`, "error");
            }
        }
    };

    // Route Logic
    const handleValidateRoute = (id: number, viaScan = false) => {
        setValidatingId(id);
        
        // Simuler délai réseau
        setTimeout(() => {
            setJobs(prev => prev.map(job => job.id === id ? { ...job, status: 'completed' } : job));
            setValidatingId(null);
            
            const job = jobs.find(j => j.id === id);
            const msg = viaScan 
                ? `Validation par QR Code confirmée pour ${job?.name}.`
                : 'Votre collecteur a validé le ramassage manuellement.';
                
            onNotify('ALL', viaScan ? 'Collecte Certifiée' : 'Collecte Effectuée', msg, 'success');
            if (onToast) onToast("Collecte validée avec succès !", "success");
        }, 1500);
    };

    // Special Collection Logic
    const handleSpecialSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const weight = parseFloat(specialForm.weight);
        const price = parseFloat(specialForm.pricePerKg);
        
        if (!specialForm.clientId || isNaN(weight) || isNaN(price)) return;

        const client = MOCK_CLIENTS.find(c => c.id === specialForm.clientId);
        const total = weight * price;
        const points = Math.floor(weight * 2); // 2 points per Kg

        const newCollection: SpecialCollection = {
            id: Date.now().toString(),
            clientName: client?.name || 'Client Inconnu',
            wasteType: specialForm.wasteType,
            weight: weight,
            pricePerKg: price,
            totalAmount: total,
            timestamp: generatedTime,
            pointsEarned: points
        };

        setSpecialHistory([newCollection, ...specialHistory]);
        
        // --- NOTIFICATIONS AUTOMATIQUES ---
        onNotify(
            specialForm.clientId, 
            'Collecte Spéciale Terminée', 
            `Votre collecte de ${weight}kg (${specialForm.wasteType}) a été validée. Montant à régler : ${total.toLocaleString()} FC.`,
            'success'
        );

        onNotify(
            'ADMIN', 
            'Nouvelle Pesée Validée', 
            `Le collecteur ${user.firstName} a enregistré ${weight}kg chez ${client?.name}. Total: ${total.toLocaleString()} FC.`,
            'info'
        );

        if (onToast) onToast("Collecte spéciale enregistrée !", "success");

        setShowSpecialForm(false);
        setSpecialForm({
            clientId: '',
            wasteType: 'Plastique',
            weight: '',
            pricePerKg: '500',
        });
    };

    const pendingJobs = jobs.filter(j => j.status === 'pending');
    const completedJobs = jobs.filter(j => j.status === 'completed');

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex flex-col gap-4 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Espace Collecte</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Zone: {user.zone || 'Non assignée'}</p>
                        </div>
                    </div>
                    {/* Scan Button Header */}
                    <button 
                        onClick={() => setIsScanning(true)}
                        className="bg-[#00C853] text-white p-2.5 rounded-xl shadow-lg hover:bg-green-600 transition-colors flex items-center gap-2 animate-pulse"
                    >
                        <QrCode size={20} />
                        <span className="text-xs font-bold hidden md:inline">Scanner QR</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('route')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'route' ? 'bg-white dark:bg-gray-600 text-[#2962FF] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <MapPin size={16} /> Ma Route
                    </button>
                    <button 
                        onClick={() => setActiveTab('special')}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'special' ? 'bg-white dark:bg-gray-600 text-[#2962FF] dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        <Scale size={16} /> Spécial / Pesée
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 pb-20 space-y-4">
                
                {/* === ROUTE TAB === */}
                {activeTab === 'route' && (
                    <>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-800 dark:text-white">Aujourd'hui ({pendingJobs.length} restants)</h3>
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{completedJobs.length} terminés</span>
                        </div>

                        {/* Scan Action Card (Mobile Prominent) */}
                        <div 
                            onClick={() => setIsScanning(true)}
                            className="bg-gray-800 dark:bg-black rounded-2xl p-4 flex items-center justify-between text-white cursor-pointer shadow-lg mb-4 hover:scale-[1.02] transition-transform"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <QrCode size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold">Scanner une poubelle</h4>
                                    <p className="text-xs text-gray-300">Validez le passage instantanément</p>
                                </div>
                            </div>
                            <ChevronRight size={20} className="text-gray-400" />
                        </div>

                        {jobs.map(job => (
                            <div key={job.id} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl border transition-all ${job.status === 'completed' ? 'border-gray-100 dark:border-gray-700 opacity-60' : 'border-gray-200 dark:border-gray-600 shadow-sm'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 ${job.status === 'completed' ? 'bg-green-500' : 'bg-[#2962FF]'}`}>
                                            {job.status === 'completed' ? <CheckCircle size={20} /> : <Trash2 size={20} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-800 dark:text-white">{job.name}</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{job.address}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                        <Clock size={12} /> {job.time}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4 pl-[52px]">
                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">{job.wasteType}</span>
                                    <span>{job.distance}</span>
                                    {job.qrCode && <span className="flex items-center gap-1 text-[#2962FF]"><QrCode size={10}/> ID: {job.qrCode}</span>}
                                </div>

                                {job.status === 'pending' && (
                                    <div className="flex gap-2 pl-[52px]">
                                        <button className="p-2 bg-blue-50 dark:bg-blue-900/20 text-[#2962FF] rounded-xl font-bold flex-1 flex items-center justify-center gap-2 text-sm hover:bg-blue-100 transition-colors">
                                            <Navigation size={16} /> GPS
                                        </button>
                                        <button 
                                            onClick={() => handleValidateRoute(job.id)}
                                            disabled={validatingId === job.id}
                                            className="p-2 bg-[#00C853] text-white rounded-xl font-bold flex-1 flex items-center justify-center gap-2 text-sm hover:bg-green-600 transition-colors disabled:opacity-70"
                                        >
                                            {validatingId === job.id ? 'Validation...' : 'Manuel'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {/* === SPECIAL COLLECTION TAB === */}
                {activeTab === 'special' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Action Button */}
                        <button 
                            onClick={() => setShowSpecialForm(true)}
                            className="w-full py-4 bg-[#2962FF] hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                        >
                            <Plus size={20} /> Nouvelle Pesée / Collecte
                        </button>

                        {/* History */}
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-white mb-3">Historique du jour</h3>
                            {specialHistory.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                                    <Scale size={40} className="mx-auto mb-2 opacity-50" />
                                    <p>Aucune collecte spéciale aujourd'hui.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {specialHistory.map(item => (
                                        <div key={item.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center">
                                            <div>
                                                <h4 className="font-bold text-gray-800 dark:text-white">{item.clientName}</h4>
                                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                                    <span>{item.wasteType}</span>
                                                    <span>•</span>
                                                    <span>{item.timestamp}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-[#00C853]">{item.totalAmount.toLocaleString()} FC</div>
                                                <div className="text-xs font-bold bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 inline-block mt-1">
                                                    {item.weight} kg
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* SCANNER MODAL */}
            {isScanning && (
                <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                    {/* Top Bar Overlay */}
                    <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 to-transparent">
                        <button onClick={() => setIsScanning(false)} className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white">
                            <X size={24} />
                        </button>
                        <h3 className="text-white font-bold text-lg">Scanner un Code QR</h3>
                        
                        {/* Tools: Torch & Image Upload */}
                        <div className="flex gap-3">
                            {hasTorch && (
                                <button 
                                    onClick={toggleTorch} 
                                    className={`p-2 rounded-full transition-colors ${isTorchOn ? 'bg-yellow-400 text-black' : 'bg-white/20 text-white'}`}
                                >
                                    {isTorchOn ? <ZapOff size={20} /> : <Zap size={20} />}
                                </button>
                            )}
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white"
                            >
                                <ImageIcon size={20} />
                            </button>
                            {/* Hidden File Input */}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileUpload} 
                            />
                        </div>
                    </div>

                    {/* Camera View */}
                    <div className="flex-1 relative flex items-center justify-center overflow-hidden bg-black">
                        {scanError ? (
                            <div className="text-white text-center p-6 bg-red-900/50 rounded-xl m-4">
                                <AlertTriangle size={48} className="mx-auto mb-2" />
                                <p>{scanError}</p>
                                <button onClick={() => setIsScanning(false)} className="mt-4 px-4 py-2 bg-white text-red-900 rounded-lg font-bold">Fermer</button>
                            </div>
                        ) : (
                            <>
                                <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" muted></video>
                                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
                                
                                {/* Overlay Dark mask with hole */}
                                <div className="absolute inset-0 border-[50px] border-black/50 z-10 pointer-events-none"></div>

                                {/* Scanning Frame UI (Green Corners) */}
                                <div className="relative w-64 h-64 z-10">
                                    <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-[#00C853] rounded-tl-xl shadow-[0_0_10px_#00C853]"></div>
                                    <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-[#00C853] rounded-tr-xl shadow-[0_0_10px_#00C853]"></div>
                                    <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-[#00C853] rounded-bl-xl shadow-[0_0_10px_#00C853]"></div>
                                    <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-[#00C853] rounded-br-xl shadow-[0_0_10px_#00C853]"></div>
                                    
                                    {/* Laser Animation */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-red-500 shadow-[0_0_15px_red] animate-[scan_2s_infinite_linear]"></div>
                                </div>

                                <p className="absolute bottom-32 text-white/90 text-sm font-medium text-center px-4 z-20 bg-black/30 py-2 rounded-full backdrop-blur-sm">
                                    Placez le code QR dans le cadre.
                                </p>
                                
                                {/* Simulate Button for Desktop Dev */}
                                <button 
                                    onClick={() => handleScanSuccess('DEMO')}
                                    className="absolute bottom-10 bg-white/20 backdrop-blur-md border border-white/30 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-white/30 z-20"
                                >
                                    (Dev) Simuler Scan
                                </button>
                            </>
                        )}
                    </div>
                    
                    {/* Add Scan Animation Style */}
                    <style>{`
                        @keyframes scan {
                            0% { top: 0; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                        }
                    `}</style>
                </div>
            )}

            {/* FORM MODAL FOR SPECIAL COLLECTION */}
            {showSpecialForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSpecialForm(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-6 relative z-10 shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                        
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white">Collecte Spéciale</h3>
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                    <Clock size={12} /> {generatedTime}
                                </p>
                            </div>
                            <button onClick={() => setShowSpecialForm(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSpecialSubmit} className="space-y-5">
                            
                            {/* Client Selection */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sélectionner Client</label>
                                <div className="relative">
                                    <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                    <select 
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF] appearance-none"
                                        value={specialForm.clientId}
                                        onChange={(e) => setSpecialForm({...specialForm, clientId: e.target.value})}
                                    >
                                        <option value="">Choisir un client...</option>
                                        {MOCK_CLIENTS.map(c => (
                                            <option key={c.id} value={c.id}>{c.name} ({c.address})</option>
                                        ))}
                                    </select>
                                    <ChevronRight size={18} className="absolute right-3 top-3.5 text-gray-400 rotate-90" />
                                </div>
                            </div>

                            {/* Waste Type & Price */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Type Déchet</label>
                                    <select 
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                        value={specialForm.wasteType}
                                        onChange={(e) => setSpecialForm({...specialForm, wasteType: e.target.value})}
                                    >
                                        <option>Plastique</option>
                                        <option>Métal / Ferraille</option>
                                        <option>Verre</option>
                                        <option>Carton</option>
                                        <option>Déchets Médicaux</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Prix / Kg (FC)</label>
                                    <input 
                                        type="number"
                                        className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-600 text-gray-500 outline-none cursor-not-allowed font-bold"
                                        value={specialForm.pricePerKg}
                                        readOnly
                                    />
                                </div>
                            </div>

                            {/* Weight Input (The core action) */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                                <label className="block text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                                    <Scale size={18} /> Poids Mesuré (Kg)
                                </label>
                                <input 
                                    type="number" 
                                    required
                                    autoFocus
                                    placeholder="0.0"
                                    className="w-full p-3 text-3xl font-bold text-center text-[#2962FF] bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 outline-none focus:border-[#2962FF] focus:ring-4 focus:ring-blue-500/20"
                                    value={specialForm.weight}
                                    onChange={(e) => setSpecialForm({...specialForm, weight: e.target.value})}
                                />
                            </div>

                            {/* Auto Calculation */}
                            <div className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                <span className="font-bold text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                    <Calculator size={18} /> Total Estimé
                                </span>
                                <span className="text-2xl font-bold text-[#00C853]">
                                    {(parseFloat(specialForm.weight || '0') * parseFloat(specialForm.pricePerKg)).toLocaleString()} FC
                                </span>
                            </div>

                            <button 
                                type="submit"
                                className="w-full py-4 bg-[#00C853] hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                            >
                                <Save size={20} /> Valider et Notifier
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
