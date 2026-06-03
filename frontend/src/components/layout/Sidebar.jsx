import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, Search, File, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Button from '../common/Button';
import { formatRelativeTime } from '../../utils/formatDate';

export default function Sidebar({ documents = [], onCreateDoc, isLoading = false }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const { id: activeId } = useParams();

  // Auto-close sidebar on mobile when a document is selected
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on mobile when navigating to a document
  useEffect(() => {
    if (window.innerWidth < 768 && activeId) {
      setIsOpen(false);
    }
  }, [activeId]);

  const filteredDocs = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="relative flex">
        <div
          className={`${
            isOpen ? 'w-64 translate-x-0' : 'w-0 -translate-x-full md:translate-x-0 overflow-hidden'
          } bg-dark-900 border-r border-dark-700 flex flex-col h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out fixed md:relative z-40 md:z-auto`}
        >
          {/* Mobile close button */}
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute top-3 right-3 p-1.5 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 z-50"
          >
            <X size={16} />
          </button>

          <div className="p-4 border-b border-dark-700">
            <Button
              onClick={onCreateDoc}
              className="w-full flex items-center justify-center gap-2"
              isLoading={isLoading}
            >
              <Plus size={16} />
              New Document
            </Button>
          </div>

          <div className="px-4 py-3 border-b border-dark-700 relative">
            <span className="absolute left-7 top-1/2 -translate-y-1/2 text-dark-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-xs text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => {
                const isActive = doc._id === activeId;
                return (
                  <Link
                    key={doc._id}
                    to={`/editor/${doc._id}`}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all duration-150 ${
                      isActive
                        ? 'bg-primary-950/40 border border-primary-800 text-primary-200'
                        : 'hover:bg-dark-800 text-dark-300 hover:text-dark-100 border border-transparent'
                    }`}
                  >
                    <File size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-primary-400' : 'text-dark-500'}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold truncate leading-normal">{doc.title}</p>
                      <span className="text-[10px] text-dark-500">{formatRelativeTime(doc.updatedAt)}</span>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-8 text-dark-500 text-xs">
                No documents found
              </div>
            )}
          </div>
        </div>

        {/* Toggle button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute top-1/2 -translate-y-1/2 -right-3 z-50 w-6 h-6 bg-dark-800 border border-dark-600 rounded-full flex items-center justify-center text-dark-400 hover:text-dark-100 shadow-md transition-all duration-200 hover:bg-dark-700 hidden md:flex"
        >
          {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Mobile hamburger toggle */}
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden fixed bottom-6 left-6 z-50 w-12 h-12 bg-primary-600 hover:bg-primary-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-primary-600/30 transition-all duration-200"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </>
  );
}
