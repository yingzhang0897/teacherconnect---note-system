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
      
      -- Seed Initial Teacher
      INSERT INTO users (id, name, username, role)
      VALUES ('t1', 'Teacher', 'master', 'TEACHER')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Initial Students
      INSERT INTO users (id, name, username, role, level)
      VALUES 
        ('s1', 'Maria Garcia', 'maria', 'STUDENT', 'B2'),
        ('s2', 'Kenji Tanaka', 'kenji', 'STUDENT', 'A2'),
        ('s3', 'Sophie Martin', 'sophie', 'STUDENT', 'C1')
      ON CONFLICT (id) DO NOTHING;

      -- Seed Initial Notes
      INSERT INTO notes (id, teacher_id, student_id, title, content, created_at, tags)
      VALUES
        ('n1', 't1', 's1', 'Advanced Phrasal Verbs', 'Great job today! Remember: "Run into" means to meet by chance. "Run out of" means to have none left. Homework: Write 3 sentences using these.', NOW() - INTERVAL '1 day', ARRAY['Vocabulary', 'B2']),
        ('n2', 't1', 's2', 'Present Simple vs Continuous', 'Focus on routine (Simple) vs right now (Continuous). I eat breakfast every day. I am eating breakfast now.', NOW() - INTERVAL '2 days', ARRAY['Grammar', 'A2'])
      ON CONFLICT (id) DO NOTHING;

      -- Seed Initial Feedback
      INSERT INTO feedback (id, note_id, student_id, content, created_at, is_read)
      VALUES
        ('f1', 'n1', 's1', 'Could "Run into" also mean crashing a car?', NOW(), FALSE)
      ON CONFLICT (id) DO NOTHING;
    `;
    
    return this.query(schema);
  }
};