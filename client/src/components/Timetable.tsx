import { useMemo } from "react";
import { format } from "date-fns";
import { Link } from "wouter";

interface TimetableEntry {
  id: number;
  teacherId: number;
  classId: number | null;
  subjectId: number | null;
  timeSlotId: number;
  dayOfWeek: number;
  roomNumber: string | null;
  isFreePeriod: boolean;
}

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
  subjects: string[];
}

interface Class {
  id: number;
  name: string;
  grade: string;
  section: string;
  roomNumber: string;
}

interface Subject {
  id: number;
  name: string;
  color: string;
}

interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  label: string;
}

interface TimetableProps {
  entries: TimetableEntry[];
  teachers: Teacher[];
  classes: Class[];
  subjects: Subject[];
  timeSlots: TimeSlot[];
  date: Date;
  isAdminView?: boolean;
  teacherId?: number;
  onEntryClick?: (entry: TimetableEntry) => void;
  onTeacherClick?: (teacher: Teacher) => void;
}

export function Timetable({
  entries,
  teachers,
  classes,
  subjects,
  timeSlots,
  date,
  isAdminView = true,
  teacherId,
  onEntryClick,
  onTeacherClick,
}: TimetableProps) {
  // Get day of week from date (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Convert Sunday from 0 to 7 for consistency

  // Filter entries for the current day
  const dayEntries = useMemo(() => {
    return entries.filter((entry) => entry.dayOfWeek === dayOfWeek);
  }, [entries, dayOfWeek]);

  // Filter entries for a specific teacher if teacherId is provided
  const filteredEntries = useMemo(() => {
    if (teacherId) {
      return dayEntries.filter((entry) => entry.teacherId === teacherId);
    }
    return dayEntries;
  }, [dayEntries, teacherId]);

  // Group entries by teacher and timeslot for admin view
  const entriesByTeacherAndTimeSlot = useMemo(() => {
    const result = new Map<number, Map<number, TimetableEntry>>();
    
    teachers.forEach((teacher) => {
      result.set(teacher.id, new Map());
    });

    filteredEntries.forEach((entry) => {
      if (!result.has(entry.teacherId)) {
        result.set(entry.teacherId, new Map());
      }
      const teacherMap = result.get(entry.teacherId);
      if (teacherMap) {
        teacherMap.set(entry.timeSlotId, entry);
      }
    });

    return result;
  }, [filteredEntries, teachers]);

  // For teacher view, group entries by timeslot
  const entriesByTimeSlot = useMemo(() => {
    const result = new Map<number, TimetableEntry>();
    
    filteredEntries.forEach((entry) => {
      result.set(entry.timeSlotId, entry);
    });
    
    return result;
  }, [filteredEntries]);

  // Get class info by id
  const getClassInfo = (classId: number | null) => {
    if (!classId) return null;
    return classes.find((cls) => cls.id === classId);
  };

  // Get subject info by id
  const getSubjectInfo = (subjectId: number | null) => {
    if (!subjectId) return null;
    return subjects.find((subject) => subject.id === subjectId);
  };

  // Get time slot info by id
  const getTimeSlotInfo = (timeSlotId: number) => {
    return timeSlots.find((slot) => slot.id === timeSlotId);
  };

  // Handle clicking on a timetable cell
  const handleCellClick = (entry: TimetableEntry) => {
    if (onEntryClick) {
      onEntryClick(entry);
    }
  };

  // Handle clicking on a teacher
  const handleTeacherClick = (teacher: Teacher) => {
    if (onTeacherClick) {
      onTeacherClick(teacher);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {isAdminView ? "Today's Timetable" : "My Timetable"}
        </h2>
        <div className="flex items-center space-x-3">
          <span className="text-gray-700">{format(date, "EEEE, MMMM d, yyyy")}</span>
        </div>
      </div>

      {/* Time periods header */}
      <div className={`mt-4 grid ${isAdminView ? 'grid-cols-8' : 'grid-cols-7'} gap-2`}>
        {isAdminView && (
          <div className="col-span-1 h-12 flex items-end justify-center pb-2">
            <span className="text-sm font-medium text-gray-500">Teachers</span>
          </div>
        )}
        
        {timeSlots.map((slot) => (
          <div
            key={slot.id}
            className="col-span-1 h-12 flex flex-col items-center justify-end pb-2"
          >
            <span className="text-sm font-medium text-gray-500">
              {slot.startTime}
            </span>
            <span className="text-xs text-gray-400">{slot.label}</span>
          </div>
        ))}
      </div>

      {/* Timetable grid */}
      <div className="border rounded-lg bg-white overflow-hidden shadow mt-2">
        {isAdminView ? (
          // Admin view - show all teachers
          teachers.map((teacher) => (
            <div key={teacher.id} className="grid grid-cols-8 gap-px bg-gray-200">
              {/* Teacher column */}
              <div
                className="col-span-1 bg-white p-3 flex items-center cursor-pointer hover:bg-gray-50"
                onClick={() => handleTeacherClick(teacher)}
              >
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">
                  <span className="font-medium">
                    {teacher.firstName.charAt(0)}
                    {teacher.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {teacher.firstName} {teacher.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {teacher.subjects.join(", ")}
                  </p>
                </div>
              </div>

              {/* Class blocks for each time slot */}
              {timeSlots.map((slot) => {
                const teacherEntries = entriesByTeacherAndTimeSlot.get(teacher.id);
                const entry = teacherEntries ? teacherEntries.get(slot.id) : undefined;
                const classInfo = entry && entry.classId ? getClassInfo(entry.classId) : null;
                const subjectInfo = entry && entry.subjectId ? getSubjectInfo(entry.subjectId) : null;

                return (
                  <div key={slot.id} className="col-span-1 bg-white p-2">
                    {entry ? (
                      entry.isFreePeriod ? (
                        <div className="timetable-cell rounded-lg bg-gray-50 border border-gray-200 p-2">
                          <p className="text-sm font-medium text-gray-800">
                            {slot.label === "Lunch" ? "Lunch Break" : "Free Period"}
                          </p>
                          {slot.label !== "Lunch" && (
                            <p className="text-xs text-gray-500">Prep Time</p>
                          )}
                        </div>
                      ) : (
                        <div
                          className={`timetable-cell rounded-lg ${
                            subjectInfo
                              ? `bg-${subjectInfo.color}-50 border border-${subjectInfo.color}-200`
                              : "bg-blue-50 border border-blue-200"
                          } p-2 cursor-pointer`}
                          onClick={() => handleCellClick(entry)}
                        >
                          <p className={`text-sm font-medium ${
                            subjectInfo
                              ? `text-${subjectInfo.color}-800`
                              : "text-blue-800"
                          }`}>
                            {subjectInfo ? subjectInfo.name : "Class"}
                          </p>
                          {classInfo && (
                            <p className={`text-xs ${
                              subjectInfo
                                ? `text-${subjectInfo.color}-600`
                                : "text-blue-600"
                            }`}>
                              {classInfo.name}
                            </p>
                          )}
                          {entry.roomNumber && (
                            <p className={`text-xs ${
                              subjectInfo
                                ? `text-${subjectInfo.color}-600`
                                : "text-blue-600"
                            }`}>
                              Room {entry.roomNumber}
                            </p>
                          )}
                        </div>
                      )
                    ) : (
                      <div className="timetable-cell rounded-lg bg-gray-50 border border-gray-200 p-2 opacity-50">
                        <p className="text-sm font-medium text-gray-500">No Class</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          // Teacher view - show only current teacher's schedule
          <div className="grid grid-cols-7 gap-px bg-gray-200">
            {/* Time slots cells for teacher view */}
            {timeSlots.map((slot) => {
              const entry = entriesByTimeSlot.get(slot.id);
              const classInfo = entry && entry.classId ? getClassInfo(entry.classId) : null;
              const subjectInfo = entry && entry.subjectId ? getSubjectInfo(entry.subjectId) : null;

              return (
                <div key={slot.id} className="col-span-1 bg-white p-2">
                  {entry ? (
                    entry.isFreePeriod ? (
                      <div className="timetable-cell rounded-lg bg-gray-50 border border-gray-200 p-2">
                        <p className="text-sm font-medium text-gray-800">
                          {slot.label === "Lunch" ? "Lunch Break" : "Free Period"}
                        </p>
                        {slot.label !== "Lunch" && (
                          <p className="text-xs text-gray-500">Prep Time</p>
                        )}
                      </div>
                    ) : (
                      <Link href={`/teacher/class/${entry.id}`}>
                        <a className={`block timetable-cell rounded-lg ${
                          subjectInfo
                            ? `bg-${subjectInfo.color}-50 border border-${subjectInfo.color}-200`
                            : "bg-blue-50 border border-blue-200"
                        } p-2 cursor-pointer hover:shadow-md transition-shadow`}>
                          <p className={`text-sm font-medium ${
                            subjectInfo
                              ? `text-${subjectInfo.color}-800`
                              : "text-blue-800"
                          }`}>
                            {subjectInfo ? subjectInfo.name : "Class"}
                          </p>
                          {classInfo && (
                            <p className={`text-xs ${
                              subjectInfo
                                ? `text-${subjectInfo.color}-600`
                                : "text-blue-600"
                            }`}>
                              {classInfo.name}
                            </p>
                          )}
                          {entry.roomNumber && (
                            <p className={`text-xs ${
                              subjectInfo
                                ? `text-${subjectInfo.color}-600`
                                : "text-blue-600"
                            }`}>
                              Room {entry.roomNumber}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </a>
                      </Link>
                    )
                  ) : (
                    <div className="timetable-cell rounded-lg bg-gray-50 border border-gray-200 p-2 opacity-50">
                      <p className="text-sm font-medium text-gray-500">No Class</p>
                      <p className="text-xs text-gray-400">
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
