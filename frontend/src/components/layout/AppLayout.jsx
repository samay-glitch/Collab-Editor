import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import * as docApi from '../../api/documentApi';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const [documents, setDocuments] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();

  const fetchDocuments = async () => {
    try {
      const res = await docApi.getDocuments();
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleCreateDocument = async () => {
    setIsCreating(true);
    try {
      const res = await docApi.createDocument('Untitled Document');
      toast.success('Document created');
      await fetchDocuments();
      navigate(`/editor/${res.data._id}`);
    } catch (err) {
      toast.error('Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const updateLocalDocumentTitle = (id, newTitle) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc._id === id ? { ...doc, title: newTitle } : doc))
    );
  };

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          documents={documents}
          onCreateDoc={handleCreateDocument}
          isLoading={isCreating}
        />
        <main className="flex-1 overflow-auto bg-dark-900/40 relative">
          <Outlet context={{ fetchDocuments, updateLocalDocumentTitle }} />
        </main>
      </div>
    </div>
  );
}
