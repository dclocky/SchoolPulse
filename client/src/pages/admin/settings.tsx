import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Save, Loader2 } from "lucide-react";

// Settings schema
const settingsSchema = z.object({
  schoolName: z.string().min(1, { message: "School name is required" }),
  semesterStartDate: z.date({
    required_error: "Semester start date is required",
  }),
  semesterEndDate: z.date({
    required_error: "Semester end date is required",
  }),
}).refine((data) => data.semesterEndDate > data.semesterStartDate, {
  message: "Semester end date must be after start date",
  path: ["semesterEndDate"],
});

// Time slot schema
const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Valid time format required (HH:MM)",
  }),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Valid time format required (HH:MM)",
  }),
  label: z.string().min(1, { message: "Label is required" }),
}).refine((data) => data.startTime < data.endTime, {
  message: "End time must be after start time",
  path: ["endTime"],
});

export default function Settings() {
  const { toast } = useToast();

  // Fetch settings
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['/api/settings'],
  });

  // Fetch time slots
  const { data: timeSlots, isLoading: loadingTimeSlots } = useQuery({
    queryKey: ['/api/timeslots'],
  });

  // Settings form
  const settingsForm = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      schoolName: "",
      semesterStartDate: new Date(),
      semesterEndDate: new Date(),
    },
  });

  // Time slot form
  const timeSlotForm = useForm<z.infer<typeof timeSlotSchema>>({
    resolver: zodResolver(timeSlotSchema),
    defaultValues: {
      startTime: "",
      endTime: "",
      label: "",
    },
  });

  // Update settings when data is loaded
  useEffect(() => {
    if (settings) {
      settingsForm.reset({
        schoolName: settings.schoolName,
        semesterStartDate: new Date(settings.semesterStartDate),
        semesterEndDate: new Date(settings.semesterEndDate),
      });
    }
  }, [settings, settingsForm]);

  // Update settings mutation
  const updateSettings = useMutation({
    mutationFn: async (data: z.infer<typeof settingsSchema>) => {
      return apiRequest('PUT', '/api/settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Create time slot mutation
  const createTimeSlot = useMutation({
    mutationFn: async (data: z.infer<typeof timeSlotSchema>) => {
      return apiRequest('POST', '/api/timeslots', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/timeslots'] });
      toast({
        title: "Success",
        description: "Time slot created successfully",
      });
      timeSlotForm.reset({
        startTime: "",
        endTime: "",
        label: "",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create time slot",
        variant: "destructive",
      });
    },
  });

  // Submit handlers
  const onSubmitSettings = (values: z.infer<typeof settingsSchema>) => {
    updateSettings.mutate(values);
  };

  const onSubmitTimeSlot = (values: z.infer<typeof timeSlotSchema>) => {
    createTimeSlot.mutate(values);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your school's system settings.</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="periods">Time Periods</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic settings for your school.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingSettings ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Form {...settingsForm}>
                  <form onSubmit={settingsForm.handleSubmit(onSubmitSettings)} className="space-y-6">
                    <FormField
                      control={settingsForm.control}
                      name="schoolName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>School Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter school name" {...field} />
                          </FormControl>
                          <FormDescription>
                            This will appear throughout the system.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={settingsForm.control}
                        name="semesterStartDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Semester Start Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value}
                                setDate={(date) => field.onChange(date)}
                                placeholder="Select start date"
                              />
                            </FormControl>
                            <FormDescription>
                              First day of the current semester.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={settingsForm.control}
                        name="semesterEndDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Semester End Date</FormLabel>
                            <FormControl>
                              <DatePicker
                                date={field.value}
                                setDate={(date) => field.onChange(date)}
                                placeholder="Select end date"
                              />
                            </FormControl>
                            <FormDescription>
                              Last day of the current semester.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" disabled={updateSettings.isPending}>
                      {updateSettings.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Settings
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="periods">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Periods</CardTitle>
                <CardDescription>
                  Configure time periods for school schedule.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTimeSlots ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Current Time Periods</h3>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Label
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Start Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              End Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {timeSlots?.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                                No time periods defined
                              </td>
                            </tr>
                          )}
                          {timeSlots?.map((slot: any) => (
                            <tr key={slot.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{slot.label}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{slot.startTime}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{slot.endTime}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add New Time Period</CardTitle>
                <CardDescription>
                  Define a new time period for the timetable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...timeSlotForm}>
                  <form onSubmit={timeSlotForm.handleSubmit(onSubmitTimeSlot)} className="space-y-4">
                    <FormField
                      control={timeSlotForm.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Label</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Period 1, Lunch" {...field} />
                          </FormControl>
                          <FormDescription>
                            A descriptive name for this time period.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={timeSlotForm.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input placeholder="HH:MM" {...field} />
                            </FormControl>
                            <FormDescription>
                              Format: 24-hour (e.g. 09:00)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={timeSlotForm.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input placeholder="HH:MM" {...field} />
                            </FormControl>
                            <FormDescription>
                              Format: 24-hour (e.g. 10:00)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="mt-4"
                      disabled={createTimeSlot.isPending}
                    >
                      {createTimeSlot.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        "Add Time Period"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage administrator accounts for the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-12">
                <p>User management functionality will be available in a future update.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
