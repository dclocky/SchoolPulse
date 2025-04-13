import { useQuery } from "@tanstack/react-query";

interface UseTimetableOptions {
  teacherId?: number;
  dayOfWeek?: number;
  includeTimeSlots?: boolean;
  includeClasses?: boolean;
  includeSubjects?: boolean;
}

export function useTimetable({
  teacherId,
  dayOfWeek,
  includeTimeSlots = true,
  includeClasses = true,
  includeSubjects = true,
}: UseTimetableOptions = {}) {
  // Fetch timetable entries
  const { 
    data: timetableEntries, 
    isLoading: loadingTimetable,
    error: timetableError,
    ...rest
  } = useQuery({
    queryKey: teacherId 
      ? ['/api/timetable/teacher', teacherId] 
      : dayOfWeek 
        ? ['/api/timetable/day', dayOfWeek]
        : ['/api/timetable'],
    queryFn: async () => {
      let url = '/api/timetable';
      
      if (teacherId) {
        url = `/api/timetable/teacher/${teacherId}`;
      } else if (dayOfWeek !== undefined) {
        url = `/api/timetable/day/${dayOfWeek}`;
      }
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch timetable');
      }
      return res.json();
    }
  });

  // Fetch time slots if needed
  const { 
    data: timeSlots,
    isLoading: loadingTimeSlots,
    error: timeSlotsError,
  } = useQuery({
    queryKey: ['/api/timeslots'],
    enabled: includeTimeSlots,
  });

  // Fetch classes if needed
  const {
    data: classes,
    isLoading: loadingClasses,
    error: classesError,
  } = useQuery({
    queryKey: ['/api/classes'],
    enabled: includeClasses,
  });

  // Fetch subjects if needed
  const {
    data: subjects,
    isLoading: loadingSubjects,
    error: subjectsError,
  } = useQuery({
    queryKey: ['/api/subjects'],
    enabled: includeSubjects,
  });

  // Helper functions
  const getClassName = (classId: number | null) => {
    if (!classId || !classes) return "Free Period";
    const cls = classes.find((c: any) => c.id === classId);
    return cls ? cls.name : "Unknown Class";
  };

  const getSubjectName = (subjectId: number | null) => {
    if (!subjectId || !subjects) return "";
    const subject = subjects.find((s: any) => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };
  
  const getTimeSlot = (timeSlotId: number) => {
    if (!timeSlots) return null;
    return timeSlots.find((ts: any) => ts.id === timeSlotId);
  };

  // Filter entries by day if dayOfWeek is provided
  const entriesByDay = timetableEntries?.reduce((acc: any, entry: any) => {
    const day = entry.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {});

  const isLoading = loadingTimetable || 
    (includeTimeSlots && loadingTimeSlots) ||
    (includeClasses && loadingClasses) ||
    (includeSubjects && loadingSubjects);

  const error = timetableError || 
    (includeTimeSlots && timeSlotsError) ||
    (includeClasses && classesError) ||
    (includeSubjects && subjectsError);

  return {
    timetableEntries,
    timeSlots,
    classes,
    subjects,
    entriesByDay,
    getClassName,
    getSubjectName,
    getTimeSlot,
    isLoading,
    error,
    ...rest
  };
}
