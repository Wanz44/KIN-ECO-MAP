
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, ArrowLeft, BookOpen, Leaf, Recycle, Trash2, PlayCircle, MessageSquare, Play, CheckCircle, Clock, Sparkles, Zap, ChevronRight } from 'lucide-react';
import { Course, ChatMessage } from '../types';
import { sendMessageToGemini } from '../services/geminiService';

interface AcademyProps {
    onBack: () => void;
}

const COURSES: Course[] = [
    { 
        id: '1', 
        title: 'Recyclage 101', 
        description: 'Les bases du tri et du recyclage. Apprenez à distinguer les différents types de plastiques et l\'importance du nettoyage des contenants.', 
        progress: 30, 
        icon: 'recycle', 
        color: 'bg-green-100 text-green-600',
        videoUrl: 'https://www.youtube.com/watch?v=OasbYWF4_S8' // Exemple vidéo éducative
    },
    { id: '2', title: 'Compostage Maison', description: 'Transformer l\'organique en or pour vos plantes.', progress: 0, icon: 'leaf', color: 'bg-amber-100 text-amber-600' },
    { id: '3', title: 'Réduction Déchets', description: 'Stratégies zéro déchet au quotidien à Kinshasa.', progress: 80, icon: 'trash', color: 'bg-blue-100 text-blue-600' },
    { id: '4', title: 'Innovation Verte', description: 'Technologies propres à Kin et initiatives locales.', progress: 10, icon: 'book', color: 'bg-purple-100 text-purple-600' },
];

const AI_SUGGESTIONS = [
    "Comment trier les bouteilles en plastique ?",
    "Où jeter les piles usagées ?",
    "C'est quoi le compostage ?",
    "Horaire de passage du camion ?",
    "Idées pour réduire mes déchets",
    "Les déchets électroniques sont-ils dangereux ?",
    "Comment gagner plus de points ?",
];

