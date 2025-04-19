import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  CalendarDays, 
  Save, 
  PlusCircle, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
const fetcher = (url) => fetch(url).then((res) => res.json());
// Schema for timetable entry form
const timetableEntrySchema = z.object({
  teacherId: z.string().min(1, { message: "Teacher is required" }),
  classId: z.string().optional(),
  subjectId: z.string().optional(),
  timeSlotId: z.string().min(1, { message: "Time slot is required" }),
  dayOfWeek: z.string().min(1, { message: "Day of week is required" }),
  roomNumber: z.string().optional(),
  isFreePeriod: z.boolean().default(false),
});

export default function Timetable() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDay, setSelectedDay] = useState("1"); // Monday
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch data
  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['/api/teachers'],queryFn: () => fetcher('/api/teachers') });

  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['/api/classes'],queryFn: () => fetcher('/api/classes') });


  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['/api/subjects'],queryFn: () => fetcher('/api/subjects') });

  const { data: timeSlots, isLoading: loadingTimeSlots } = useQuery({
    queryKey: ['/api/timeslots'],queryFn: () => fetcher('/api/timeslots') });

  const { data: timetableEntries, isLoading: loadingTimetable } = useQuery({
    queryKey: ['/api/timetable'],queryFn: () => fetcher('/api/timetable') });

  const isLoading = loadingTeachers || loadingClasses || loadingSubjects || loadingTimeSlots || loadingTimetable;

  // Form setup
  const form = useForm<z.infer<typeof timetableEntrySchema>>({
    resolver: zodResolver(timetableEntrySchema),
    defaultValues: {
      teacherId: "",
      classId: "",
      subjectId: "",
      timeSlotId: "",
      dayOfWeek: selectedDay,
      roomNumber: "",
      isFreePeriod: false,
    },
  });

  // Reset form when editing entry changes
  useMemo(() => {
    if (editingEntry) {
      form.reset({
        teacherId: String(editingEntry.teacherId),
        classId: editingEntry.classId ? String(editingEntry.classId) : "",
        subjectId: editingEntry.subjectId ? String(editingEntry.subjectId) : "",
        timeSlotId: String(editingEntry.timeSlotId),
        dayOfWeek: String(editingEntry.dayOfWeek),
        roomNumber: editingEntry.roomNumber || "",
        isFreePeriod: editingEntry.isFreePeriod,
      });
    } else {
      form.reset({
        teacherId: selectedTeacher || "",
        classId: "",
        subjectId: "",
        timeSlotId: "",
        dayOfWeek: selectedDay,
        roomNumber: "",
        isFreePeriod: false,
      });
    }
  }, [editingEntry, selectedDay, selectedTeacher, form]);

  // Mutations for CRUD operations
  const createEntry = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/timetable', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      toast({
        title: "Success",
        description: "Timetable entry created successfully",
      });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create timetable entry",
        variant: "destructive",
      });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return apiRequest('PUT', `/api/timetable/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      toast({
        title: "Success",
        description: "Timetable entry updated successfully",
      });
      setIsDialogOpen(false);
      setEditingEntry(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update timetable entry",
        variant: "destructive",
      });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/timetable/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timetable'] });
      toast({
        title: "Success",
        description: "Timetable entry deleted successfully",
      });
      setEditingEntry(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete timetable entry",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof timetableEntrySchema>) => {
    // Convert string IDs to numbers
    const formattedData = {
      teacherId: parseInt(values.teacherId),
      classId: values.classId && values.isFreePeriod === false ? parseInt(values.classId) : null,
      subjectId: values.subjectId && values.isFreePeriod === false ? parseInt(values.subjectId) : null,
      timeSlotId: parseInt(values.timeSlotId),
      dayOfWeek: parseInt(values.dayOfWeek),
      roomNumber: values.roomNumber && values.isFreePeriod === false ? values.roomNumber : null,
      isFreePeriod: values.isFreePeriod,
    };

    if (editingEntry) {
      updateEntry.mutate({ id: editingEntry.id, data: formattedData });
    } else {
      createEntry.mutate(formattedData);
    }
  };

  // Filter timetable entries by day and teacher
  const filteredEntries = useMemo(() => {
    if (!timetableEntries) return [];
    
    let filtered = timetableEntries.filter((entry: any) => 
      entry.dayOfWeek === parseInt(selectedDay)
    );
    
    if (selectedTeacher) {
      filtered = filtered.filter((entry: any) => 
        entry.teacherId === parseInt(selectedTeacher)
      );
    }
    
    return filtered;
  }, [timetableEntries, selectedDay, selectedTeacher]);

  // Find existing entry for a teacher and time slot
  const findEntryForTeacherAndTimeSlot = (teacherId: number, timeSlotId: number) => {
    return filteredEntries.find((entry: any) => 
      entry.teacherId === teacherId && 
      entry.timeSlotId === timeSlotId
    );
  };

  // Helper function to check for conflicts
  const checkForConflicts = (values: any) => {
    if (!timetableEntries || values.isFreePeriod) return [];

    const conflicts = [];
    const dayOfWeek = parseInt(values.dayOfWeek);
    const timeSlotId = parseInt(values.timeSlotId);
    const teacherId = parseInt(values.teacherId);
    const classId = values.classId ? parseInt(values.classId) : null;
    const roomNumber = values.roomNumber;

    // Only check for conflicts if this is not a free period
    if (!values.isFreePeriod && classId && roomNumber) {
      // Check for teacher conflicts (same teacher, same time, different class)
      const teacherConflicts = timetableEntries.filter((entry: any) => 
        entry.dayOfWeek === dayOfWeek &&
        entry.timeSlotId === timeSlotId &&
        entry.teacherId === teacherId &&
        (editingEntry ? entry.id !== editingEntry.id : true)
      );
      
      if (teacherConflicts.length > 0) {
        conflicts.push("Teacher is already assigned to another class at this time");
      }

      // Check for class conflicts (same class, same time, different teacher)
      const classConflicts = timetableEntries.filter((entry: any) => 
        entry.dayOfWeek === dayOfWeek &&
        entry.timeSlotId === timeSlotId &&
        entry.classId === classId &&
        (editingEntry ? entry.id !== editingEntry.id : true)
      );
      
      if (classConflicts.length > 0) {
        conflicts.push("Class already has another teacher at this time");
      }

      // Check for room conflicts (same room, same time, different class/teacher)
      const roomConflicts = timetableEntries.filter((entry: any) => 
        entry.dayOfWeek === dayOfWeek &&
        entry.timeSlotId === timeSlotId &&
        entry.roomNumber === roomNumber &&
        (editingEntry ? entry.id !== editingEntry.id : true)
      );
      
      if (roomConflicts.length > 0) {
        conflicts.push("Room is already occupied at this time");
      }
    }

    return conflicts;
  };

  // Handle form value changes to check conflicts
  const formValues = form.watch();
  const conflicts = useMemo(() => {
    return checkForConflicts(formValues);
  }, [formValues, timetableEntries]);

  // Helper function to get day name
  const getDayName = (dayNum: string) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[parseInt(dayNum) % 7];
  };

  // Helper function to get teacher name
  const getTeacherName = (id: number) => {
    if (!teachers) return "Unknown Teacher";
    const teacher = teachers.find((t: any) => t.id === id);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown Teacher";
  };

  // Helper function to get class name
  const getClassName = (id: number | null) => {
    if (!id || !classes) return "Free Period";
    const cls = classes.find((c: any) => c.id === id);
    return cls ? cls.name : "Unknown Class";
  };

  // Helper function to get subject name
  const getSubjectName = (id: number | null) => {
    if (!id || !subjects) return "";
    const subject = subjects.find((s: any) => s.id === id);
    return subject ? subject.name : "Unknown Subject";
  };
  
  // Helper function to get time slot label
  const getTimeSlotLabel = (id: number) => {
    if (!timeSlots) return "Unknown Time";
    const slot = timeSlots.find((s: any) => s.id === id);
    return slot ? `${slot.startTime} - ${slot.endTime} (${slot.label})` : "Unknown Time";
  };

  const openNewEntryDialog = (teacherId?: string) => {
    setEditingEntry(null);
    if (teacherId) {
      form.setValue("teacherId", teacherId);
    }
    form.setValue("dayOfWeek", selectedDay);
    setIsDialogOpen(true);
  };

  const openEditEntryDialog = (entry: any) => {
    setEditingEntry(entry);
    setIsDialogOpen(true);
  };

  const handleDeleteEntry = (entry: any) => {
    if (confirm("Are you sure you want to delete this timetable entry?")) {
      deleteEntry.mutate(entry.id);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEntry(null);
  };

  // This effect watches for changes to isFreePeriod and updates form values accordingly
  const isFreePeriod = form.watch("isFreePeriod");
  useMemo(() => {
    if (isFreePeriod) {
      form.setValue("classId", "");
      form.setValue("subjectId", "");
      form.setValue("roomNumber", "");
    }
  }, [isFreePeriod, form]);

  // Render timetable grid
  const renderTimetableGrid = () => {
    if (!timeSlots || !teachers) return null;
    
    // If a specific teacher is selected, only show that teacher's row
    const displayTeachers = selectedTeacher 
      ? teachers.filter((t: any) => t.id === parseInt(selectedTeacher))
      : teachers;

    return (
      <div className="border rounded-lg bg-white overflow-hidden shadow mt-4">
        {/* Header row with time slots */}
        <div className="grid grid-cols-[200px_repeat(auto-fill,minmax(150px,1fr))] bg-gray-100">
          <div className="p-3 font-medium text-gray-700 border-b border-r">
            {getDayName(selectedDay)}
          </div>
          {timeSlots.map((slot: any) => (
            <div 
              key={slot.id} 
              className="p-3 font-medium text-gray-700 text-center border-b border-r"
            >
              {slot.startTime} - {slot.endTime}
              <div className="text-xs text-gray-500">{slot.label}</div>
            </div>
          ))}
        </div>

        {/* Teacher rows */}
        {displayTeachers.map((teacher: any) => (
          <div 
            key={teacher.id} 
            className="grid grid-cols-[200px_repeat(auto-fill,minmax(150px,1fr))] bg-white"
          >
            {/* Teacher name */}
            <div className="p-3 border-b border-r flex items-center">
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 mr-3">
                <span className="font-medium">{teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {teacher.firstName} {teacher.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {teacher.subjects?.join(", ") || "No subjects"}
                </p>
              </div>
            </div>

            {/* Time slots */}
            {timeSlots.map((slot: any) => {
              const entry = findEntryForTeacherAndTimeSlot(teacher.id, slot.id);
              
              return (
                <div key={slot.id} className="p-2 border-b border-r">
                  {entry ? (
                    <div className={`p-2 rounded-lg ${
                      entry.isFreePeriod 
                        ? "bg-gray-50 border border-gray-200" 
                        : "bg-blue-50 border border-blue-200"
                    }`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-medium">
                          {entry.isFreePeriod 
                            ? slot.label === "Lunch" ? "Lunch Break" : "Free Period" 
                            : getSubjectName(entry.subjectId)}
                        </span>
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => openEditEntryDialog(entry)}
                            className="text-gray-500 hover:text-blue-500"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteEntry(entry)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {!entry.isFreePeriod && (
                        <>
                          <p className="text-xs text-blue-600">
                            {getClassName(entry.classId)}
                          </p>
                          {entry.roomNumber && (
                            <p className="text-xs text-blue-600">
                              Room {entry.roomNumber}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full h-full border-dashed text-gray-500"
                      onClick={() => {
                        form.setValue("teacherId", String(teacher.id));
                        form.setValue("timeSlotId", String(slot.id));
                        openNewEntryDialog(String(teacher.id));
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timetable Management</h1>
          <p className="text-muted-foreground">Create and edit your school's timetable.</p>
        </div>
        <Button onClick={() => openNewEntryDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Timetable Entry
        </Button>
      </div>

      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading timetable data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Select day and teacher to view specific timetable sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Day</FormLabel>
                  <Select value={selectedDay} onValueChange={setSelectedDay}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Days of the week</SelectLabel>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FormLabel>Teacher</FormLabel>
                  <Select value={selectedTeacher || ""} onValueChange={setSelectedTeacher}>
                    <SelectTrigger>
                      <SelectValue placeholder="All teachers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All teachers</SelectItem>
                      {teachers?.map((teacher: any) => (
                        <SelectItem key={teacher.id} value={String(teacher.id)}>
                          {teacher.firstName} {teacher.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timetable Grid */}
          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">
                <CalendarDays className="h-4 w-4 mr-2" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="list">
                <Edit2 className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              {renderTimetableGrid()}
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Teacher</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Day</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Time</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Class</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Subject</th>
                          <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Room</th>
                          <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filteredEntries.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="h-16 text-center text-muted-foreground">
                              No timetable entries found for the selected filters.
                            </td>
                          </tr>
                        ) : (
                          filteredEntries.map((entry: any) => (
                            <tr 
                              key={entry.id} 
                              className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                            >
                              <td className="p-4 align-middle">{getTeacherName(entry.teacherId)}</td>
                              <td className="p-4 align-middle">{getDayName(String(entry.dayOfWeek))}</td>
                              <td className="p-4 align-middle">{getTimeSlotLabel(entry.timeSlotId)}</td>
                              <td className="p-4 align-middle">
                                {entry.isFreePeriod ? "Free Period" : getClassName(entry.classId)}
                              </td>
                              <td className="p-4 align-middle">
                                {entry.isFreePeriod ? "-" : getSubjectName(entry.subjectId)}
                              </td>
                              <td className="p-4 align-middle">
                                {entry.isFreePeriod ? "-" : (entry.roomNumber || "-")}
                              </td>
                              <td className="p-4 align-middle text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => openEditEntryDialog(entry)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={() => handleDeleteEntry(entry)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Create/Edit Entry Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? "Edit Timetable Entry" : "Add New Timetable Entry"}
            </DialogTitle>
            <DialogDescription>
              {editingEntry 
                ? "Update the details for this timetable entry." 
                : "Fill in the details to create a new timetable entry."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="teacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teacher</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={editingEntry !== null}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers?.map((teacher: any) => (
                          <SelectItem key={teacher.id} value={String(teacher.id)}>
                            {teacher.firstName} {teacher.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dayOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day of Week</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                        <SelectItem value="7">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeSlotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={editingEntry !== null}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots?.map((slot: any) => (
                          <SelectItem key={slot.id} value={String(slot.id)}>
                            {slot.startTime} - {slot.endTime} ({slot.label})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFreePeriod"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Free Period</FormLabel>
                      <FormDescription>
                        Mark as a free period or lunch break
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!form.watch("isFreePeriod") && (
                <>
                  <FormField
                    control={form.control}
                    name="classId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Class</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={form.watch("isFreePeriod")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classes?.map((cls: any) => (
                              <SelectItem key={cls.id} value={String(cls.id)}>
                                {cls.name} (Grade {cls.grade}-{cls.section})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={form.watch("isFreePeriod")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects?.map((subject: any) => (
                              <SelectItem key={subject.id} value={String(subject.id)}>
                                {subject.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="E.g. 101"
                            {...field}
                            disabled={form.watch("isFreePeriod")}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {conflicts.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Conflicts Detected</AlertTitle>
                  <AlertDescription>
                    <ul className="list-disc pl-5 text-sm">
                      {conflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={conflicts.length > 0 || createEntry.isPending || updateEntry.isPending}
                >
                  {(createEntry.isPending || updateEntry.isPending) ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingEntry ? "Update" : "Save"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
