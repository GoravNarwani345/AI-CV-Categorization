import React from 'react';
import { FaTimes, FaDownload, FaExternalLinkAlt, FaFileAlt } from 'react-icons/fa';

const CVViewerModal = ({ isOpen, onClose, cvUrl, candidateName }) => {
    if (!isOpen) return null;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const API_BASE = API_URL.replace('/api', '');

    const fullCvUrl = cvUrl.startsWith('http')
        ? cvUrl
        : `${API_BASE}${cvUrl.startsWith('/') ? cvUrl : `/${cvUrl}`}`;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-8 bg-black/70 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-full max-h-[95vh] rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative border border-white/20">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 p-5 flex justify-between items-center z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <FaFileAlt size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 leading-tight">{candidateName}'s CV</h3>
                            <p className="text-sm text-gray-500 font-medium">Professional Document Preview</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={fullCvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all group"
                            title="Open Original"
                        >
                            <FaExternalLinkAlt size={18} className="group-hover:scale-110 transition-transform" />
                        </a>
                        <a
                            href={fullCvUrl}
                            download
                            className="p-3 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-2xl transition-all group"
                            title="Download PDF"
                        >
                            <FaDownload size={18} className="group-hover:translate-y-0.5 transition-transform" />
                        </a>
                        <div className="w-px h-8 bg-gray-100 mx-2"></div>
                        <button
                            onClick={onClose}
                            className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all group"
                        >
                            <FaTimes size={24} className="group-rotate-90 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Content - PDF Viewer */}
                <div className="flex-1 bg-gray-50 flex items-center justify-center relative inner-shadow">
                    <iframe
                        src={`${fullCvUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                        className="w-full h-full border-none shadow-inner"
                        title={`CV Viewer - ${candidateName}`}
                    />

                    {/* Fallback & Loading overlay (hidden by PDF but visible if failing) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center -z-10 bg-gray-50 space-y-4">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-500 animate-spin"></div>
                        </div>
                        <p className="text-gray-400 font-medium italic">Preparing document preview...</p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-100 p-4 px-8 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Secure Document Server
                    </div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-black">
                        AI Categorization System • Native Document Engine
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CVViewerModal;
