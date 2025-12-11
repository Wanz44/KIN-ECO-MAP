
import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Plus, Video, Edit2, Trash2, Save, X, Check, HelpCircle, Layout, ListChecks } from 'lucide-react';
import { Course, QuizQuestion } from '../types';

interface AdminAcademyProps {
    onBack: () => void;
    onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const MOCK_COURSES: Course[] = [
    { 
        id: '1', 
        title: 'Recyclage 101', 
        description: 'Les bases du tri et du recyclage', 
        progress: 0, 
        icon: 'recycle', 
        color: 'bg-green-100 text-green-600', 
        status: 'published', 
        videoUrl: 'https://youtube.com/...',
        quiz: [
            { id: 'q1', question: 'Quelle couleur pour le plastique ?', options: ['Bleu', 'Jaune', 'Vert', 'Rouge'], correctIndex: 0 },
            { id: 'q2', question: 'Le verre est-il recyclable ?', options: ['Oui, à l\'infini', 'Non', 'Une seule fois', 'Seulement le vert'], correctIndex: 0 }
        ]
    },
    { id: '2', title: 'Compostage Maison', description: 'Transformer l\'organique en or', progress: 0, icon: 'leaf', color: 'bg-amber-100 text-amber-600', status: 'draft', videoUrl: 'https://youtube.com/...', quiz: [] },
    { id: '3', title: 'Réduction Déchets', description: 'Stratégies zéro déchet', progress: 0, icon: 'trash', color: 'bg-blue-100 text-blue-600', status: 'published', videoUrl: 'https://youtube.com/...', quiz: [] },
];

export const AdminAcademy: React.FC<AdminAcademyProps> = ({ onBack, onToast }) => {
    const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
    const [showEditModal, setShowEditModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'quiz'>('details');
    
    // Form State
    const [currentCourse, setCurrentCourse] = useState<Partial<Course>>({
        title: '',
        description: '',
        videoUrl: '',
        status: 'draft',
        icon: 'book',
        color: 'bg-blue-100 text-blue-600',
        quiz: []
    });

    // Quiz Question Form
    const [newQuestion, setNewQuestion] = useState<Partial<QuizQuestion>>({
        question: '',
        options: ['', '', '', ''],
        correctIndex: 0
    });

    const handleSaveCourse = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isEditing && currentCourse.id) {
            setCourses(prev => prev.map(c => c.id === currentCourse.id ? { ...c, ...currentCourse } as Course : c));
            if (onToast) onToast("Cours mis à jour avec succès", "success");
        } else {
            const newCourse: Course = {
                id: Date.now().toString(),
                title: currentCourse.title || 'Nouveau Cours',
                description: currentCourse.description || '',
                videoUrl: currentCourse.videoUrl || '',
                status: currentCourse.status || 'draft',
                icon: currentCourse.icon || 'book',
                color: currentCourse.color || 'bg-gray-100 text-gray-600',
                progress: 0,
                quiz: currentCourse.quiz || []
            };
            setCourses([newCourse, ...courses]);
            if (onToast) onToast("Nouveau cours créé", "success");
        }
        setShowEditModal(false);
        resetForm();
    };

    const handleDelete = (id: string) => {
        if (confirm("Supprimer ce cours définitivement ?")) {
            setCourses(prev => prev.filter(c => c.id !== id));
            if (onToast) onToast("Cours supprimé", "success");
        }
    };

    const toggleStatus = (id: string) => {
        setCourses(prev => prev.map(c => {
            if (c.id === id) {
                const newStatus = c.status === 'published' ? 'draft' : 'published';
                if (onToast) onToast(`Cours ${newStatus === 'published' ? 'publié' : 'mis en brouillon'}`, "info");
                return { ...c, status: newStatus };
            }
            return c;
        }));
    };

    const openEdit = (course: Course) => {
        setCurrentCourse(course);
        setIsEditing(true);
        setShowEditModal(true);
        setActiveTab('details');
    };

