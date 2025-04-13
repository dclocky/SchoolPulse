import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useTeachers() {
  const { toast } = useToast();

  // Fetch all teachers
  const teachersQuery = useQuery({
    queryKey: ['/api/teachers'],
  });

  // Get a specific teacher by ID
  const getTeacher = (teacherId: number) => {
    if (!teachersQuery.data) return null;
    return teachersQuery.data.find((teacher: any) => teacher.id === teacherId);
  };

  // Create a new teacher
  const createTeacher = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/users', {
        ...data,
        role: 'teacher'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teachers'] });
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create teacher",
        variant: "destructive",
      });
    },
  });

  // Fetch timetable entries for a specific teacher
  const getTeacherTimetable = (teacherId: number) => {
    return useQuery({
      queryKey: ['/api/timetable/teacher', teacherId],
      queryFn: async () => {
        const res = await fetch(`/api/timetable/teacher/${teacherId}`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Failed to fetch teacher timetable');
        }
        return res.json();
      },
      enabled: !!teacherId,
    });
  };

  // Fetch substitutions for a specific teacher
  const getTeacherSubstitutions = (teacherId: number) => {
    return useQuery({
      queryKey: ['/api/substitutions/teacher', teacherId],
      queryFn: async () => {
        const res = await fetch(`/api/substitutions/teacher/${teacherId}`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Failed to fetch substitutions');
        }
        return res.json();
      },
      enabled: !!teacherId,
    });
  };

  // Create a substitution
  const createSubstitution = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/substitutions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/substitutions'] });
      toast({
        title: "Success",
        description: "Substitute teacher assigned successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign substitute teacher",
        variant: "destructive",
      });
    },
  });

  // Filter teachers by name or subjects
  const filterTeachers = (query: string) => {
    if (!teachersQuery.data) return [];
    if (!query) return teachersQuery.data;
    
    const lowerQuery = query.toLowerCase();
    return teachersQuery.data.filter((teacher: any) => {
      const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
      const hasMatchingSubject = teacher.subjects?.some((subject: string) => 
        subject.toLowerCase().includes(lowerQuery)
      );
      
      return fullName.includes(lowerQuery) || hasMatchingSubject;
    });
  };

  return {
    teachers: teachersQuery.data,
    isLoading: teachersQuery.isLoading,
    error: teachersQuery.error,
    getTeacher,
    createTeacher,
    getTeacherTimetable,
    getTeacherSubstitutions,
    createSubstitution,
    filterTeachers,
  };
}
