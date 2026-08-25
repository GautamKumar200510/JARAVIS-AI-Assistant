import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Pin, 
  PinOff, 
  Trash2, 
  Edit3, 
  Tag, 
  Calendar,
  X,
  Check,
  Sparkles
} from 'lucide-react';
import { useJaravis } from '../context/JaravisContext';
import { soundFX } from '../services/sound';
import { Note } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

export const NotesView: React.FC = () => {
  const { notes, createNote, updateNote, deleteNote, togglePinNote, setActiveTab } = useJaravis();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  
  // Note Modal state
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteTagsInput, setNoteTagsInput] = useState<string>('');
  const [noteColor, setNoteColor] = useState<string>('cyan');

  // Collect all unique tags
  const allTags: string[] = Array.from(
    new Set(notes.flatMap((n) => n.tags || []))
  );

  const filteredNotes = notes.filter((note) => {
    const matchesTag = selectedTag === 'all' || note.tags.some(t => t.toLowerCase() === selectedTag.toLowerCase());
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTag && matchesSearch;
  });

  const openCreateModal = () => {
    soundFX.playClick();
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTagsInput('');
    setNoteColor('cyan');
    setModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    soundFX.playClick();
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTagsInput(note.tags.join(', '));
    setNoteColor(note.color || 'cyan');
    setModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const tags = noteTagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingNote) {
      await updateNote(editingNote.id, {
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        tags,
        color: noteColor
      });
    } else {
      await createNote({
        title: noteTitle.trim() || 'Untitled Note',
        content: noteContent.trim(),
        tags,
        color: noteColor,
        pinned: false
      });
    }

    setModalOpen(false);
  };

  return (
    <section 
      id="jaravis-notes-view"
      className="flex-1 flex flex-col h-full bg-[#09090b] overflow-hidden p-6 md:p-8"
    >
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveTab('command')}
            className="text-xs font-sans text-gray-400 hover:text-white flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 transition-colors cursor-pointer border border-white/5"
          >
            <span>← Home</span>
          </button>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight font-sans">
              Notes Vault
            </h2>
            <p className="text-xs text-gray-400 font-sans">
              Saved notes, code snippets and research records
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-100 text-black font-semibold rounded-full text-xs shadow-lg transition-all cursor-pointer w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by keyword or tag..."
            className="w-full h-11 bg-[#111114] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl pl-10 pr-4 text-xs md:text-sm text-gray-200 placeholder-gray-600 outline-none"
          />
        </div>

        {/* Tag pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              soundFX.playClick();
              setSelectedTag('all');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedTag === 'all'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                : 'bg-[#111114] text-gray-400 hover:text-gray-200 border border-[#1f1f23]'
            }`}
          >
            All Notes ({notes.length})
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                soundFX.playClick();
                setSelectedTag(tag);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedTag.toLowerCase() === tag.toLowerCase()
                  ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                  : 'bg-[#111114] text-gray-400 hover:text-gray-200 border border-[#1f1f23]'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="flex-1 overflow-y-auto pr-1">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-[#111114] border border-[#1f1f23] rounded-2xl">
            <BookOpen className="w-10 h-10 text-gray-600 mb-3" />
            <p className="text-sm font-medium text-gray-300">No notes in the vault</p>
            <p className="text-xs text-gray-500 mt-1 max-w-sm">
              Create a new note or tell JARAVIS "Save this as a note: ..." in the Command Hub.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`bg-[#111114] hover:bg-[#151518] border rounded-2xl p-5 transition-all shadow-xl flex flex-col justify-between group ${
                  note.pinned
                    ? 'border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    : 'border-[#1f1f23] hover:border-[#2d2d35]'
                }`}
              >
                {/* Note Top row */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-1.5">
                      {note.pinned && (
                        <span className="flex items-center space-x-1 text-[10px] font-mono text-cyan-400 uppercase bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          <Pin className="w-2.5 h-2.5 fill-cyan-400" />
                          <span>Pinned</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      {/* Pin Toggle */}
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          note.pinned
                            ? 'text-cyan-400 hover:bg-cyan-500/10'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-[#16161a]'
                        }`}
                        title={note.pinned ? 'Unpin note' : 'Pin note to top'}
                      >
                        {note.pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => openEditModal(note)}
                        className="p-1.5 text-gray-500 hover:text-cyan-400 rounded-lg hover:bg-[#16161a] transition-colors cursor-pointer"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 text-gray-500 hover:text-red-400 rounded-lg hover:bg-[#16161a] transition-colors cursor-pointer"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm md:text-base font-semibold text-white mb-2 leading-snug">
                    {note.title}
                  </h3>

                  {/* Content Preview */}
                  <div className="max-h-48 overflow-y-auto mb-4 text-xs md:text-sm text-gray-300">
                    <MarkdownRenderer content={note.content} />
                  </div>
                </div>

                {/* Footer tags and date */}
                <div className="pt-3 border-t border-[#1f1f23] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((t, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-cyan-400/90 font-mono bg-[#16161a] px-2 py-0.5 rounded border border-[#2d2d35]"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(note.updatedAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#111114] border border-[#2d2d35] w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <h3 className="text-base font-semibold text-white">
                {editingNote ? 'Edit Vault Note' : 'Create Vault Note'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Quantum Stabilization Parameters"
                  className="w-full h-10 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-sm text-white placeholder-gray-600 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">
                  Content (Markdown Supported)
                </label>
                <textarea
                  rows={6}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Enter detailed documentation, formulas, or logs..."
                  className="w-full bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl p-3.5 text-sm text-white placeholder-gray-600 outline-none resize-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-gray-400 uppercase mb-1">
                  Tags (Comma Separated)
                </label>
                <input
                  type="text"
                  value={noteTagsInput}
                  onChange={(e) => setNoteTagsInput(e.target.value)}
                  placeholder="Physics, Formula, Telemetry"
                  className="w-full h-10 bg-[#16161a] border border-[#1f1f23] focus:border-cyan-500/40 rounded-xl px-3.5 text-sm text-white placeholder-gray-600 outline-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-[#1f1f23]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-[#16161a] hover:bg-[#1f1f26] text-gray-400 hover:text-white rounded-xl text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold rounded-xl text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  {editingNote ? 'Update Note' : 'Save to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
