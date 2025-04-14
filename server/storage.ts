
import { IStorage } from './database-storage';
import { DatabaseStorage } from './database-storage';
import { db } from './db';
import session from 'express-session';
import { MemoryStore } from 'memorystore';

// Export the database storage instance
export const storage = new DatabaseStorage();

// Initialize sample data
async function initializeSampleData() {
  try {
    // Create sample subjects if they don't exist
    const existingSubjects = await storage.getSubjects();
    if (existingSubjects.length === 0) {
      const subjects = [
        { name: 'Mathematics', color: '#FF5733' },
        { name: 'English', color: '#33FF57' },
        { name: 'Science', color: '#3357FF' },
        { name: 'History', color: '#FF33E9' },
        { name: 'Geography', color: '#33FFF6' },
        { name: 'Physics', color: '#FFB233' }
      ];

      for (const subject of subjects) {
        await storage.createSubject(subject);
      }
    }

    // Create sample classes if they don't exist
    const existingClasses = await storage.getClasses();
    if (existingClasses.length === 0) {
      const classes = [
        { name: 'Class 10A', grade: '10', section: 'A', roomNumber: '101' },
        { name: 'Class 9B', grade: '9', section: 'B', roomNumber: '102' },
        { name: 'Class 11C', grade: '11', section: 'C', roomNumber: '103' },
        { name: 'Class 12A', grade: '12', section: 'A', roomNumber: '104' }
      ];

      for (const cls of classes) {
        await storage.createClass(cls);
      }
    }

    // Create sample time slots if they don't exist
    const existingTimeSlots = await storage.getTimeSlots();
    if (existingTimeSlots.length === 0) {
      const timeSlots = [
        { startTime: '09:00', endTime: '10:00', label: 'Period 1' },
        { startTime: '10:00', endTime: '11:00', label: 'Period 2' },
        { startTime: '11:15', endTime: '12:15', label: 'Period 3' },
        { startTime: '12:15', endTime: '13:15', label: 'Lunch Break' },
        { startTime: '13:15', endTime: '14:15', label: 'Period 4' },
        { startTime: '14:15', endTime: '15:15', label: 'Period 5' },
        { startTime: '15:30', endTime: '16:30', label: 'Period 6' }
      ];

      for (const timeSlot of timeSlots) {
        await storage.createTimeSlot(timeSlot);
      }
    }

    // Create sample teachers if they don't exist
    const existingTeachers = await storage.getTeachers();
    if (existingTeachers.length === 0) {
      const teachers = [
        { username: 'jsmith', password: 'teacher123', email: 'john.smith@school.com', firstName: 'John', lastName: 'Smith', role: 'teacher', subjects: ['Mathematics', 'Physics'] },
        { username: 'mjohnson', password: 'teacher123', email: 'mary.johnson@school.com', firstName: 'Mary', lastName: 'Johnson', role: 'teacher', subjects: ['English', 'History'] },
        { username: 'rparker', password: 'teacher123', email: 'robert.parker@school.com', firstName: 'Robert', lastName: 'Parker', role: 'teacher', subjects: ['Science', 'Geography'] }
      ];

      for (const teacher of teachers) {
        await storage.createUser(teacher);
      }
    }

    // Get created data IDs for timetable entries
    const subjects = await storage.getSubjects();
    const classes = await storage.getClasses();
    const timeSlots = await storage.getTimeSlots();
    const teachers = await storage.getTeachers();

    // Create sample timetable entries if they don't exist
    const existingEntries = await storage.getTimetableEntries();
    if (existingEntries.length === 0) {
      // Create a week's worth of timetable entries for each teacher
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        for (const teacher of teachers) {
          for (let period = 0; period < 6; period++) {
            const isFreePeriod = Math.random() > 0.8; // 20% chance of free period
            if (!isFreePeriod) {
              const entry = {
                teacherId: teacher.id,
                classId: classes[Math.floor(Math.random() * classes.length)].id,
                subjectId: subjects[Math.floor(Math.random() * subjects.length)].id,
                timeSlotId: timeSlots[period].id,
                dayOfWeek: day,
                roomNumber: `10${period + 1}`,
                isFreePeriod: false
              };
              await storage.createTimetableEntry(entry);
            }
          }
        }
      }
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Call initialization
initializeSampleData().catch(console.error);
  try {
    // Create sample subjects if they don't exist
    const existingSubjects = await storage.getSubjects();
    if (existingSubjects.length === 0) {
      const subjects = [
        { name: 'Mathematics', color: '#FF5733' },
        { name: 'English', color: '#33FF57' },
        { name: 'Science', color: '#3357FF' },
        { name: 'History', color: '#FF33E9' },
        { name: 'Geography', color: '#33FFF6' },
        { name: 'Physics', color: '#FFB233' }
      ];

      for (const subject of subjects) {
        await storage.createSubject(subject);
      }
    }

    // Create sample classes if they don't exist
    const existingClasses = await storage.getClasses();
    if (existingClasses.length === 0) {
      const classes = [
        { name: 'Class 10A', grade: '10', section: 'A', roomNumber: '101' },
        { name: 'Class 9B', grade: '9', section: 'B', roomNumber: '102' },
        { name: 'Class 11C', grade: '11', section: 'C', roomNumber: '103' },
        { name: 'Class 12A', grade: '12', section: 'A', roomNumber: '104' }
      ];

      for (const cls of classes) {
        await storage.createClass(cls);
      }
    }

    // Create sample time slots if they don't exist
    const existingTimeSlots = await storage.getTimeSlots();
    if (existingTimeSlots.length === 0) {
      const timeSlots = [
        { startTime: '09:00', endTime: '10:00', label: 'Period 1' },
        { startTime: '10:00', endTime: '11:00', label: 'Period 2' },
        { startTime: '11:15', endTime: '12:15', label: 'Period 3' },
        { startTime: '12:15', endTime: '13:15', label: 'Lunch Break' },
        { startTime: '13:15', endTime: '14:15', label: 'Period 4' },
        { startTime: '14:15', endTime: '15:15', label: 'Period 5' },
        { startTime: '15:30', endTime: '16:30', label: 'Period 6' }
      ];

      for (const timeSlot of timeSlots) {
        await storage.createTimeSlot(timeSlot);
      }
    }

    // Create sample teachers if they don't exist
    const existingTeachers = await storage.getTeachers();
    if (existingTeachers.length === 0) {
      const teachers = [
        { username: 'jsmith', password: 'teacher123', email: 'john.smith@school.com', firstName: 'John', lastName: 'Smith', role: 'teacher', subjects: ['Mathematics', 'Physics'] },
        { username: 'mjohnson', password: 'teacher123', email: 'mary.johnson@school.com', firstName: 'Mary', lastName: 'Johnson', role: 'teacher', subjects: ['English', 'History'] },
        { username: 'rparker', password: 'teacher123', email: 'robert.parker@school.com', firstName: 'Robert', lastName: 'Parker', role: 'teacher', subjects: ['Science', 'Geography'] }
      ];

      for (const teacher of teachers) {
        await storage.createUser(teacher);
      }
    }

    // Get created data IDs for timetable entries
    const subjects = await storage.getSubjects();
    const classes = await storage.getClasses();
    const timeSlots = await storage.getTimeSlots();
    const teachers = await storage.getTeachers();

    // Create sample timetable entries if they don't exist
    const existingEntries = await storage.getTimetableEntries();
    if (existingEntries.length === 0) {
      // Create a week's worth of timetable entries for each teacher
      for (let day = 1; day <= 5; day++) { // Monday to Friday
        for (const teacher of teachers) {
          for (let period = 0; period < 6; period++) {
            const isFreePeriod = Math.random() > 0.8; // 20% chance of free period
            if (!isFreePeriod) {
              const entry = {
                teacherId: teacher.id,
                classId: classes[Math.floor(Math.random() * classes.length)].id,
                subjectId: subjects[Math.floor(Math.random() * subjects.length)].id,
                timeSlotId: timeSlots[period].id,
                dayOfWeek: day,
                roomNumber: `10${period + 1}`,
                isFreePeriod: false
              };
              await storage.createTimetableEntry(entry);
            }
          }
        }
      }
    }

    // Create sample students if they don't exist
    const existingStudents = await storage.getStudents();
    if (existingStudents.length === 0) {
      for (const cls of classes) {
        const studentCount = Math.floor(Math.random() * 10) + 20; // 20-30 students per class
        for (let i = 1; i <= studentCount; i++) {
          const student = {
            firstName: `Student${i}`,
            lastName: `Class${cls.grade}${cls.section}`,
            email: `student${i}.${cls.grade}${cls.section}@school.com`,
            classId: cls.id
          };
          await storage.createStudent(student);
        }
      }
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Call initialization
initializeSampleData().catch(console.error);

// Re-export the IStorage interface
export type { IStorage };
