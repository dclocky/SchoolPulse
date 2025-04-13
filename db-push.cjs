const { Client } = require('pg');

async function main() {
  console.log('Connecting to database...');
  
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  
  try {
    await client.connect();
    console.log('Creating schema...');
    
    // Create role enum
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
          CREATE TYPE role AS ENUM ('admin', 'teacher');
        END IF;
      END
      $$;
    `);
    
    // Users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        role role NOT NULL,
        subjects TEXT[] NOT NULL DEFAULT '{}'
      );
    `);
    
    // Subjects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );
    `);
    
    // Classes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        section TEXT NOT NULL,
        "roomNumber" TEXT NOT NULL
      );
    `);
    
    // Time slots table
    await client.query(`
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        label TEXT NOT NULL
      );
    `);
    
    // Timetable entries table
    await client.query(`
      CREATE TABLE IF NOT EXISTS timetable_entries (
        id SERIAL PRIMARY KEY,
        "teacherId" INTEGER NOT NULL,
        "classId" INTEGER,
        "subjectId" INTEGER,
        "timeSlotId" INTEGER NOT NULL,
        "dayOfWeek" INTEGER NOT NULL,
        "roomNumber" TEXT,
        "isFreePeriod" BOOLEAN NOT NULL DEFAULT false
      );
    `);
    
    // Students table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        email TEXT NOT NULL,
        "classId" INTEGER NOT NULL
      );
    `);
    
    // Class sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS class_sessions (
        id SERIAL PRIMARY KEY,
        "timetableEntryId" INTEGER NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled'
      );
    `);
    
    // Attendance records table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        "classSessionId" INTEGER NOT NULL,
        "studentId" INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT
      );
    `);
    
    // Homework table
    await client.query(`
      CREATE TABLE IF NOT EXISTS homework (
        id SERIAL PRIMARY KEY,
        "classSessionId" INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "dueDate" DATE NOT NULL
      );
    `);
    
    // Substitutions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS substitutions (
        id SERIAL PRIMARY KEY,
        "originalTeacherId" INTEGER NOT NULL,
        "substituteTeacherId" INTEGER NOT NULL,
        "timetableEntryId" INTEGER NOT NULL,
        date DATE NOT NULL,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending'
      );
    `);
    
    // Settings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        "semesterStartDate" DATE NOT NULL,
        "semesterEndDate" DATE NOT NULL,
        "schoolName" TEXT,
        "schoolLogo" TEXT,
        "academicYear" TEXT
      );
    `);
    
    // Session table for connect-pg-simple
    await client.query(`
      CREATE TABLE IF NOT EXISTS "sessions" (
        "sid" varchar NOT NULL COLLATE "default" PRIMARY KEY,
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL
      )
    `);
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sessions_expire" ON "sessions" ("expire");
    `);
    
    console.log('Schema created successfully!');
    
    // Insert default admin user if not exists
    const adminResult = await client.query(`
      SELECT * FROM users WHERE email = 'admin@eduschool.com' LIMIT 1;
    `);
    
    if (adminResult.rows.length === 0) {
      console.log('Creating default admin user...');
      await client.query(`
        INSERT INTO users (username, password, email, "firstName", "lastName", role, subjects)
        VALUES ('admin', 'admin123', 'admin@eduschool.com', 'Admin', 'User', 'admin', '{}');
      `);
    }
    
    // Insert default teacher if not exists
    const teacherResult = await client.query(`
      SELECT * FROM users WHERE email = 'teacher@eduschool.com' LIMIT 1;
    `);
    
    if (teacherResult.rows.length === 0) {
      console.log('Creating default teacher user...');
      await client.query(`
        INSERT INTO users (username, password, email, "firstName", "lastName", role, subjects)
        VALUES ('teacher', 'teacher123', 'teacher@eduschool.com', 'Jane', 'Doe', 'teacher', '{"English", "Literature"}');
      `);
    }
    
    console.log('Default users created or already exist.');
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    await client.end();
  }
}

main();
