import React, { useState, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import useDocument from '../hooks/useDocument';
import useCursorPresence from '../hooks/useCursorPresence';
import Toolbar from '../components/editor/Toolbar';
import Editor from '../components/editor/Editor';
import PresenceBar from '../components/editor/PresenceBar';
import TypingIndicator from '../components/editor/TypingIndicator';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import { UserPlus } from 'lucide-react';
import * as docApi from '../api/documentApi';

export default function EditorPage() {
  const { id } = useParams();
  const { fetchDocuments: refreshSidebar, updateLocalDocumentTitle } = useOutletContext();
  const {
    document,
    isLoading,
    isSaving,
    activeUsers,
    typingUsers,
    updateContent,
    updateTitle,
    saveDocument,
  } = useDocument(id);

  const { remoteCursors, broadcastCursor } = useCursorPresence(id);
  const [editor, setEditor] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [collaboratorEmail, setCollaboratorEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  const handleExport = () => {
    if (!document) return;
    const blob = new Blob([document.content], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement('a');
    link.href = url;
    const filename = `${document.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
    link.setAttribute('download', filename);
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    toast.success('Document downloaded to your computer');
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!collaboratorEmail) return;

    setIsInviting(true);
    try {
      await docApi.addCollaborator(id, collaboratorEmail);
      toast.success('Collaborator added successfully');
      setCollaboratorEmail('');
      setIsShareOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add collaborator');
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950/20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen flex items-center justify-center text-dark-300 bg-dark-950/20">
        Document not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-dark-950/10">
      {/* Title bar with presence */}
      <div className="h-14 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <input
            type="text"
            value={document.title}
            onChange={(e) => {
              const newTitle = e.target.value;
              updateTitle(newTitle);
              if (updateLocalDocumentTitle) {
                updateLocalDocumentTitle(id, newTitle);
              }
            }}
            className="bg-transparent hover:bg-dark-800/60 focus:bg-dark-800 text-sm font-bold text-dark-100 rounded-lg px-2.5 py-1.5 focus:outline-none transition-all duration-200 truncate flex-1 border border-transparent focus:border-dark-600"
          />
        </div>

        <div className="flex items-center gap-6">
          <PresenceBar users={activeUsers} />
          <Button
            variant="secondary"
            onClick={() => setIsShareOpen(true)}
            className="flex items-center gap-2 text-xs py-1.5 px-3.5"
          >
            <UserPlus size={14} />
            Share
          </Button>
        </div>
      </div>

      {/* Rich text formatting toolbar */}
      <Toolbar editor={editor} isSaving={isSaving} onExport={handleExport} />

      {/* Tiptap editor */}
      <Editor
        onReady={setEditor}
        value={document.content}
        onChange={updateContent}
        onCursorMove={broadcastCursor}
        remoteCursors={remoteCursors}
      />

      {/* Typing indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Share dialog */}
      <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} title="Share Document">
        <form onSubmit={handleShare} className="space-y-4">
          <p className="text-xs text-dark-400">
            Enter the email address of the user you want to collaborate with. They must have an account.
          </p>
          <Input
            label="Email Address"
            type="email"
            placeholder="collaborator@example.com"
            value={collaboratorEmail}
            onChange={(e) => setCollaboratorEmail(e.target.value)}
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="secondary" type="button" onClick={() => setIsShareOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isInviting}>
              Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
