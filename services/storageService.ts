import { db } from '../db';
import { User, Note, Feedback, UserRole } from '../types';

// Helper to map DB snake_case to TS camelCase
const mapUser = (row: any): User => ({
  id: row.id,
  name: row.name,
  username: row.username,
  role: row.role as UserRole,
  level: row.level || undefined
});

const mapNote = (row: any): Note => ({
  id: row.id,
  teacherId: row.teacher_id,
  studentId: row.student_id,
  title: row.title,
  content: row.content,
  createdAt: new Date(row.created_at).toISOString(),
  tags: row.tags || []
});

const mapFeedback = (row: any): Feedback => ({
  id: row.id,
  noteId: row.note_id,
  studentId: row.student_id,
  content: row.content,
  createdAt: new Date(row.created_at).toISOString(),
  isRead: row.is_read
});

export const storageService = {
  // Initialize Database Schema
  init: async () => {
    // We propagate the error so the UI can show a failure message
    await db.initSchema();
    console.log('Database initialized successfully');
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const res = await db.query('SELECT * FROM users');
      return res.rows.map(mapUser);
    } catch (e) {
      console.error("Failed to fetch users", e);
      throw e; // Throw so we know if DB is broken
    }
  },
  
  saveUser: async (user: User): Promise<void> => {
    await db.query(
      `INSERT INTO users (id, name, username, role, level)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         username = EXCLUDED.username,
         role = EXCLUDED.role,
         level = EXCLUDED.level`,
      [user.id, user.name, user.username, user.role, user.level]
    );
  },

  deleteUser: async (id: string): Promise<void> => {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  },

  getNotes: async (): Promise<Note[]> => {
    try {
      const res = await db.query('SELECT * FROM notes ORDER BY created_at DESC');
      return res.rows.map(mapNote);
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  
  saveNote: async (note: Note): Promise<void> => {
    await db.query(
      `INSERT INTO notes (id, teacher_id, student_id, title, content, created_at, tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         teacher_id = EXCLUDED.teacher_id,
         student_id = EXCLUDED.student_id,
         title = EXCLUDED.title,
         content = EXCLUDED.content,
         created_at = EXCLUDED.created_at,
         tags = EXCLUDED.tags`,
       [note.id, note.teacherId, note.studentId, note.title, note.content, note.createdAt, note.tags]
    );
  },

  deleteNote: async (id: string): Promise<void> => {
    await db.query('DELETE FROM notes WHERE id = $1', [id]);
  },

  getFeedback: async (): Promise<Feedback[]> => {
    try {
      const res = await db.query('SELECT * FROM feedback ORDER BY created_at DESC');
      return res.rows.map(mapFeedback);
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  
  saveFeedback: async (feedback: Feedback): Promise<void> => {
    await db.query(
        `INSERT INTO feedback (id, note_id, student_id, content, created_at, is_read)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [feedback.id, feedback.noteId, feedback.studentId, feedback.content, feedback.createdAt, feedback.isRead]
    );
  },
  
  markFeedbackRead: async (id: string): Promise<void> => {
     await db.query('UPDATE feedback SET is_read = TRUE WHERE id = $1', [id]);
  }
};