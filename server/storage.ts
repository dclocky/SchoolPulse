import { IStorage } from './database-storage';
import { DatabaseStorage } from './database-storage';

// Initialize storage
export const storage = new DatabaseStorage({
  connection,
  sessionStore: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
});

// Initialize sample data
async function initializeSampleData() {
  try {
    // Create sample subjects
    const subjects = [
      { id: 1, name: 'Mathematics', color: '#FF5733' },
      { id: 2, name: 'English', color: '#33FF57' },
      { id: 3, name: 'Science', color: '#3357FF' }
    ];

    // Create sample classes
    const classes = [
      { id: 1, name: 'Class 10A', grade: '10', section: 'A', roomNumber: '101' },
      { id: 2, name: 'Class 9B', grade: '9', section: 'B', roomNumber: '102' }
    ];

    // Create sample time slots
    const timeSlots = [
      { id: 1, startTime: '09:00', endTime: '10:00', label: 'Period 1' },
      { id: 2, startTime: '10:00', endTime: '11:00', label: 'Period 2' },
      { id: 3, startTime: '11:15', endTime: '12:15', label: 'Period 3' }
    ];

    // Create sample teachers
    const teachers = [
      { id: 1, username: 'jsmith', password: 'teacher123', email: 'john.smith@school.com', firstName: 'John', lastName: 'Smith', role: 'teacher', subjects: ['Mathematics'] },
      { id: 2, username: 'mjohnson', password: 'teacher123', email: 'mary.johnson@school.com', firstName: 'Mary', lastName: 'Johnson', role: 'teacher', subjects: ['English'] }
    ];

    // Create sample timetable entries
    const timetableEntries = [
      { id: 1, teacherId: 1, classId: 1, subjectId: 1, timeSlotId: 1, dayOfWeek: 1, roomNumber: '101', isFreePeriod: false },
      { id: 2, teacherId: 2, classId: 2, subjectId: 2, timeSlotId: 2, dayOfWeek: 1, roomNumber: '102', isFreePeriod: false },
      { id: 3, teacherId: 1, classId: 2, subjectId: 1, timeSlotId: 3, dayOfWeek: 1, roomNumber: '102', isFreePeriod: false }
    ];

    // Insert sample data
    for (const subject of subjects) {
      await storage.createSubject(subject);
    }

    for (const cls of classes) {
      await storage.createClass(cls);
    }

    for (const timeSlot of timeSlots) {
      await storage.createTimeSlot(timeSlot);
    }

    for (const teacher of teachers) {
      await storage.createUser(teacher);
    }

    for (const entry of timetableEntries) {
      await storage.createTimetableEntry(entry);
    }

    console.log('Sample data initialized successfully');
  } catch (error) {
    console.error('Error initializing sample data:', error);
  }
}

// Call initialization
initializeSampleData();

// Re-export the IStorage interface
export type { IStorage };