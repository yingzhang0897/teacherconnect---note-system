import { User, Note, Feedback, UserRole } from '../types';

const STORAGE_KEYS = {
  USERS: 'teacherconnect_users',
  NOTES: 'teacherconnect_notes',
  FEEDBACK: 'teacherconnect_feedback',
};

// Seed data
const INITIAL_USERS: User[] = [
  { id: 't1', name: 'Teacher', username: 'master', role: UserRole.TEACHER },
  { id: 's1', name: 'Maria Garcia', username: 'maria', role: UserRole.STUDENT, level: 'B2' },
  { id: 's2', name: 'Kenji Tanaka', username: 'kenji', role: UserRole.STUDENT, level: 'A2' },
  { id: 's3', name: 'Sophie Martin', username: 'sophie', role: UserRole.STUDENT, level: 'C1' },
];

const INITIAL_NOTES: Note[] = [
  {
    id: 'n1',
    teacherId: 't1',
    studentId: 's1',
    title: 'Advanced Phrasal Verbs',
    content: 'Great job today! Remember: "Run into" means to meet by chance. "Run out of" means to have none left. Homework: Write 3 sentences using these.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    tags: ['Vocabulary', 'B2'],
  },
  {
    id: 'n2',
    teacherId: 't1',
    studentId: 's2',
    title: 'Present Simple vs Continuous',
    content: 'Focus on routine (Simple) vs right now (Continuous). I eat breakfast every day. I am eating breakfast now.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    tags: ['Grammar', 'A2'],
  }
];

const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'f1',
    noteId: 'n1',
    studentId: 's1',
    content: 'Could "Run into" also mean crashing a car?',
    createdAt: new Date().toISOString(),
    isRead: false,
  }
];

const getFromStorage = <T>(key: string, initial: T): T => {
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(stored);
};

const setStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const storageService = {
  getUsers: (): User[] => getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS),
  
  saveUser: (user: User): void => {
    const users = getFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    setStorage(STORAGE_KEYS.USERS, users);
  },

  deleteUser: (id: string): void => {
    let users = getFromStorage<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
    users = users.filter(u => u.id !== id);
    setStorage(STORAGE_KEYS.USERS, users);
  },

  getNotes: (): Note[] => getFromStorage(STORAGE_KEYS.NOTES, INITIAL_NOTES),
  
  saveNote: (note: Note): void => {
    const notes = getFromStorage(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    const index = notes.findIndex(n => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.push(note);
    }
    setStorage(STORAGE_KEYS.NOTES, notes);
  },

  deleteNote: (id: string): void => {
    let notes = getFromStorage<Note[]>(STORAGE_KEYS.NOTES, INITIAL_NOTES);
    notes = notes.filter(n => n.id !== id);
    setStorage(STORAGE_KEYS.NOTES, notes);
  },

  getFeedback: (): Feedback[] => getFromStorage(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK),
  
  saveFeedback: (feedback: Feedback): void => {
    const items = getFromStorage(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
    items.push(feedback);
    setStorage(STORAGE_KEYS.FEEDBACK, items);
  },
  
  markFeedbackRead: (id: string): void => {
     const items = getFromStorage<Feedback[]>(STORAGE_KEYS.FEEDBACK, INITIAL_FEEDBACK);
     const index = items.findIndex(f => f.id === id);
     if(index >= 0) {
         items[index].isRead = true;
         setStorage(STORAGE_KEYS.FEEDBACK, items);
     }
  }
};