import { 
  User, InsertUser,
  Subject, InsertSubject,
  Class, InsertClass,
  TimeSlot, InsertTimeSlot,
  TimetableEntry, InsertTimetableEntry,
  Student, InsertStudent,
  ClassSession, InsertClassSession,
  AttendanceRecord, InsertAttendanceRecord,
  Homework, InsertHomework,
  Substitution, InsertSubstitution,
  Settings, InsertSettings
} from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";
import {
  users,
  subjects,
  classes,
  timeSlots,
  timetableEntries,
  students,
  classSessions,
  attendanceRecords,
  homework,
  substitutions,
  settings
} from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;
  getTeachers(): Promise<User[]>;
  
  // Subject operations
  getSubjects(): Promise<Subject[]>;
  getSubject(id: number): Promise<Subject | undefined>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Class operations
  getClasses(): Promise<Class[]>;
  getClass(id: number): Promise<Class | undefined>;
  createClass(newClass: InsertClass): Promise<Class>;
  
  // TimeSlot operations
  getTimeSlots(): Promise<TimeSlot[]>;
  getTimeSlot(id: number): Promise<TimeSlot | undefined>;
  createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot>;
  
  // Timetable operations
  getTimetableEntries(): Promise<TimetableEntry[]>;
  getTimetableEntriesByTeacher(teacherId: number): Promise<TimetableEntry[]>;
  getTimetableEntriesByDay(dayOfWeek: number): Promise<TimetableEntry[]>;
  getTimetableEntry(id: number): Promise<TimetableEntry | undefined>;
  createTimetableEntry(entry: InsertTimetableEntry): Promise<TimetableEntry>;
  updateTimetableEntry(id: number, entry: Partial<InsertTimetableEntry>): Promise<TimetableEntry | undefined>;
  deleteTimetableEntry(id: number): Promise<boolean>;
  
  // Student operations
  getStudents(): Promise<Student[]>;
  getStudentsByClass(classId: number): Promise<Student[]>;
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  createManyStudents(students: InsertStudent[]): Promise<Student[]>;
  
  // ClassSession operations
  getClassSessions(): Promise<ClassSession[]>;
  getClassSessionsByTimetableEntry(timetableEntryId: number): Promise<ClassSession[]>;
  getClassSession(id: number): Promise<ClassSession | undefined>;
  createClassSession(session: InsertClassSession): Promise<ClassSession>;
  updateClassSession(id: number, session: Partial<InsertClassSession>): Promise<ClassSession | undefined>;
  
  // Attendance operations
  getAttendanceRecordsByClassSession(classSessionId: number): Promise<AttendanceRecord[]>;
  createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord>;
  createManyAttendanceRecords(records: InsertAttendanceRecord[]): Promise<AttendanceRecord[]>;
  updateAttendanceRecord(id: number, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined>;
  
  // Homework operations
  getHomeworkByClassSession(classSessionId: number): Promise<Homework[]>;
  createHomework(homeworkItem: InsertHomework): Promise<Homework>;
  updateHomework(id: number, homeworkItem: Partial<InsertHomework>): Promise<Homework | undefined>;
  
  // Substitution operations
  getSubstitutions(): Promise<Substitution[]>;
  getSubstitutionsByTeacher(teacherId: number): Promise<Substitution[]>;
  createSubstitution(substitution: InsertSubstitution): Promise<Substitution>;
  
  // Settings operations
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool, 
      createTableIfMissing: true,
      tableName: 'sessions'
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    try {
      // Check if admin user exists
      const adminExists = await this.getUserByEmail('admin@eduschool.com');
      if (!adminExists) {
        // Add default admin user
        const adminUser: InsertUser = {
          username: 'admin',
          password: 'admin123', // In a real app, this would be hashed
          email: 'admin@eduschool.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          subjects: []
        };
        await this.createUser(adminUser);
      }
      
      // Check if teacher exists
      const teacherExists = await this.getUserByEmail('janice.doe@eduschool.com');
      if (!teacherExists) {
        // Add default teacher
        const teacher: InsertUser = {
          username: 'teacher',
          password: 'teacher123', // In a real app, this would be hashed
          email: 'janice.doe@eduschool.com',
          firstName: 'Janice',
          lastName: 'Doe',
          role: 'teacher',
          subjects: ['English', 'Literature','History']
        };
        await this.createUser(teacher);
      }
      this.getUserByEmail('john.smith@eduschool.com');
      if (!teacherExists) {
        // Add default teacher
        const teacher: InsertUser = {
          username: 'john.smith@eduschool.com',
          password: 'teacher123', // In a real app, this would be hashed
          email: 'john.smith@eduschool.com',
          firstName: 'John',
          lastName: 'Smith',
          role: 'teacher',
          subjects: ['History', 'Maths']
        };
        await this.createUser(teacher);
      }
      
      // Check if subjects exist
      const existingSubjects = await this.getSubjects();
      if (existingSubjects.length === 0) {
        // Add default subjects
        const defaultSubjects = [
          { name: 'English', color: '#3b82f6' },
          { name: 'Mathematics', color: '#10b981' },
          { name: 'Science', color: '#8b5cf6' },
          { name: 'History', color: '#f59e0b' },
          { name: 'Geography', color: '#ef4444' }
        ];
        
        for (const subject of defaultSubjects) {
          await this.createSubject(subject);
        }
      }
      
      // Check if classes exist
      const existingClasses = await this.getClasses();
      if (existingClasses.length === 0) {
        // Add default classes
        const defaultClasses = [
          { name: '10A', grade: '10', section: 'A', roomNumber: '101' },
          { name: '11B', grade: '11', section: 'B', roomNumber: '102' },
          { name: '9C', grade: '9', section: 'C', roomNumber: '103' },
          { name: '12A', grade: '12', section: 'A', roomNumber: '104' }
        ];
        
        for (const cls of defaultClasses) {
          await this.createClass(cls);
        }
      }
      
      // Check if time slots exist
      const existingTimeSlots = await this.getTimeSlots();
      if (existingTimeSlots.length === 0) {
        // Add default time slots
        const defaultTimeSlots = [
          { startTime: '09:00', endTime: '10:00', label: 'Period 1' },
          { startTime: '10:00', endTime: '11:00', label: 'Period 2' },
          { startTime: '11:00', endTime: '12:00', label: 'Period 3' },
          { startTime: '12:00', endTime: '13:00', label: 'Lunch' },
          { startTime: '13:00', endTime: '14:00', label: 'Period 4' },
          { startTime: '14:00', endTime: '15:00', label: 'Period 5' },
          { startTime: '15:00', endTime: '16:00', label: 'Period 6' }
        ];
        
        for (const timeSlot of defaultTimeSlots) {
          await this.createTimeSlot(timeSlot);
        }
      }
      
      // Check if settings exist
      const existingSettings = await this.getSettings();
      if (!existingSettings) {
        // Create default settings
        const now = new Date();
        const semesterStart = new Date(now);
        semesterStart.setMonth(semesterStart.getMonth() - 1);
        
        const semesterEnd = new Date(now);
        semesterEnd.setMonth(semesterEnd.getMonth() + 3);
        
        await this.updateSettings({
          semesterStartDate: semesterStart,
          semesterEndDate: semesterEnd,
          schoolName: 'Edu School',
          schoolLogo: '',
          academicYear: '2023-2024'
        });
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await db.select().from(this.users).where(eq(this.users.id, id));
    return users.length > 0 ? users[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await db.select().from(this.users).where(eq(this.users.username, username));
    return users.length > 0 ? users[0] : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const users = await db.select().from(this.users).where(eq(this.users.email, email));
    return users.length > 0 ? users[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(this.users).values(insertUser).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(this.users);
  }

  async getTeachers(): Promise<User[]> {
    return await db.select().from(this.users).where(eq(this.users.role, 'teacher'));
  }

  async getSubjects(): Promise<Subject[]> {
    return await db.select().from(this.subjects);
  }

  async getSubject(id: number): Promise<Subject | undefined> {
    const subjects = await db.select().from(this.subjects).where(eq(this.subjects.id, id));
    return subjects.length > 0 ? subjects[0] : undefined;
  }

  async createSubject(subject: InsertSubject): Promise<Subject> {
    const [newSubject] = await db.insert(this.subjects).values(subject).returning();
    return newSubject;
  }

  async getClasses(): Promise<Class[]> {
    return await db.select().from(this.classes);
  }

  async getClass(id: number): Promise<Class | undefined> {
    const classes = await db.select().from(this.classes).where(eq(this.classes.id, id));
    return classes.length > 0 ? classes[0] : undefined;
  }

  async createClass(newClass: InsertClass): Promise<Class> {
    const [cls] = await db.insert(this.classes).values(newClass).returning();
    return cls;
  }

  async getTimeSlots(): Promise<TimeSlot[]> {
    return await db.select().from(this.timeSlots);
  }

  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    const timeSlots = await db.select().from(this.timeSlots).where(eq(this.timeSlots.id, id));
    return timeSlots.length > 0 ? timeSlots[0] : undefined;
  }

  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const [newTimeSlot] = await db.insert(this.timeSlots).values(timeSlot).returning();
    return newTimeSlot;
  }

  async getTimetableEntries(): Promise<TimetableEntry[]> {
    return await db.select().from(this.timetableEntries);
  }

  async getTimetableEntriesByTeacher(teacherId: number): Promise<TimetableEntry[]> {
    return await db.select().from(this.timetableEntries).where(eq(this.timetableEntries.teacherId, teacherId));
  }

  async getTimetableEntriesByDay(dayOfWeek: number): Promise<TimetableEntry[]> {
    return await db.select().from(this.timetableEntries).where(eq(this.timetableEntries.dayOfWeek, dayOfWeek));
  }

  async getTimetableEntry(id: number): Promise<TimetableEntry | undefined> {
    const entries = await db.select().from(this.timetableEntries).where(eq(this.timetableEntries.id, id));
    return entries.length > 0 ? entries[0] : undefined;
  }

  async createTimetableEntry(entry: InsertTimetableEntry): Promise<TimetableEntry> {
    const [newEntry] = await db.insert(this.timetableEntries).values(entry).returning();
    return newEntry;
  }

  async updateTimetableEntry(id: number, entry: Partial<InsertTimetableEntry>): Promise<TimetableEntry | undefined> {
    const [updatedEntry] = await db
      .update(this.timetableEntries)
      .set(entry)
      .where(eq(this.timetableEntries.id, id))
      .returning();
    return updatedEntry;
  }

  async deleteTimetableEntry(id: number): Promise<boolean> {
    const result = await db.delete(this.timetableEntries).where(eq(this.timetableEntries.id, id));
    return !!result;
  }

  async getStudents(): Promise<Student[]> {
    return await db.select().from(this.students);
  }

  async getStudentsByClass(classId: number): Promise<Student[]> {
    return await db.select().from(this.students).where(eq(this.students.classId, classId));
  }

  async getStudent(id: number): Promise<Student | undefined> {
    const students = await db.select().from(this.students).where(eq(this.students.id, id));
    return students.length > 0 ? students[0] : undefined;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(this.students).values(student).returning();
    return newStudent;
  }

  async createManyStudents(students: InsertStudent[]): Promise<Student[]> {
    if (students.length === 0) return [];
    const newStudents = await db.insert(this.students).values(students).returning();
    return newStudents;
  }

  async getClassSessions(): Promise<ClassSession[]> {
    return await db.select().from(this.classSessions);
  }

  async getClassSessionsByTimetableEntry(timetableEntryId: number): Promise<ClassSession[]> {
    return await db.select().from(this.classSessions).where(eq(this.classSessions.timetableEntryId, timetableEntryId));
  }

  async getClassSession(id: number): Promise<ClassSession | undefined> {
    const sessions = await db.select().from(this.classSessions).where(eq(this.classSessions.id, id));
    return sessions.length > 0 ? sessions[0] : undefined;
  }

  async createClassSession(session: InsertClassSession): Promise<ClassSession> {
    const [newSession] = await db.insert(this.classSessions).values(session).returning();
    return newSession;
  }

  async updateClassSession(id: number, session: Partial<InsertClassSession>): Promise<ClassSession | undefined> {
    const [updatedSession] = await db
      .update(this.classSessions)
      .set(session)
      .where(eq(this.classSessions.id, id))
      .returning();
    return updatedSession;
  }

  async getAttendanceRecordsByClassSession(classSessionId: number): Promise<AttendanceRecord[]> {
    return await db
      .select()
      .from(this.attendanceRecords)
      .where(eq(this.attendanceRecords.classSessionId, classSessionId));
  }

  async createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const [newRecord] = await db.insert(this.attendanceRecords).values(record).returning();
    return newRecord;
  }

  async createManyAttendanceRecords(records: InsertAttendanceRecord[]): Promise<AttendanceRecord[]> {
    if (records.length === 0) return [];
    const newRecords = await db.insert(this.attendanceRecords).values(records).returning();
    return newRecords;
  }

  async updateAttendanceRecord(id: number, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const [updatedRecord] = await db
      .update(this.attendanceRecords)
      .set(record)
      .where(eq(this.attendanceRecords.id, id))
      .returning();
    return updatedRecord;
  }

  async getHomeworkByClassSession(classSessionId: number): Promise<Homework[]> {
    return await db
      .select()
      .from(this.homework)
      .where(eq(this.homework.classSessionId, classSessionId));
  }

  async createHomework(homeworkItem: InsertHomework): Promise<Homework> {
    const [newHomework] = await db.insert(this.homework).values(homeworkItem).returning();
    return newHomework;
  }

  async updateHomework(id: number, homeworkItem: Partial<InsertHomework>): Promise<Homework | undefined> {
    const [updatedHomework] = await db
      .update(this.homework)
      .set(homeworkItem)
      .where(eq(this.homework.id, id))
      .returning();
    return updatedHomework;
  }

  async getSubstitutions(): Promise<Substitution[]> {
    return await db.select().from(this.substitutions);
  }

  async getSubstitutionsByTeacher(teacherId: number): Promise<Substitution[]> {
    return await db
      .select()
      .from(this.substitutions)
      .where(
        or(
          eq(this.substitutions.originalTeacherId, teacherId),
          eq(this.substitutions.substituteTeacherId, teacherId)
        )
      );
  }

  async createSubstitution(substitution: InsertSubstitution): Promise<Substitution> {
    const [newSubstitution] = await db.insert(this.substitutions).values(substitution).returning();
    return newSubstitution;
  }

  async getSettings(): Promise<Settings | undefined> {
    const settingsData = await db.select().from(this.settings);
    return settingsData.length > 0 ? settingsData[0] : undefined;
  }

  async updateSettings(settings: Partial<InsertSettings>): Promise<Settings> {
    const existingSettings = await this.getSettings();
    
    if (!existingSettings) {
      const [newSettings] = await db.insert(this.settings).values(settings).returning();
      return newSettings;
    } else {
      const [updatedSettings] = await db
        .update(this.settings)
        .set(settings)
        .where(eq(this.settings.id, existingSettings.id))
        .returning();
      return updatedSettings;
    }
  }

  // Properties to access schema tables
  get users() { return users; }
  get subjects() { return subjects; }
  get classes() { return classes; }
  get timeSlots() { return timeSlots; }
  get timetableEntries() { return timetableEntries; }
  get students() { return students; }
  get classSessions() { return classSessions; }
  get attendanceRecords() { return attendanceRecords; }
  get homework() { return homework; }
  get substitutions() { return substitutions; }
  get settings() { return settings; }
}