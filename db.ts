import { Client } from '@neondatabase/serverless';

// NOTE: In a production environment, you should never expose your database credentials 
// in client-side code. This implementation assumes a secure environment or a demo setup.
// The DATABASE_URL must be provided in the process.env.

const DATABASE_URL = process.env.DATABASE_URL;

export const db = {
  /**
   * Executes a query against the Neon database.
   * @param text The SQL query text
   * @param params Optional parameters for the query
   */
  async query(text: string, params?: any[]) {
    if (!DATABASE_URL) {
      console.error("DATABASE_URL is not configured.");
      throw new Error("Database configuration missing");
    }

    const client = new Client(DATABASE_URL);
    
    try {
      await client.connect();
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    } finally {
      // Ensure the connection is closed after the query
      await client.end(); 
    }
  },

  /**
   * Helper to initialize the database tables if they don't exist.
   * Run this once or manually in your SQL console.
   */
  async initSchema() {
    const schema = `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL,
        role TEXT NOT NULL,
        level TEXT
      );

      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        teacher_id TEXT REFERENCES users(id),
        student_id TEXT REFERENCES users(id),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        tags TEXT[]
      );

      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
        student_id TEXT REFERENCES users(id),
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        is_read BOOLEAN DEFAULT FALSE
      );
      
      -- Seed Initial Teacher if not exists
      INSERT INTO users (id, name, username, role)
      VALUES ('t1', 'Teacher', 'master', 'TEACHER')
      ON CONFLICT (id) DO NOTHING;
    `;
    
    return this.query(schema);
  }
};