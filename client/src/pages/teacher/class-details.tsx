import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { 
  BookOpen, 
  Users, 
  Clock, 
  ChevronLeft, 
  Save, 
  FileText,
  Plus,
  Upload,
  Loader2
} from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { useAuth } from "@/context/AuthContext";

// Schema for notes form
const notesSchema = z.object({
  notes: z.string().optional(),
  lessonPlan: z.string().optional(),
});

// Schema for homework form
const homeworkSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
});

export default function ClassDetails({ id }: { id: string }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [timerActive, setTimerActive] = useState<boolean>(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);

  // Fetch timetable entry
  const { data: entry, isLoading: loadingEntry } = useQuery({
    queryKey: ['/api/timetable', id],
    queryFn: async () => {
      const res = await fetch(`/api/timetable/${id}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch class details');
      }
      return res.json();
    }
  });

  // Fetch class info
  const { data: classInfo, isLoading: loadingClass } = useQuery({
    queryKey: ['/api/classes', entry?.classId],
    queryFn: async () => {
      if (!entry?.classId) return null;
      const res = await fetch(`/api/classes/${entry.classId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch class info');
      }
      return res.json();
    },
    enabled: !!entry?.classId,
  });

  // Fetch subject info
  const { data: subjectInfo, isLoading: loadingSubject } = useQuery({
    queryKey: ['/api/subjects', entry?.subjectId],
    queryFn: async () => {
      if (!entry?.subjectId) return null;
      const res = await fetch(`/api/subjects/${entry.subjectId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch subject info');
      }
      return res.json();
    },
    enabled: !!entry?.subjectId,
  });

  // Fetch time slot info
  const { data: timeSlot, isLoading: loadingTimeSlot } = useQuery({
    queryKey: ['/api/timeslots', entry?.timeSlotId],
    queryFn: async () => {
      if (!entry?.timeSlotId) return null;
      const res = await fetch(`/api/timeslots/${entry.timeSlotId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch time slot info');
      }
      return res.json();
    },
    enabled: !!entry?.timeSlotId,
  });

  // Fetch students for this class
  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['/api/students/class', entry?.classId],
    queryFn: async () => {
      if (!entry?.classId) return [];
      const res = await fetch(`/api/students/class/${entry.classId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch students');
      }
      return res.json();
    },
    enabled: !!entry?.classId,
  });

  // Fetch class session (or create a new one if it doesn't exist)
  const { data: classSession, isLoading: loadingClassSession } = useQuery({
    queryKey: ['/api/classsessions/timetable', id],
    queryFn: async () => {
      const res = await fetch(`/api/classsessions/timetable/${id}`, { credentials: 'include' });
      
      if (res.status === 404) {
        // Create a new class session if one doesn't exist
        const today = new Date();
        const newSession = {
          timetableEntryId: parseInt(id),
          date: today,
          notes: "",
          lessonPlan: ""
        };
        
        const createRes = await apiRequest('POST', '/api/classsessions', newSession);
        return createRes.json();
      }
      
      if (!res.ok) {
        throw new Error('Failed to fetch class session');
      }
      
      const sessions = await res.json();
      // Return the most recent session
      return sessions.length > 0 ? sessions[0] : null;
    }
  });

  // Fetch homework for this class session
  const { data: homework, isLoading: loadingHomework } = useQuery({
    queryKey: ['/api/homework/classsession', classSession?.id],
    queryFn: async () => {
      if (!classSession?.id) return [];
      const res = await fetch(`/api/homework/classsession/${classSession.id}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch homework');
      }
      return res.json();
    },
    enabled: !!classSession?.id,
  });

  // Update class session mutation
  const updateClassSession = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', `/api/classsessions/${classSession.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/classsessions/timetable', id] });
      toast({
        title: "Success",
        description: "Class notes updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update class notes",
        variant: "destructive",
      });
    },
  });

  // Create homework mutation
  const createHomework = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/homework', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/homework/classsession', classSession?.id] });
      toast({
        title: "Success",
        description: "Homework assigned successfully",
      });
      homeworkForm.reset({
        title: "",
        description: "",
        dueDate: new Date(),
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign homework",
        variant: "destructive",
      });
    },
  });

  // Notes form
  const notesForm = useForm<z.infer<typeof notesSchema>>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      notes: classSession?.notes || "",
      lessonPlan: classSession?.lessonPlan || ""
    },
  });

  // Homework form
  const homeworkForm = useForm<z.infer<typeof homeworkSchema>>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: new Date(),
    },
  });

  // Update the form values when class session data is loaded
  useEffect(() => {
    if (classSession) {
      notesForm.reset({
        notes: classSession.notes || "",
        lessonPlan: classSession.lessonPlan || ""
      });
    }
  }, [classSession, notesForm]);

  // Class timer functionality
  useEffect(() => {
    let intervalId: number;
    
    if (timerActive && timerStartTime) {
      intervalId = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - timerStartTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      clearInterval(intervalId);
    };
  }, [timerActive, timerStartTime]);

  const toggleTimer = () => {
    if (timerActive) {
      setTimerActive(false);
    } else {
      setTimerStartTime(Date.now() - (elapsedTime * 1000));
      setTimerActive(true);
    }
  };

  const resetTimer = () => {
    setTimerActive(false);
    setElapsedTime(0);
    setTimerStartTime(null);
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Form submission handlers
  const onSubmitNotes = (values: z.infer<typeof notesSchema>) => {
    if (!classSession?.id) return;
    
    updateClassSession.mutate(values);
  };

  const onSubmitHomework = (values: z.infer<typeof homeworkSchema>) => {
    if (!classSession?.id) return;
    
    createHomework.mutate({
      ...values,
      classSessionId: classSession.id
    });
  };

  const isLoading = loadingEntry || loadingClass || loadingSubject || loadingTimeSlot || loadingStudents || loadingClassSession || loadingHomework;

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/teacher/dashboard">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading class details...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-2xl">
                        {subjectInfo?.name || "Class"} - {classInfo?.name || ""}
                      </CardTitle>
                      <p className="text-gray-500 mt-1">
                        {timeSlot?.startTime} - {timeSlot?.endTime} ({timeSlot?.label})
                        {entry?.roomNumber && ` • Room ${entry.roomNumber}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xl bg-gray-100 px-4 py-2 rounded-md">
                        {formatTime(elapsedTime)}
                      </div>
                      <div className="flex mt-2 space-x-2">
                        <Button 
                          size="sm" 
                          variant={timerActive ? "destructive" : "default"} 
                          onClick={toggleTimer}
                        >
                          {timerActive ? "Pause" : "Start"} Timer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={resetTimer}
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="attendance" className="space-y-4">
                    <TabsList className="grid grid-cols-4">
                      <TabsTrigger value="attendance" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Attendance</span>
                      </TabsTrigger>
                      <TabsTrigger value="notes" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Notes</span>
                      </TabsTrigger>
                      <TabsTrigger value="lesson" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Lesson Plan</span>
                      </TabsTrigger>
                      <TabsTrigger value="homework" className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="hidden sm:inline">Homework</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="attendance">
                      <AttendanceTracker 
                        students={students || []} 
                        classSessionId={classSession?.id}
                      />
                    </TabsContent>

                    <TabsContent value="notes">
                      <Form {...notesForm}>
                        <form onSubmit={notesForm.handleSubmit(onSubmitNotes)} className="space-y-4">
                          <FormField
                            control={notesForm.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class Notes</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Write your notes about today's class..."
                                    className="min-h-[200px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  These notes are for your reference and visible to administrators.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <Button 
                            type="submit" 
                            className="mt-4"
                            disabled={updateClassSession.isPending}
                          >
                            {updateClassSession.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Notes
                              </>
                            )}
                          </Button>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="lesson">
                      <Form {...notesForm}>
                        <form onSubmit={notesForm.handleSubmit(onSubmitNotes)} className="space-y-4">
                          <FormField
                            control={notesForm.control}
                            name="lessonPlan"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Lesson Plan</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Enter your lesson plan details..."
                                    className="min-h-[200px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Outline your teaching objectives and activities for this class.
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2">
                            <Button 
                              type="submit" 
                              className="mt-4"
                              disabled={updateClassSession.isPending}
                            >
                              {updateClassSession.isPending ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  Save Lesson Plan
                                </>
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              className="mt-4"
                            >
                              <Upload className="mr-2 h-4 w-4" />
                              Upload
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </TabsContent>

                    <TabsContent value="homework">
                      <div className="space-y-6">
                        {/* Previous homework section */}
                        <div>
                          <h3 className="text-lg font-medium mb-3">Previous Assignments</h3>
                          {homework?.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-md">
                              <p className="text-gray-500">No previous homework assignments</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {homework?.map((item: any) => (
                                <div key={item.id} className="p-4 border rounded-md bg-gray-50">
                                  <div className="flex justify-between">
                                    <h4 className="font-medium">{item.title}</h4>
                                    <span className="text-sm text-gray-500">
                                      Due: {format(new Date(item.dueDate), "MMM d, yyyy")}
                                    </span>
                                  </div>
                                  <p className="text-sm mt-2">{item.description}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* New homework form */}
                        <div>
                          <h3 className="text-lg font-medium mb-3">Assign New Homework</h3>
                          <Form {...homeworkForm}>
                            <form onSubmit={homeworkForm.handleSubmit(onSubmitHomework)} className="space-y-4">
                              <FormField
                                control={homeworkForm.control}
                                name="title"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter homework title" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={homeworkForm.control}
                                name="description"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Describe the homework assignment..."
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={homeworkForm.control}
                                name="dueDate"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Due Date</FormLabel>
                                    <FormControl>
                                      <DatePicker
                                        date={field.value}
                                        setDate={(date) => field.onChange(date)}
                                        placeholder="Select due date"
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button 
                                type="submit" 
                                className="mt-4"
                                disabled={createHomework.isPending}
                              >
                                {createHomework.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Assigning...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Assign Homework
                                  </>
                                )}
                              </Button>
                            </form>
                          </Form>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Class Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Subject</h3>
                    <p>{subjectInfo?.name || "Not assigned"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Class</h3>
                    <p>{classInfo?.name || "Not assigned"} {classInfo && `(Grade ${classInfo.grade}-${classInfo.section})`}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Room</h3>
                    <p>{entry?.roomNumber || "Not assigned"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Time</h3>
                    <p>{timeSlot?.startTime} - {timeSlot?.endTime} ({timeSlot?.label})</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Students</h3>
                    <p>{students?.length || 0} enrolled</p>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="mr-2 h-4 w-4" />
                        Student List
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Materials
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
