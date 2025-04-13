import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useClasses() {
  const { toast } = useToast();

  // Fetch all classes
  const classesQuery = useQuery({
    queryKey: ['/api/classes'],
  });

  // Get a specific class by ID
  const getClass = (classId: number) => {
    if (!classesQuery.data) return null;
    return classesQuery.data.find((cls: any) => cls.id === classId);
  };

  // Create a new class
  const createClass = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/classes', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classes'] });
      toast({
        title: "Success",
        description: "Class created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create class",
        variant: "destructive",
      });
    },
  });

  // Fetch students for a specific class
  const getStudentsForClass = (classId: number) => {
    return useQuery({
      queryKey: ['/api/students/class', classId],
      queryFn: async () => {
        const res = await fetch(`/api/students/class/${classId}`, { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Failed to fetch students');
        }
        return res.json();
      },
      enabled: !!classId,
    });
  };

  // Get timetable entries for a specific class
  const getClassTimetable = (classId: number) => {
    return useQuery({
      queryKey: ['/api/timetable/class', classId],
      queryFn: async () => {
        // Note: This endpoint doesn't exist in the current API
        // We'd need to filter the timetable entries on the client side
        const res = await fetch('/api/timetable', { credentials: 'include' });
        if (!res.ok) {
          throw new Error('Failed to fetch timetable');
        }
        const allEntries = await res.json();
        return allEntries.filter((entry: any) => entry.classId === classId);
      },
      enabled: !!classId,
    });
  };

  // Filter classes by grade, section, or name
  const filterClasses = (query: string) => {
    if (!classesQuery.data) return [];
    if (!query) return classesQuery.data;
    
    const lowerQuery = query.toLowerCase();
    return classesQuery.data.filter((cls: any) => 
      cls.name.toLowerCase().includes(lowerQuery) ||
      cls.grade.toLowerCase().includes(lowerQuery) ||
      cls.section.toLowerCase().includes(lowerQuery)
    );
  };

  return {
    classes: classesQuery.data,
    isLoading: classesQuery.isLoading,
    error: classesQuery.error,
    getClass,
    createClass,
    getStudentsForClass,
    getClassTimetable,
    filterClasses,
  };
}
