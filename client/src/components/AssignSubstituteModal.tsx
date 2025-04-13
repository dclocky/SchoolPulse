import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PersonStanding, Save } from "lucide-react";

// Validation schema for substitute assignment
const substituteSchema = z.object({
  substituteTeacherId: z.string().min(1, { message: "Substitute teacher is required" }),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  reason: z.string().optional(),
  classes: z.array(z.string()).optional(),
}).refine(data => {
  return data.endDate >= data.startDate;
}, {
  message: "End date must be on or after start date",
  path: ["endDate"],
});

interface AssignSubstituteModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any;
  teacherId: number;
}

export function AssignSubstituteModal({
  isOpen,
  onClose,
  teacher,
  teacherId,
}: AssignSubstituteModalProps) {
  const { toast } = useToast();
  
  // Fetch available teachers for substitution
  const { data: teachers, isLoading: loadingTeachers } = useQuery({
    queryKey: ['/api/teachers'],
    enabled: isOpen,
  });

  // Fetch timetable entries for this teacher
  const { data: timetableEntries, isLoading: loadingTimetable } = useQuery({
    queryKey: ['/api/timetable/teacher', teacherId],
    queryFn: async () => {
      const res = await fetch(`/api/timetable/teacher/${teacherId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch timetable entries');
      }
      return res.json();
    },
    enabled: isOpen && !!teacherId,
  });

  // Create substitution mutation
  const createSubstitution = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/substitutions', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/substitutions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/substitutions/teacher', teacherId] });
      toast({
        title: "Success",
        description: "Substitute teacher assigned successfully",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to assign substitute teacher",
        variant: "destructive",
      });
    },
  });

  // Form setup
  const form = useForm<z.infer<typeof substituteSchema>>({
    resolver: zodResolver(substituteSchema),
    defaultValues: {
      substituteTeacherId: "",
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
      classes: timetableEntries?.filter((entry: any) => !entry.isFreePeriod)
        .map((entry: any) => entry.id.toString()) || [],
    },
  });

  // Helper function to get day name
  const getDayName = (dayNum: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum % 7];
  };

  // Get available substitute teachers (excluding the current teacher)
  const availableSubstitutes = teachers?.filter((t: any) => t.id !== teacherId && t.role === 'teacher') || [];

  // Filter out the current teacher's classes
  const teacherClasses = timetableEntries?.filter((entry: any) => !entry.isFreePeriod) || [];

  // Submit handler
  const onSubmit = (values: z.infer<typeof substituteSchema>) => {
    createSubstitution.mutate({
      originalTeacherId: teacherId,
      substituteTeacherId: parseInt(values.substituteTeacherId),
      startDate: values.startDate,
      endDate: values.endDate,
      reason: values.reason || "No reason provided",
    });
  };

  const isLoading = loadingTeachers || loadingTimetable;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Substitute Teacher</DialogTitle>
          <DialogDescription>
            Assign a substitute teacher for {teacher?.firstName} {teacher?.lastName}'s classes.
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="substituteTeacherId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Substitute Teacher</FormLabel>
                    <Select 
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a substitute teacher" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableSubstitutes.length === 0 ? (
                          <div className="p-2 text-center text-sm text-gray-500">
                            No available substitute teachers
                          </div>
                        ) : (
                          availableSubstitutes.map((teacher: any) => (
                            <SelectItem 
                              key={teacher.id} 
                              value={teacher.id.toString()}
                            >
                              {teacher.firstName} {teacher.lastName} 
                              {teacher.subjects?.length > 0 && ` (${teacher.subjects.join(', ')})`}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose a teacher to cover these classes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                          placeholder="Select start date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          setDate={(date) => field.onChange(date)}
                          placeholder="Select end date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Substitution (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter the reason for substitution"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classes"
                render={() => (
                  <FormItem>
                    <div className="mb-2">
                      <FormLabel>Classes to Reassign</FormLabel>
                      <FormDescription>
                        Select which classes should be covered by the substitute
                      </FormDescription>
                    </div>
                    {teacherClasses.length === 0 ? (
                      <div className="text-sm text-gray-500 p-3 bg-gray-50 rounded-md">
                        This teacher has no assigned classes
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {teacherClasses.map((entry: any) => (
                          <FormField
                            key={entry.id}
                            control={form.control}
                            name="classes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={entry.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 p-3 border rounded-md"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(entry.id.toString())}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value || [], entry.id.toString()])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== entry.id.toString()
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none flex-1">
                                    <div className="flex justify-between">
                                      <FormLabel className="font-medium text-base">
                                        Class ID: {entry.classId || "Unknown"}
                                      </FormLabel>
                                      <span className="text-sm text-gray-500">
                                        {getDayName(entry.dayOfWeek)}
                                      </span>
                                    </div>
                                    <FormDescription>
                                      Subject ID: {entry.subjectId || "Unknown"}
                                      {entry.roomNumber && ` • Room ${entry.roomNumber}`}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createSubstitution.isPending || availableSubstitutes.length === 0 || teacherClasses.length === 0}
                >
                  {createSubstitution.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <PersonStanding className="mr-2 h-4 w-4" />
                      Assign Substitute
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
