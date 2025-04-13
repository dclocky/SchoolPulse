import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Role enum for users
export const roleEnum = pgEnum('role', ['admin', 'teacher']);

// User model
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: roleEnum("role").notNull().default('teacher'),
  subjects: json("subjects").$type<string[]>().default([]),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Subject model
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull(),
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

// Class model
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grade: text("grade").notNull(),
  section: text("section").notNull(),
  roomNumber: text("room_number"),
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

// Time slots for the timetable
export const timeSlots = pgTable("time_slots", {
  id: serial("id").primaryKey(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  label: text("label").notNull(), // e.g. "Period 1", "Lunch"
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({
  id: true,
});

// Timetable entry model
export const timetableEntries = pgTable("timetable_entries", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  classId: integer("class_id"),
  subjectId: integer("subject_id"),
  timeSlotId: integer("time_slot_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 for Sunday-Saturday
  roomNumber: text("room_number"),
  isFreePeriod: boolean("is_free_period").default(false),
});

export const insertTimetableEntrySchema = createInsertSchema(timetableEntries).omit({
  id: true,
});

// Students model
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  classId: integer("class_id").notNull(),
  email: text("email"),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
});

// Class session represents a specific instance of a class
export const classSessions = pgTable("class_sessions", {
  id: serial("id").primaryKey(),
  timetableEntryId: integer("timetable_entry_id").notNull(),
  date: timestamp("date").notNull(),
  notes: text("notes"),
  lessonPlan: text("lesson_plan"),
});

export const insertClassSessionSchema = createInsertSchema(classSessions).omit({
  id: true,
});

// Attendance model
export const attendanceRecords = pgTable("attendance_records", {
  id: serial("id").primaryKey(),
  classSessionId: integer("class_session_id").notNull(),
  studentId: integer("student_id").notNull(),
  status: text("status").notNull(), // "present", "absent", "late"
  timestamp: timestamp("timestamp").notNull(),
});

export const insertAttendanceRecordSchema = createInsertSchema(attendanceRecords).omit({
  id: true,
});

// Homework model
export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  classSessionId: integer("class_session_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
});

export const insertHomeworkSchema = createInsertSchema(homework).omit({
  id: true,
});

// Substitution model
export const substitutions = pgTable("substitutions", {
  id: serial("id").primaryKey(),
  originalTeacherId: integer("original_teacher_id").notNull(),
  substituteTeacherId: integer("substitute_teacher_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
});

export const insertSubstitutionSchema = createInsertSchema(substitutions).omit({
  id: true,
});

// Settings model
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  semesterStartDate: timestamp("semester_start_date").notNull(),
  semesterEndDate: timestamp("semester_end_date").notNull(),
  schoolName: text("school_name").notNull().default('EduSchedule School'),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Subject = typeof subjects.$inferSelect;
export type InsertSubject = z.infer<typeof insertSubjectSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type TimeSlot = typeof timeSlots.$inferSelect;
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;

export type TimetableEntry = typeof timetableEntries.$inferSelect;
export type InsertTimetableEntry = z.infer<typeof insertTimetableEntrySchema>;

export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;

export type ClassSession = typeof classSessions.$inferSelect;
export type InsertClassSession = z.infer<typeof insertClassSessionSchema>;

export type AttendanceRecord = typeof attendanceRecords.$inferSelect;
export type InsertAttendanceRecord = z.infer<typeof insertAttendanceRecordSchema>;

export type Homework = typeof homework.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;

export type Substitution = typeof substitutions.$inferSelect;
export type InsertSubstitution = z.infer<typeof insertSubstitutionSchema>;

export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
