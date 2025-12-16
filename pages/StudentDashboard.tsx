import React, { useState, useEffect } from 'react';
import { User, Note, Feedback } from '../types';
import { storageService } from '../services/storageService';
import { Button, Card, TextArea, Modal } from '../components/UI';
import { Icons } from '../components/Icons';

interface StudentDashboardProps {
  currentUser: User;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ currentUser }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    refreshData();
  }, [currentUser.id]);

  const refreshData = () => {
    const allNotes = storageService.getNotes();
    // Filter notes specifically for this student
    setNotes(allNotes.filter(n => n.studentId === currentUser.id).sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setFeedbacks(storageService.getFeedback().filter(f => f.studentId === currentUser.id));
  };

  const handleSubmitQuestion = () => {
    if (!selectedNote || !feedbackContent.trim()) return;

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      noteId: selectedNote.id,
      studentId: currentUser.id,
      content: feedbackContent,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    storageService.saveFeedback(newFeedback);
    setFeedbackContent('');
    refreshData();
    // Keep modal open so they can see their question added effectively (or close it)
    // For now, let's close it to be clean
    setSelectedNote(null); 
    alert('Question sent to your teacher!');
  };

  // Helper to check if a note has pending questions
  const getNoteFeedbackCount = (noteId: string) => {
      return feedbacks.filter(f => f.noteId === noteId).length;
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl pb-20">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-indigo-900">Student Portal</h1>
        <p className="text-gray-500">Welcome, {currentUser.name}. Here are your class notes.</p>
        <div className="mt-2 inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
            Current Level: {currentUser.level}
        </div>
      </header>

      <div className="grid gap-6">
        {notes.length === 0 && (
            <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                <Icons.Book />
                <p className="mt-2 text-gray-500">No notes assigned to you yet.</p>
            </div>
        )}

        {notes.map(note => {
          const questionCount = getNoteFeedbackCount(note.id);
          
          return (
            <Card key={note.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{note.title}</h2>
                    <p className="text-sm text-gray-500">{new Date(note.createdAt).toLocaleDateString()}</p>
                  </div>
                  {questionCount > 0 && (
                      <span className="flex items-center text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          <span className="mr-1"><Icons.MessageCircle /></span> {questionCount} Question(s) asked
                      </span>
                  )}
                </div>
                
                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {note.content}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button onClick={() => setSelectedNote(note)}>
                    Ask a Question
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Question Modal */}
      <Modal 
        isOpen={!!selectedNote} 
        onClose={() => setSelectedNote(null)} 
        title={`Ask about "${selectedNote?.title}"`}
      >
        <div className="space-y-4">
            <p className="text-sm text-gray-600">
                Is something unclear? Ask your teacher a question about this note.
            </p>
            <TextArea 
                rows={5}
                placeholder="Teacher, I didn't understand the part about..."
                value={feedbackContent}
                onChange={e => setFeedbackContent(e.target.value)}
            />
            <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setSelectedNote(null)}>Cancel</Button>
                <Button onClick={handleSubmitQuestion} disabled={!feedbackContent.trim()}>Send Question</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
