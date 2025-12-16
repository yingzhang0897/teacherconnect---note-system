import React, { useState, useEffect } from 'react';
import { User, Note, Feedback, UserRole } from '../types';
import { storageService } from '../services/storageService';
import { geminiService } from '../services/geminiService';
import { Button, Input, TextArea, Card, Modal } from '../components/UI';
import { Icons } from '../components/Icons';

interface TeacherDashboardProps {
  currentUser: User;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'students' | 'notes' | 'feedback'>('notes');
  const [students, setStudents] = useState<User[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  
  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  
  // Form State
  const [editingStudent, setEditingStudent] = useState<Partial<User>>({});
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});
  const [aiLoading, setAiLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setDataLoading(true);
    const [allUsers, allNotes, allFeedbacks] = await Promise.all([
        storageService.getUsers(),
        storageService.getNotes(),
        storageService.getFeedback()
    ]);
    
    setStudents(allUsers.filter(u => u.role === UserRole.STUDENT));
    setNotes(allNotes.filter(n => n.teacherId === currentUser.id));
    setFeedbacks(allFeedbacks);
    setDataLoading(false);
  };

  // --- Student Management ---
  const handleSaveStudent = async () => {
    if (!editingStudent.name || !editingStudent.username) return;
    
    const newStudent: User = {
      id: editingStudent.id || Date.now().toString(),
      name: editingStudent.name,
      username: editingStudent.username,
      role: UserRole.STUDENT,
      level: editingStudent.level || 'A1'
    };
    
    await storageService.saveUser(newStudent);
    setIsStudentModalOpen(false);
    setEditingStudent({});
    refreshData();
  };

  const handleDeleteStudent = async (id: string) => {
    if (confirm('Are you sure you want to remove this student?')) {
      await storageService.deleteUser(id);
      refreshData();
    }
  };

  // --- Note Management ---
  const handleSaveNote = async () => {
    if (!editingNote.title || !editingNote.content || !editingNote.studentId) return;

    const newNote: Note = {
      id: editingNote.id || Date.now().toString(),
      teacherId: currentUser.id,
      studentId: editingNote.studentId,
      title: editingNote.title,
      content: editingNote.content,
      createdAt: editingNote.createdAt || new Date().toISOString(),
      tags: editingNote.tags || []
    };

    await storageService.saveNote(newNote);
    setIsNoteModalOpen(false);
    setEditingNote({});
    refreshData();
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm('Delete this note?')) {
      await storageService.deleteNote(id);
      refreshData();
    }
  };

  const handleEnhanceWithAI = async () => {
    if (!editingNote.content || !editingNote.studentId) return;
    
    const student = students.find(s => s.id === editingNote.studentId);
    const level = student?.level || 'Intermediate';

    setAiLoading(true);
    const enhanced = await geminiService.enhanceNote(editingNote.content, level);
    setEditingNote(prev => ({ ...prev, content: enhanced }));
    setAiLoading(false);
  };
  
  const handleGenerateQuestions = async () => {
      if (!editingNote.content) return;
      setAiLoading(true);
      const questions = await geminiService.generatePracticeQuestions(editingNote.content);
      setEditingNote(prev => ({ ...prev, content: prev.content + "\n\n**Practice Questions:**\n" + questions }));
      setAiLoading(false);
  }

  // --- Render Helpers ---

  const renderStudentList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">My Students</h2>
        <Button onClick={() => { setEditingStudent({}); setIsStudentModalOpen(true); }}>
          <span className="mr-2"><Icons.Plus /></span> Add Student
        </Button>
      </div>
      {dataLoading ? <p>Loading...</p> : (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.map(s => (
          <Card key={s.id} className="p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-center justify-between mb-2">
                 <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                    {s.name.charAt(0)}
                 </div>
                 <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">{s.level}</span>
              </div>
              <h3 className="font-bold text-lg text-gray-900">{s.name}</h3>
              <p className="text-gray-500 text-sm">Username: {s.username}</p>
            </div>
            <div className="mt-4 flex gap-2 justify-end">
              <Button size="sm" variant="secondary" onClick={() => { setEditingStudent(s); setIsStudentModalOpen(true); }}>
                <Icons.Edit />
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleDeleteStudent(s.id)}>
                <Icons.Trash />
              </Button>
            </div>
          </Card>
        ))}
      </div>
      )}
    </div>
  );

  const renderNoteList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Class Notes</h2>
        <Button onClick={() => { setEditingNote({}); setIsNoteModalOpen(true); }}>
          <span className="mr-2"><Icons.Plus /></span> Create Note
        </Button>
      </div>
      <div className="space-y-3">
        {dataLoading && <p>Loading notes...</p>}
        {!dataLoading && notes.length === 0 && <p className="text-gray-500 text-center py-10">No notes created yet.</p>}
        {notes.map(n => {
          const student = students.find(s => s.id === n.studentId);
          return (
            <Card key={n.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                   <h3 className="font-bold text-gray-900">{n.title}</h3>
                   <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">For: {student?.name || 'Unknown'}</span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{n.content}</p>
                <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleDateString()}</div>
              </div>
              <div className="flex gap-2 shrink-0">
                 <Button size="sm" variant="secondary" onClick={() => { setEditingNote(n); setIsNoteModalOpen(true); }}>Edit</Button>
                 <Button size="sm" variant="danger" onClick={() => handleDeleteNote(n.id)}><Icons.Trash /></Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderFeedbackList = () => {
    // Filter feedback relevant to this teacher's notes
    const myNoteIds = notes.map(n => n.id);
    const myFeedbacks = feedbacks.filter(f => myNoteIds.includes(f.noteId));

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Student Questions & Feedback</h2>
            {dataLoading && <p>Loading feedback...</p>}
            {!dataLoading && myFeedbacks.length === 0 && <p className="text-gray-500">No feedback yet.</p>}
            <div className="space-y-3">
                {myFeedbacks.map(f => {
                    const note = notes.find(n => n.id === f.noteId);
                    const student = students.find(s => s.id === f.studentId);
                    return (
                        <Card key={f.id} className={`p-4 ${!f.isRead ? 'border-l-4 border-l-indigo-500' : ''}`}>
                             <div className="flex justify-between items-start">
                                 <div>
                                     <div className="flex items-center gap-2 mb-2">
                                         <span className="font-bold text-gray-900">{student?.name}</span>
                                         <span className="text-sm text-gray-500">on "{note?.title}"</span>
                                         {!f.isRead && <span className="bg-indigo-100 text-indigo-800 text-xs px-2 rounded-full">New</span>}
                                     </div>
                                     <p className="text-gray-800 bg-gray-50 p-3 rounded-lg text-sm">{f.content}</p>
                                 </div>
                                 {!f.isRead && (
                                     <Button size="sm" variant="ghost" onClick={async () => {
                                         await storageService.markFeedbackRead(f.id);
                                         refreshData();
                                     }}>Mark Read</Button>
                                 )}
                             </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl pb-20">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-bold text-indigo-900">Teacher Dashboard</h1>
            <p className="text-gray-500">Welcome back, {currentUser.name}</p>
         </div>
         <div className="flex gap-2">
             <Button size="sm" variant="secondary" onClick={refreshData} isLoading={dataLoading}>
                 Refresh Data
             </Button>
         </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
        {(['students', 'notes', 'feedback'] as const).map(tab => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm capitalize whitespace-nowrap ${
                    activeTab === tab 
                    ? 'border-b-2 border-indigo-600 text-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
            >
                {tab}
            </button>
        ))}
      </div>

      {activeTab === 'students' && renderStudentList()}
      {activeTab === 'notes' && renderNoteList()}
      {activeTab === 'feedback' && renderFeedbackList()}

      {/* Student Modal */}
      <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title={editingStudent.id ? "Edit Student" : "Add Student"}>
        <div className="space-y-4">
            <Input 
                label="Full Name" 
                value={editingStudent.name || ''} 
                onChange={e => setEditingStudent({...editingStudent, name: e.target.value})} 
            />
            <Input 
                label="Username" 
                type="text"
                value={editingStudent.username || ''} 
                onChange={e => setEditingStudent({...editingStudent, username: e.target.value})} 
            />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select 
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
                    value={editingStudent.level || 'A1'}
                    onChange={e => setEditingStudent({...editingStudent, level: e.target.value})}
                >
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setIsStudentModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveStudent}>Save Student</Button>
            </div>
        </div>
      </Modal>

      {/* Note Modal */}
      <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={editingNote.id ? "Edit Note" : "Create Note"}>
        <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select 
                    className="w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white"
                    value={editingNote.studentId || ''}
                    onChange={e => setEditingNote({...editingNote, studentId: e.target.value})}
                >
                    <option value="">Select a student...</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.level})</option>)}
                </select>
            </div>
            <Input 
                label="Topic / Title" 
                value={editingNote.title || ''} 
                onChange={e => setEditingNote({...editingNote, title: e.target.value})} 
            />
            <TextArea 
                label="Content" 
                rows={8}
                value={editingNote.content || ''} 
                onChange={e => setEditingNote({...editingNote, content: e.target.value})} 
            />
            
            {/* AI Tools */}
            <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button 
                    type="button" 
                    size="sm" 
                    variant="secondary" 
                    isLoading={aiLoading} 
                    onClick={handleEnhanceWithAI}
                    disabled={!editingNote.content || !editingNote.studentId}
                    className="flex items-center"
                >
                    <span className="mr-1"><Icons.Sparkles /></span> AI Polish & Structure
                </Button>
                <Button 
                    type="button" 
                    size="sm" 
                    variant="secondary" 
                    isLoading={aiLoading} 
                    onClick={handleGenerateQuestions}
                    disabled={!editingNote.content}
                    className="flex items-center"
                >
                    <span className="mr-1"><Icons.Book /></span> AI Add Quiz
                </Button>
            </div>

            <div className="flex justify-end gap-2 mt-6">
                <Button variant="secondary" onClick={() => setIsNoteModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSaveNote}>Save Note</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};