export const Academy: React.FC<AcademyProps> = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState<'learn' | 'chat'>('learn');
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    
    // Chat State
    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: '0', sender: 'ai', text: 'Bonjour! Je suis Biso Peto AI. Posez-moi une question sur le recyclage, le compostage ou l\'écologie à Kinshasa!', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (activeTab === 'chat') scrollToBottom();
    }, [messages, activeTab]);

    const handleSendMessage = async (textOverride?: string) => {
        const textToSend = textOverride || inputValue;
        if (!textToSend.trim() || isLoading) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            sender: 'user',
            text: textToSend,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setShowSuggestions(false);
        setIsLoading(true);

        const aiResponseText = await sendMessageToGemini(textToSend);

        const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: aiResponseText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false);
    };

    const getIcon = (name: string) => {
        switch(name) {
            case 'recycle': return <Recycle size={24} />;
            case 'leaf': return <Leaf size={24} />;
            case 'trash': return <Trash2 size={24} />;
            default: return <BookOpen size={24} />;
        }
    };

    // Convertisseur simple pour l'embed YouTube
    const getEmbedUrl = (url?: string) => {
        if (!url) return null;
        if (url.includes('youtube.com/watch?v=')) {
            return url.replace('watch?v=', 'embed/');
        }
        if (url.includes('youtu.be/')) {
            return url.replace('youtu.be/', 'youtube.com/embed/');
        }
        return url; // Retourne l'URL telle quelle si ce n'est pas du YouTube standard (ou pour iframe générique)
    };

    const handleBackClick = () => {
        if (selectedCourse) {
            setSelectedCourse(null);
        } else {
            onBack();
        }
    };

    // Filtrer les suggestions
    const filteredSuggestions = AI_SUGGESTIONS.filter(s => 
        s.toLowerCase().includes(inputValue.toLowerCase()) && inputValue.length > 0
    );

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <button onClick={handleBackClick} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                    <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                </button>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {selectedCourse ? 'Détails du Cours' : 'BISO PETO Academy'}
                </h2>
            </div>

            {/* Tabs (Hidden when in Course Detail) */}
            {!selectedCourse && (
                <div className="flex p-4 gap-4">
                    <button 
                        onClick={() => setActiveTab('learn')}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'learn' ? 'bg-[#00C853] text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                    >
                        <BookOpen size={18} /> Cours & Vidéos
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'chat' ? 'bg-[#2962FF] text-white shadow-md' : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750'}`}
                    >
                        <Sparkles size={18} /> Chat IA
                    </button>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {activeTab === 'learn' ? (
                    selectedCourse ? (
                        /* --- COURSE DETAIL VIEW --- */
                        <div className="animate-fade-in space-y-6 pt-2">
                            {/* Video Section */}
                            <div className="bg-black rounded-2xl overflow-hidden shadow-lg aspect-video relative">
                                {selectedCourse.videoUrl ? (
                                    <iframe 
                                        src={getEmbedUrl(selectedCourse.videoUrl) || ''} 
                                        title={selectedCourse.title}
                                        className="w-full h-full"
                                        frameBorder="0" 
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-200 dark:bg-gray-800">
                                        <PlayCircle size={48} className="mb-2 opacity-50" />
                                        <span>Aucune vidéo disponible</span>
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedCourse.color} bg-opacity-20`}>
                                            {getIcon(selectedCourse.icon)}
                                        </div>
                                        <div>
                                            <h1 className="text-xl font-bold text-gray-800 dark:text-white">{selectedCourse.title}</h1>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                <Clock size={12} />
                                                <span>15 min</span>
                                                <span>•</span>
                                                <span>Débutant</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="radial-progress text-[#00C853] text-xs font-bold" style={{"--value":selectedCourse.progress, "--size": "3rem"} as any}>
                                        {selectedCourse.progress}%
                                    </div>
                                </div>

                                <h3 className="font-bold text-gray-800 dark:text-white mb-2">À propos de ce cours</h3>
                                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
                                    {selectedCourse.description}
                                    <br/><br/>
                                    Dans ce module, nous explorerons les meilleures pratiques pour gérer vos déchets à Kinshasa, comment réduire votre empreinte carbone et participer activement à l'assainissement de votre quartier.
                                </p>

                                <button className="w-full py-4 bg-[#2962FF] hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2">
                                    <Play size={20} fill="currentColor" />
                                    {selectedCourse.progress > 0 ? 'Reprendre le cours' : 'Commencer le cours'}
                                </button>
                            </div>

                            {/* Quiz Preview Section (Static for now) */}
                            <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-2xl border border-purple-100 dark:border-purple-800 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-purple-800 dark:text-purple-300">Quiz de validation</h4>
                                    <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Gagnez 50 points en réussissant le test !</p>
                                </div>
                                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-purple-700 transition-colors">
                                    Lancer
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* --- COURSE LIST VIEW --- */
                        <div className="space-y-6 animate-fade-in">
                            {/* Video Highlight (Static Promo) */}
                            <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg relative aspect-video flex items-center justify-center group cursor-pointer">
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors"></div>
                                <img src="https://picsum.photos/800/450?grayscale" alt="Video thumbnail" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
                                <div className="z-10 flex flex-col items-center text-white">
                                    <PlayCircle size={48} className="mb-2 opacity-90 group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-lg">Pourquoi trier ses déchets ?</span>
                                    <span className="text-xs opacity-80">3:45 min • Introduction</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-3">Mes Cours</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {COURSES.map(course => (
                                        <div 
                                            key={course.id} 
                                            onClick={() => setSelectedCourse(course)}
                                            className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-start cursor-pointer hover:shadow-md transition-all hover:border-[#00C853] group"
                                        >
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center mr-4 shrink-0 ${course.color} dark:bg-opacity-20 transition-transform group-hover:scale-105`}>
                                                {getIcon(course.icon)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-800 dark:text-white group-hover:text-[#00C853] transition-colors">{course.title}</h4>
                                                    {course.progress > 0 ? (
                                                        <span className="text-xs bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full text-green-700 dark:text-green-400 font-bold">{course.progress}%</span>
                                                    ) : (
                                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full text-gray-500 dark:text-gray-400 font-medium">Nouveau</span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">{course.description}</p>
                                                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div className="h-full bg-[#00C853] rounded-full transition-all duration-500" style={{ width: `${course.progress}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                ) : (
                    /* --- CHAT VIEW --- */
                    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-fade-in relative">
                        <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Bot size={18} />
                             </div>
                             <div>
                                 <h3 className="font-bold text-gray-700 dark:text-white text-sm">Assistant Biso Peto</h3>
                                 <p className="text-[10px] text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    En ligne
                                 </p>
                             </div>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                            {/* Empty State / Welcome Suggestions */}
                            {messages.length <= 1 && !isLoading && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <div className="p-4 bg-blue-100 dark:bg-blue-900/20 rounded-full text-[#2962FF] dark:text-blue-400 mb-2">
                                        <Sparkles size={32} />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                                        Je peux vous aider à trier, trouver des points de collecte ou comprendre l'impact écologique.
                                    </p>
                                    <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                                        {AI_SUGGESTIONS.slice(0, 4).map((suggestion, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSendMessage(suggestion)}
                                                className="text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 hover:border-[#2962FF] dark:hover:border-blue-500 text-gray-600 dark:text-gray-300 px-3 py-2 rounded-full transition-all flex items-center gap-1"
                                            >
                                                <Zap size={10} className="text-yellow-500" />
                                                {suggestion}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-scale-up`}>
                                    <div className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm relative group ${
                                        msg.sender === 'user' 
                                        ? 'bg-[#2962FF] text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-tl-none'
                                    }`}>
                                        {msg.text}
                                        <span className={`text-[9px] block text-right mt-1 opacity-60 ${msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                                        <Bot size={16} className="text-[#2962FF] animate-pulse" />
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 relative">
                            {/* Auto-complete Suggestions Dropdown */}
                            {inputValue.length > 0 && filteredSuggestions.length > 0 && (
                                <div className="absolute bottom-full left-0 right-0 mb-2 mx-3 bg-white dark:bg-gray-700 rounded-xl shadow-xl border border-gray-100 dark:border-gray-600 overflow-hidden z-20 max-h-48 overflow-y-auto">
                                    {filteredSuggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                setInputValue(suggestion);
                                                handleSendMessage(suggestion);
                                            }}
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-50 dark:border-gray-600 last:border-none flex items-center justify-between group"
                                        >
                                            {suggestion}
                                            <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#2962FF]" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-2 items-end">
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center px-4 py-2 focus-within:ring-2 focus-within:ring-[#00C853] transition-all border border-transparent focus-within:bg-white dark:focus-within:bg-gray-800">
                                    <input 
                                        type="text" 
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Posez une question..."
                                        className="flex-1 bg-transparent text-gray-800 dark:text-white border-none text-sm outline-none w-full"
                                        autoComplete="off"
                                    />
                                </div>
                                <button 
                                    onClick={() => handleSendMessage()}
                                    disabled={isLoading || !inputValue.trim()}
                                    className="bg-[#00C853] text-white p-3 rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center"
                                >
                                    <Send size={18} className={isLoading ? 'opacity-0' : ''} />
                                    {isLoading && <div className="absolute w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
