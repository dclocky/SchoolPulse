import {
  users, User, InsertUser,
  subjects, Subject, InsertSubject,
  classes, Class, InsertClass,
  timeSlots, TimeSlot, InsertTimeSlot,
  timetableEntries, TimetableEntry, InsertTimetableEntry,
  students, Student, InsertStudent,
  classSessions, ClassSession, InsertClassSession,
  attendanceRecords, AttendanceRecord, InsertAttendanceRecord,
  homework, Homework, InsertHomework,
  substitutions, Substitution, InsertSubstitution,
  settings, Settings, InsertSettings
} from "@shared/schema";

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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private classes: Map<number, Class>;
  private timeSlots: Map<number, TimeSlot>;
  private timetableEntries: Map<number, TimetableEntry>;
  private students: Map<number, Student>;
  private classSessions: Map<number, ClassSession>;
  private attendanceRecords: Map<number, AttendanceRecord>;
  private homeworkItems: Map<number, Homework>;
  private substitutions: Map<number, Substitution>;
  private settingsInstance: Settings | undefined;
  
  currentId: { [key: string]: number } = {
    user: 1,
    subject: 1,
    class: 1,
    timeSlot: 1,
    timetableEntry: 1,
    student: 1,
    classSession: 1,
    attendance: 1,
    homework: 1,
    substitution: 1,
    settings: 1
  };

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.classes = new Map();
    this.timeSlots = new Map();
    this.timetableEntries = new Map();
    this.students = new Map();
    this.classSessions = new Map();
    this.attendanceRecords = new Map();
    this.homeworkItems = new Map();
    this.substitutions = new Map();
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
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
    this.createUser(adminUser);
    
    // Add default teacher
    const teacher: InsertUser = {
      username: 'teacher',
      password: 'teacher123', // In a real app, this would be hashed
      email: 'teacher@eduschool.com',
      firstName: 'Jane',
      lastName: 'Doe',
      role: 'teacher',
      subjects: ['English', 'Literature']
    };
    this.createUser(teacher);
    
    // Add default subjects
    const subjects = [
      { name: 'English', color: '#3b82f6' },
      { name: 'Mathematics', color: '#10b981' },
      { name: 'Science', color: '#8b5cf6' },
      { name: 'History', color: '#f59e0b' },
      { name: 'Geography', color: '#ef4444' }
    ];
    
    subjects.forEach(subject => {
      this.createSubject(subject);
    });
    
    // Add default classes
    const classes = [
      { name: '10A', grade: '10', section: 'A', roomNumber: '101' },
      { name: '11B', grade: '11', section: 'B', roomNumber: '102' },
      { name: '9C', grade: '9', section: 'C', roomNumber: '103' },
      { name: '12A', grade: '12', section: 'A', roomNumber: '104' }
    ];
    
    classes.forEach(cls => {
      this.createClass(cls);
    });
    
    // Add default time slots
    const timeSlots = [
      { startTime: '09:00', endTime: '10:00', label: 'Period 1' },
      { startTime: '10:00', endTime: '11:00', label: 'Period 2' },
      { startTime: '11:00', endTime: '12:00', label: 'Period 3' },
      { startTime: '12:00', endTime: '13:00', label: 'Lunch' },
      { startTime: '13:00', endTime: '14:00', label: 'Period 4' },
      { startTime: '14:00', endTime: '15:00', label: 'Period 5' },
      { startTime: '15:00', endTime: '16:00', label: 'Period 6' }
    ];
    
    timeSlots.forEach(timeSlot => {
      this.createTimeSlot(timeSlot);
    });
    
    // Create default settings
    const now = new Date();
    const semesterStart = new Date(now);
    semesterStart.setMonth(semesterStart.getMonth() - 1);
    
    const semesterEnd = new Date(now);
    semesterEnd.setMonth(semesterEnd.getMonth() + 3);
    
    this.updateSettings({
      semesterStartDate: semesterStart,
      semesterEndDate: semesterEnd,
      schoolName: 'EduSchedule School'
    });
    
    // Add some default timetable entries
    const timetableEntries = [
      { teacherId: 2, classId: 1, subjectId: 1, timeSlotId: 1, dayOfWeek: 1, roomNumber: '101', isFreePeriod: false }, // Monday 9AM, English with Jane for 10A
      { teacherId: 2, classId: 2, subjectId: 1, timeSlotId: 2, dayOfWeek: 1, roomNumber: '102', isFreePeriod: false }, // Monday 10AM, English with Jane for 11B
      { teacherId: 2, classId: 3, subjectId: 1, timeSlotId: 5, dayOfWeek: 1, roomNumber: '103', isFreePeriod: false }, // Monday 1PM, English with Jane for 9C
      { teacherId: 2, classId: 4, subjectId: 1, timeSlotId: 6, dayOfWeek: 1, roomNumber: '104', isFreePeriod: false }, // Monday 2PM, English with Jane for 12A
      { teacherId: 2, classId: null, subjectId: null, timeSlotId: 3, dayOfWeek: 1, roomNumber: null, isFreePeriod: true }, // Monday 11AM, Free period for Jane
      { teacherId: 2, classId: null, subjectId: null, timeSlotId: 4, dayOfWeek: 1, roomNumber: null, isFreePeriod: true }  // Monday 12PM, Lunch for Jane
    ];
    
    timetableEntries.forEach(entry => {
      this.createTimetableEntry(entry);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.user++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async getTeachers(): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === 'teacher');
  }

  // Subject methods
  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }
  
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }
  
  async createSubject(subject: InsertSubject): Promise<Subject> {
    const id = this.currentId.subject++;
    const newSubject: Subject = { ...subject, id };
    this.subjects.set(id, newSubject);
    return newSubject;
  }
  
  // Class methods
  async getClasses(): Promise<Class[]> {
    return Array.from(this.classes.values());
  }
  
  async getClass(id: number): Promise<Class | undefined> {
    return this.classes.get(id);
  }
  
  async createClass(newClass: InsertClass): Promise<Class> {
    const id = this.currentId.class++;
    const cls: Class = { ...newClass, id };
    this.classes.set(id, cls);
    return cls;
  }
  
  // TimeSlot methods
  async getTimeSlots(): Promise<TimeSlot[]> {
    return Array.from(this.timeSlots.values());
  }
  
  async getTimeSlot(id: number): Promise<TimeSlot | undefined> {
    return this.timeSlots.get(id);
  }
  
  async createTimeSlot(timeSlot: InsertTimeSlot): Promise<TimeSlot> {
    const id = this.currentId.timeSlot++;
    const newTimeSlot: TimeSlot = { ...timeSlot, id };
    this.timeSlots.set(id, newTimeSlot);
    return newTimeSlot;
  }
  
  // Timetable methods
  async getTimetableEntries(): Promise<TimetableEntry[]> {
    return Array.from(this.timetableEntries.values());
  }
  
  async getTimetableEntriesByTeacher(teacherId: number): Promise<TimetableEntry[]> {
    return Array.from(this.timetableEntries.values()).filter(
      entry => entry.teacherId === teacherId
    );
  }
  
  async getTimetableEntriesByDay(dayOfWeek: number): Promise<TimetableEntry[]> {
    return Array.from(this.timetableEntries.values()).filter(
      entry => entry.dayOfWeek === dayOfWeek
    );
  }
  
  async getTimetableEntry(id: number): Promise<TimetableEntry | undefined> {
    return this.timetableEntries.get(id);
  }
  
  async createTimetableEntry(entry: InsertTimetableEntry): Promise<TimetableEntry> {
    const id = this.currentId.timetableEntry++;
    const newEntry: TimetableEntry = { ...entry, id };
    this.timetableEntries.set(id, newEntry);
    return newEntry;
  }
  
  async updateTimetableEntry(id: number, entry: Partial<InsertTimetableEntry>): Promise<TimetableEntry | undefined> {
    const existingEntry = this.timetableEntries.get(id);
    if (!existingEntry) return undefined;
    
    const updatedEntry = { ...existingEntry, ...entry };
    this.timetableEntries.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async deleteTimetableEntry(id: number): Promise<boolean> {
    return this.timetableEntries.delete(id);
  }
  
  // Student methods
  async getStudents(): Promise<Student[]> {
    return Array.from(this.students.values());
  }
  
  async getStudentsByClass(classId: number): Promise<Student[]> {
    return Array.from(this.students.values()).filter(
      student => student.classId === classId
    );
  }
  
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }
  
  async createStudent(student: InsertStudent): Promise<Student> {
    const id = this.currentId.student++;
    const newStudent: Student = { ...student, id };
    this.students.set(id, newStudent);
    return newStudent;
  }
  
  async createManyStudents(students: InsertStudent[]): Promise<Student[]> {
    return Promise.all(students.map(student => this.createStudent(student)));
  }
  
  // ClassSession methods
  async getClassSessions(): Promise<ClassSession[]> {
    return Array.from(this.classSessions.values());
  }
  
  async getClassSessionsByTimetableEntry(timetableEntryId: number): Promise<ClassSession[]> {
    return Array.from(this.classSessions.values()).filter(
      session => session.timetableEntryId === timetableEntryId
    );
  }
  
  async getClassSession(id: number): Promise<ClassSession | undefined> {
    return this.classSessions.get(id);
  }
  
  async createClassSession(session: InsertClassSession): Promise<ClassSession> {
    const id = this.currentId.classSession++;
    const newSession: ClassSession = { ...session, id };
    this.classSessions.set(id, newSession);
    return newSession;
  }
  
  async updateClassSession(id: number, session: Partial<InsertClassSession>): Promise<ClassSession | undefined> {
    const existingSession = this.classSessions.get(id);
    if (!existingSession) return undefined;
    
    const updatedSession = { ...existingSession, ...session };
    this.classSessions.set(id, updatedSession);
    return updatedSession;
  }
  
  // Attendance methods
  async getAttendanceRecordsByClassSession(classSessionId: number): Promise<AttendanceRecord[]> {
    return Array.from(this.attendanceRecords.values()).filter(
      record => record.classSessionId === classSessionId
    );
  }
  
  async createAttendanceRecord(record: InsertAttendanceRecord): Promise<AttendanceRecord> {
    const id = this.currentId.attendance++;
    const newRecord: AttendanceRecord = { ...record, id };
    this.attendanceRecords.set(id, newRecord);
    return newRecord;
  }
  
  async createManyAttendanceRecords(records: InsertAttendanceRecord[]): Promise<AttendanceRecord[]> {
    return Promise.all(records.map(record => this.createAttendanceRecord(record)));
  }
  
  async updateAttendanceRecord(id: number, record: Partial<InsertAttendanceRecord>): Promise<AttendanceRecord | undefined> {
    const existingRecord = this.attendanceRecords.get(id);
    if (!existingRecord) return undefined;
    
    const updatedRecord = { ...existingRecord, ...record };
    this.attendanceRecords.set(id, updatedRecord);
    return updatedRecord;
  }
  
  // Homework methods
  async getHomeworkByClassSession(classSessionId: number): Promise<Homework[]> {
    return Array.from(this.homeworkItems.values()).filter(
      item => item.classSessionId === classSessionId
    );
  }
  
  async createHomework(homeworkItem: InsertHomework): Promise<Homework> {
    const id = this.currentId.homework++;
    const newHomework: Homework = { ...homeworkItem, id };
    this.homeworkItems.set(id, newHomework);
    return newHomework;
  }
  
  async updateHomework(id: number, homeworkItem: Partial<InsertHomework>): Promise<Homework | undefined> {
    const existingHomework = this.homeworkItems.get(id);
    if (!existingHomework) return undefined;
    
    const updatedHomework = { ...existingHomework, ...homeworkItem };
    this.homeworkItems.set(id, updatedHomework);
    return updatedHomework;
  }
  
  // Substitution methods
  async getSubstitutions(): Promise<Substitution[]> {
    return Array.from(this.substitutions.values());
  }
  
  async getSubstitutionsByTeacher(teacherId: number): Promise<Substitution[]> {
    return Array.from(this.substitutions.values()).filter(
      sub => sub.originalTeacherId === teacherId || sub.substituteTeacherId === teacherId
    );
  }
  
  async createSubstitution(substitution: InsertSubstitution): Promise<Substitution> {
    const id = this.currentId.substitution++;
    const newSubstitution: Substitution = { ...substitution, id };
    this.substitutions.set(id, newSubstitution);
    return newSubstitution;
  }
  
  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    return this.settingsInstance;
  }
  
  async updateSettings(settings: Partial<InsertSettings>): Promise<Settings> {
    if (!this.settingsInstance) {
      const id = this.currentId.settings++;
      this.settingsInstance = {
        id,
        semesterStartDate: new Date(),
        semesterEndDate: new Date(),
        schoolName: 'EduSchedule School',
        ...settings
      };
    } else {
      this.settingsInstance = {
        ...this.settingsInstance,
        ...settings
      };
    }
    
    return this.settingsInstance;
  }
}

export const storage = new MemStorage();