    const resetForm = () => {
        setCurrentCourse({
            title: '',
            description: '',
            videoUrl: '',
            status: 'draft',
            icon: 'book',
            color: 'bg-blue-100 text-blue-600',
            quiz: []
        });
        setIsEditing(false);
        setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0 });
    };

    // --- Quiz Logic ---
    const handleAddQuestion = () => {
        if (!newQuestion.question || newQuestion.options?.some(o => !o)) {
            alert("Veuillez remplir la question et toutes les options.");
            return;
        }

        const question: QuizQuestion = {
            id: Date.now().toString(),
            question: newQuestion.question!,
            options: newQuestion.options as string[],
            correctIndex: newQuestion.correctIndex || 0
        };

        setCurrentCourse(prev => ({
            ...prev,
            quiz: [...(prev.quiz || []), question]
        }));

        setNewQuestion({ question: '', options: ['', '', '', ''], correctIndex: 0 });
        if (onToast) onToast("Question ajoutée au quiz", "success");
    };

    const handleDeleteQuestion = (qId: string) => {
        setCurrentCourse(prev => ({
            ...prev,
            quiz: prev.quiz?.filter(q => q.id !== qId)
        }));
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...(newQuestion.options || [])];
        newOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    return (
        <div className="flex flex-col h-full bg-[#F5F7FA] dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between sticky top-0 z-10 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <ArrowLeft size={20} className="text-gray-600 dark:text-gray-300" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Gestion Academy</h2>
                </div>
                <button 
                    onClick={() => { resetForm(); setShowEditModal(true); }}
                    className="bg-[#2962FF] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                >
                    <Plus size={18} /> Ajouter Cours
                </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {courses.map(course => (
                        <div key={course.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${course.color} bg-opacity-20`}>
                                    <BookOpen size={24} />
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <button 
                                        onClick={() => toggleStatus(course.id)}
                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md transition-colors ${course.status === 'published' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                    >
                                        {course.status === 'published' ? 'Publié' : 'Brouillon'}
                                    </button>
                                    {course.quiz && course.quiz.length > 0 && (
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-md font-bold flex items-center gap-1">
                                            <ListChecks size={10} /> {course.quiz.length} Questions
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">{course.title}</h3>
                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                            
                            {course.videoUrl && (
                                <div className="flex items-center gap-2 text-xs text-blue-600 mb-4 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                    <Video size={14} /> Vidéo incluse
                                </div>
                            )}

                            <div className="flex gap-2 border-t border-gray-50 dark:border-gray-700 pt-4">
                                <button 
                                    onClick={() => openEdit(course)}
                                    className="flex-1 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                                >
                                    <Edit2 size={14} /> Modifier
                                </button>
                                <button 
                                    onClick={() => handleDelete(course.id)}
                                    className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowEditModal(false)}></div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl p-0 relative z-10 shadow-2xl animate-fade-in-up max-h-[90vh] flex flex-col overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-750">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{isEditing ? 'Modifier le cours' : 'Nouveau Cours'}</h3>
                            <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-100 dark:border-gray-700">
                            <button 
                                onClick={() => setActiveTab('details')}
                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'details' ? 'text-[#2962FF] border-b-2 border-[#2962FF]' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                Détails du Cours
                            </button>
                            <button 
                                onClick={() => setActiveTab('quiz')}
                                className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'quiz' ? 'text-[#2962FF] border-b-2 border-[#2962FF]' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                            >
                                Quiz & Évaluation
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            
                            {/* --- TAB DETAILS --- */}
                            {activeTab === 'details' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Titre du cours</label>
                                        <input 
                                            required
                                            type="text"
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                            value={currentCourse.title}
                                            onChange={e => setCurrentCourse({...currentCourse, title: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                        <textarea 
                                            required
                                            rows={3}
                                            className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF] resize-none"
                                            value={currentCourse.description}
                                            onChange={e => setCurrentCourse({...currentCourse, description: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lien Vidéo (YouTube)</label>
                                        <div className="relative">
                                            <Video size={18} className="absolute left-3 top-3.5 text-gray-400" />
                                            <input 
                                                type="url"
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                                placeholder="https://youtube.com/..."
                                                value={currentCourse.videoUrl}
                                                onChange={e => setCurrentCourse({...currentCourse, videoUrl: e.target.value})}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icône</label>
                                            <select 
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                                value={currentCourse.icon}
                                                onChange={e => setCurrentCourse({...currentCourse, icon: e.target.value})}
                                            >
                                                <option value="book">Livre</option>
                                                <option value="recycle">Recyclage</option>
                                                <option value="leaf">Feuille</option>
                                                <option value="trash">Poubelle</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                                            <select 
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-[#2962FF]"
                                                value={currentCourse.status}
                                                onChange={e => setCurrentCourse({...currentCourse, status: e.target.value as any})}
                                            >
                                                <option value="draft">Brouillon</option>
                                                <option value="published">Publié</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- TAB QUIZ --- */}
                            {activeTab === 'quiz' && (
                                <div className="space-y-6">
                                    {/* Existing Questions List */}
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Questions Existantes ({currentCourse.quiz?.length || 0})</h4>
                                        {currentCourse.quiz?.length === 0 && (
                                            <p className="text-sm text-gray-400 italic">Aucune question ajoutée pour le moment.</p>
                                        )}
                                        {currentCourse.quiz?.map((q, idx) => (
                                            <div key={q.id} className="bg-gray-50 dark:bg-gray-750 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-start">
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-white text-sm mb-1">
                                                        <span className="text-blue-500 mr-2">Q{idx + 1}.</span>{q.question}
                                                    </p>
                                                    <p className="text-xs text-green-600 dark:text-green-400">
                                                        Réponse : {q.options[q.correctIndex]}
                                                    </p>
                                                </div>
                                                <button 
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                    className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add New Question Form */}
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                                        <h4 className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                            <Plus size={16} /> Ajouter une question
                                        </h4>
                                        <div className="space-y-3">
                                            <input 
                                                type="text" 
                                                placeholder="Intitulé de la question..."
                                                className="w-full p-2.5 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800 text-sm outline-none focus:ring-1 focus:ring-blue-500"
                                                value={newQuestion.question}
                                                onChange={e => setNewQuestion({...newQuestion, question: e.target.value})}
                                            />
                                            
                                            <div className="grid grid-cols-2 gap-2">
                                                {newQuestion.options?.map((opt, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <input 
                                                            type="radio" 
                                                            name="correctAnswer"
                                                            checked={newQuestion.correctIndex === idx}
                                                            onChange={() => setNewQuestion({...newQuestion, correctIndex: idx})}
                                                            className="accent-blue-500 cursor-pointer"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder={`Option ${idx + 1}`}
                                                            className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs outline-none focus:ring-1 focus:ring-blue-500"
                                                            value={opt}
                                                            onChange={e => updateOption(idx, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                            </div>

                                            <button 
                                                type="button" 
                                                onClick={handleAddQuestion}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                                            >
                                                Ajouter au Quiz
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3">
                            <button 
                                onClick={() => setShowEditModal(false)}
                                className="px-5 py-2.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleSaveCourse}
                                className="px-5 py-2.5 rounded-xl font-bold bg-[#00C853] text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-200 dark:shadow-none flex items-center gap-2"
                            >
                                <Save size={18} /> Enregistrer Tout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
