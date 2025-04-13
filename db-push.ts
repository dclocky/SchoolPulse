import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './shared/schema';

async function main() {
  console.log('Connecting to database...');
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle({ client: pool, schema });
  
  try {
    console.log('Creating schema...');
    // Create tables directly with SQL
    await pool.query(`
      -- Create role enum
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role') THEN
          CREATE TYPE role AS ENUM ('admin', 'teacher');
        END IF;
      END
      $$;
      
      -- Users table
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
      
      -- Subjects table
      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );
      
      -- Classes table
      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        grade TEXT NOT NULL,
        section TEXT NOT NULL,
        "roomNumber" TEXT NOT NULL
      );
      
      -- Time slots table
      CREATE TABLE IF NOT EXISTS time_slots (
        id SERIAL PRIMARY KEY,
        "startTime" TEXT NOT NULL,
        "endTime" TEXT NOT NULL,
        label TEXT NOT NULL
      );
      
      -- Timetable entries table
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
      
      -- Students table
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        email TEXT NOT NULL,
        "classId" INTEGER NOT NULL
      );
      
      -- Class sessions table
      CREATE TABLE IF NOT EXISTS class_sessions (
        id SERIAL PRIMARY KEY,
        "timetableEntryId" INTEGER NOT NULL,
        date DATE NOT NULL,
        notes TEXT,
        status TEXT NOT NULL DEFAULT 'scheduled'
      );
      
      -- Attendance records table
      CREATE TABLE IF NOT EXISTS attendance_records (
        id SERIAL PRIMARY KEY,
        "classSessionId" INTEGER NOT NULL,
        "studentId" INTEGER NOT NULL,
        status TEXT NOT NULL,
        note TEXT
      );
      
      -- Homework table
      CREATE TABLE IF NOT EXISTS homework (
        id SERIAL PRIMARY KEY,
        "classSessionId" INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        "dueDate" DATE NOT NULL
      );
      
      -- Substitutions table
      CREATE TABLE IF NOT EXISTS substitutions (
        id SERIAL PRIMARY KEY,
        "originalTeacherId" INTEGER NOT NULL,
        "substituteTeacherId" INTEGER NOT NULL,
        "timetableEntryId" INTEGER NOT NULL,
        date DATE NOT NULL,
        reason TEXT,
        status TEXT NOT NULL DEFAULT 'pending'
      );
      
      -- Settings table
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        "semesterStartDate" DATE NOT NULL,
        "semesterEndDate" DATE NOT NULL,
        "schoolName" TEXT
      );
    `);
    
    console.log('Schema created successfully!');
  } catch (error) {
    console.error('Error creating schema:', error);
  } finally {
    await pool.end();
  }
}

main();
