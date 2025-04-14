import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as z from "zod";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import createMemoryStore from "memorystore";
import multer from "multer";
import Papa from "papaparse";
import { 
  insertUserSchema,
  insertClassSchema,
  insertClassSessionSchema,
  insertAttendanceRecordSchema,
  insertHomeworkSchema,
  insertSubstitutionSchema,
  insertStudentSchema,
  insertTimetableEntrySchema,
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);
const upload = multer({ storage: multer.memoryStorage() });

// Setup passport local strategy
passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      // In a real app, we would properly hash and compare passwords
      if (user.password !== password) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUser(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session
  app.use(session({
    secret: 'eduschedulesecret', // In production, use a proper secret
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax', // Recommended for better security while allowing links
      httpOnly: true, // Prevents JavaScript access to the cookie
      secure: process.env.NODE_ENV === 'production' // Allow non-HTTPS in development
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Auth middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };

  const isAdmin = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };

  // Auth routes
  app.post('/api/auth/login', (req, res) => {
    console.log('Login attempt with:', req.body);
    
    if (!req.body.email || !req.body.password) {
      console.error('Missing credentials in login request');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Demo credentials check
    const validCredentials = {
      'admin@eduschool.com': { password: 'admin123', role: 'admin' },
      'teacher@eduschool.com': { password: 'teacher123', role: 'teacher' }
    };
    
    const userCredentials = validCredentials[req.body.email];
    
    if (!userCredentials || userCredentials.password !== req.body.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create user object
    const user = {
      id: 1,
      email: req.body.email,
      role: userCredentials.role,
      firstName: userCredentials.role === 'admin' ? 'Admin' : 'Teacher',
      lastName: 'User',
      subjects: []
    };
    
    // Set session
    if (req.session) {
      req.session.user = user;
    }
    
    console.log('Login successful for user:', user.email);
    return res.json({ user });
      });
    })(req, res, next);
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/auth/me', isAuthenticated, (req, res) => {
    res.json({ user: req.user });
  });
  
  // Temporary debug route
  app.get('/api/debug/users', async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json({ 
        count: users.length,
        users: users.map(u => ({ 
          id: u.id, 
          email: u.email, 
          username: u.username, 
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role
        }))
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // User routes
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/teachers', isAuthenticated, async (req, res) => {
    try {
      const teachers = await storage.getTeachers();
      res.json(teachers);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/users', isAdmin, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  // Subject routes
  app.get('/api/subjects', isAuthenticated, async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Class routes
  app.get('/api/classes', isAuthenticated, async (req, res) => {
    try {
      const classes = await storage.getClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/classes', isAdmin, async (req, res) => {
    try {
      const validatedData = insertClassSchema.parse(req.body);
      const newClass = await storage.createClass(validatedData);
      res.status(201).json(newClass);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  // TimeSlot routes
  app.get('/api/timeslots', isAuthenticated, async (req, res) => {
    try {
      const timeSlots = await storage.getTimeSlots();
      res.json(timeSlots);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Timetable routes
  app.get('/api/timetable', isAuthenticated, async (req, res) => {
    try {
      const timetableEntries = await storage.getTimetableEntries();
      res.json(timetableEntries);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/timetable/teacher/:id', isAuthenticated, async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const timetableEntries = await storage.getTimetableEntriesByTeacher(teacherId);
      res.json(timetableEntries);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/timetable/day/:day', isAuthenticated, async (req, res) => {
    try {
      const dayOfWeek = parseInt(req.params.day);
      const timetableEntries = await storage.getTimetableEntriesByDay(dayOfWeek);
      res.json(timetableEntries);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/timetable', isAdmin, async (req, res) => {
    try {
      const validatedData = insertTimetableEntrySchema.parse(req.body);
      const entry = await storage.createTimetableEntry(validatedData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  app.put('/api/timetable/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const entry = await storage.updateTimetableEntry(id, req.body);
      if (!entry) {
        return res.status(404).json({ message: 'Timetable entry not found' });
      }
      res.json(entry);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.delete('/api/timetable/:id', isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTimetableEntry(id);
      if (!success) {
        return res.status(404).json({ message: 'Timetable entry not found' });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Student routes
  app.get('/api/students', isAuthenticated, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/students/class/:id', isAuthenticated, async (req, res) => {
    try {
      const classId = parseInt(req.params.id);
      const students = await storage.getStudentsByClass(classId);
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // ClassSession routes
  app.get('/api/classsessions/timetable/:id', isAuthenticated, async (req, res) => {
    try {
      const timetableEntryId = parseInt(req.params.id);
      const sessions = await storage.getClassSessionsByTimetableEntry(timetableEntryId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/classsessions', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertClassSessionSchema.parse(req.body);
      const session = await storage.createClassSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  app.put('/api/classsessions/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updateClassSession(id, req.body);
      if (!session) {
        return res.status(404).json({ message: 'Class session not found' });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Attendance routes
  app.get('/api/attendance/classsession/:id', isAuthenticated, async (req, res) => {
    try {
      const classSessionId = parseInt(req.params.id);
      const records = await storage.getAttendanceRecordsByClassSession(classSessionId);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/attendance', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAttendanceRecordSchema.parse(req.body);
      const record = await storage.createAttendanceRecord(validatedData);
      res.status(201).json(record);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  app.post('/api/attendance/batch', isAuthenticated, async (req, res) => {
    try {
      const records = req.body.records.map((record: any) => insertAttendanceRecordSchema.parse(record));
      const savedRecords = await storage.createManyAttendanceRecords(records);
      res.status(201).json(savedRecords);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  // Homework routes
  app.get('/api/homework/classsession/:id', isAuthenticated, async (req, res) => {
    try {
      const classSessionId = parseInt(req.params.id);
      const homework = await storage.getHomeworkByClassSession(classSessionId);
      res.json(homework);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/homework', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertHomeworkSchema.parse(req.body);
      const homework = await storage.createHomework(validatedData);
      res.status(201).json(homework);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  // Substitution routes
  app.get('/api/substitutions', isAuthenticated, async (req, res) => {
    try {
      const substitutions = await storage.getSubstitutions();
      res.json(substitutions);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/substitutions/teacher/:id', isAuthenticated, async (req, res) => {
    try {
      const teacherId = parseInt(req.params.id);
      const substitutions = await storage.getSubstitutionsByTeacher(teacherId);
      res.json(substitutions);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.post('/api/substitutions', isAdmin, async (req, res) => {
    try {
      const validatedData = insertSubstitutionSchema.parse(req.body);
      const substitution = await storage.createSubstitution(validatedData);
      res.status(201).json(substitution);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  });

  // Settings routes
  app.get('/api/settings', isAuthenticated, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.put('/api/settings', isAdmin, async (req, res) => {
    try {
      const settings = await storage.updateSettings(req.body);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // CSV import routes
  app.post('/api/import/teachers', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const csvString = req.file.buffer.toString('utf8');
      const { data } = Papa.parse(csvString, { header: true, skipEmptyLines: true });

      const teachers = [];
      for (const row of data) {
        const teacher = {
          username: row.username || `${row.firstName.toLowerCase()}.${row.lastName.toLowerCase()}`,
          password: row.password || 'teacher123', // In a real app, generate a secure password
          email: row.email || `${row.firstName.toLowerCase()}.${row.lastName.toLowerCase()}@eduschool.com`,
          firstName: row.firstName || '',
          lastName: row.lastName || '',
          role: 'teacher',
          subjects: row.subjects ? row.subjects.split(',').map((s: string) => s.trim()) : []
        };

        try {
          const validatedTeacher = insertUserSchema.parse(teacher);
          const createdTeacher = await storage.createUser(validatedTeacher);
          teachers.push(createdTeacher);
        } catch (error) {
          // Skip invalid entries
          console.error('Invalid teacher data:', error);
        }
      }

      res.status(201).json({ 
        message: `Successfully imported ${teachers.length} teachers`,
        teachers
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to import teachers' });
    }
  });

  app.post('/api/import/students', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const csvString = req.file.buffer.toString('utf8');
      const { data } = Papa.parse(csvString, { header: true, skipEmptyLines: true });

      const students = [];
      for (const row of data) {
        const student = {
          firstName: row.firstName || '',
          lastName: row.lastName || '',
          classId: parseInt(row.classId) || 0,
          email: row.email || `${row.firstName.toLowerCase()}.${row.lastName.toLowerCase()}@student.eduschool.com`,
        };

        try {
          const validatedStudent = insertStudentSchema.parse(student);
          const createdStudent = await storage.createStudent(validatedStudent);
          students.push(createdStudent);
        } catch (error) {
          // Skip invalid entries
          console.error('Invalid student data:', error);
        }
      }

      res.status(201).json({ 
        message: `Successfully imported ${students.length} students`,
        students
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to import students' });
    }
  });

  app.post('/api/import/classes', isAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      const csvString = req.file.buffer.toString('utf8');
      const { data } = Papa.parse(csvString, { header: true, skipEmptyLines: true });

      const classes = [];
      for (const row of data) {
        const cls = {
          name: row.name || '',
          grade: row.grade || '',
          section: row.section || '',
          roomNumber: row.roomNumber || ''
        };

        try {
          const validatedClass = insertClassSchema.parse(cls);
          const createdClass = await storage.createClass(validatedClass);
          classes.push(createdClass);
        } catch (error) {
          // Skip invalid entries
          console.error('Invalid class data:', error);
        }
      }

      res.status(201).json({ 
        message: `Successfully imported ${classes.length} classes`,
        classes
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to import classes' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
