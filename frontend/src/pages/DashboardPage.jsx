import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { FileText, Calendar, Trash2, ArrowRight } from 'lucide-react';
import * as docApi from '../api/documentApi';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';
import { formatRelativeTime } from '../utils/formatDate';

export default function DashboardPage() {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchDocuments: refreshSidebar } = useOutletContext();

  const fetchDocs = async () => {
    try {
      setIsLoading(true);
      const res = await docApi.getDocuments();
      setDocuments(res.data);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await docApi.deleteDocument(id);
      toast.success('Document deleted');
      await fetchDocs();
      refreshSidebar();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dark-100">Documents Dashboard</h1>
          <p className="text-xs text-dark-400 mt-1">Manage and access all your real-time collaborative files.</p>
        </div>
      </div>

      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Link
              key={doc._id}
              to={`/editor/${doc._id}`}
              className="group bg-dark-800/40 backdrop-blur-sm border border-dark-700/80 rounded-xl p-5 hover:bg-dark-800/80 hover:border-dark-600 transition-all duration-200 flex flex-col h-48 justify-between shadow-sm hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary-950/40 border border-primary-800 text-primary-400 rounded-lg group-hover:bg-primary-900 group-hover:text-primary-300 transition-colors">
                    <FileText size={20} />
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, doc._id)}
                    className="p-1.5 rounded-lg text-dark-500 hover:text-red-400 hover:bg-dark-700/50 transition-all duration-200"
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-dark-100 group-hover:text-primary-400 truncate transition-colors">
                  {doc.title}
                </h3>
                <p className="text-[11px] text-dark-400 truncate leading-snug">
                  {doc.content ? doc.content.substring(0, 80) : 'Empty document...'}
                </p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-dark-500 pt-3 border-t border-dark-700/50">
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  <span>Updated {formatRelativeTime(doc.updatedAt)}</span>
                </div>
                <span className="flex items-center gap-1 font-semibold group-hover:text-primary-400 transition-colors">
                  Open <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-dark-800/20 border border-dashed border-dark-700 rounded-2xl max-w-xl mx-auto space-y-4">
          <div className="inline-flex bg-dark-800 text-dark-400 p-4 rounded-full border border-dark-700">
            <FileText size={32} />
          </div>
          <h3 className="text-md font-bold text-dark-200">No documents yet</h3>
          <p className="text-xs text-dark-500 max-w-xs mx-auto">Create your first collaborative document using the button in the sidebar.</p>
        </div>
      )}
    </div>
  );
}
