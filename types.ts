export enum UserRole {
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  username: string; // Replaced email with username
  role: UserRole;
  level?: string; // For students (e.g., A1, B2)
}

export interface Note {
  id: string;
  studentId: string;
  teacherId: string;
  title: string;
  content: string;
  createdAt: string;
  tags: string[];
}

export interface Feedback {
  id: string;
  noteId: string;
  studentId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface AppState {
  currentUser: User | null;
}