import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AssignSubstituteModal } from "@/components/AssignSubstituteModal";
import { BookOpen, Calendar, ChevronLeft, Clock, Mail, MapPin, PlusCircle } from "lucide-react";

export default function TeacherProfile({ id }: { id: string }) {
  const { toast } = useToast();
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  
  // Fetch teacher details
  const { data: teacher, isLoading: loadingTeacher } = useQuery({
    queryKey: ['/api/teachers', id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch teacher');
      }
      return res.json();
    }
  });

  // Fetch timetable entries for this teacher
  const { data: timetableEntries, isLoading: loadingTimetable } = useQuery({
    queryKey: ['/api/timetable/teacher', id],
    queryFn: async () => {
      const res = await fetch(`/api/timetable/teacher/${id}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch timetable');
      }
      return res.json();
    }
  });

  // Fetch classes
  const { data: classes, isLoading: loadingClasses } = useQuery({
    queryKey: ['/api/classes'],
  });

  // Fetch subjects
  const { data: subjects, isLoading: loadingSubjects } = useQuery({
    queryKey: ['/api/subjects'],
  });
  
  // Fetch timeslots
  const { data: timeSlots, isLoading: loadingTimeslots } = useQuery({
    queryKey: ['/api/timeslots'],
  });

  // Fetch substitutions for this teacher
  const { data: substitutions, isLoading: loadingSubstitutions } = useQuery({
    queryKey: ['/api/substitutions/teacher', id],
    queryFn: async () => {
      const res = await fetch(`/api/substitutions/teacher/${id}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch substitutions');
      }
      return res.json();
    }
  });
  
  const isLoading = loadingTeacher || loadingTimetable || loadingClasses || loadingSubjects || loadingTimeslots || loadingSubstitutions;

  // Group timetable entries by day
  const entriesByDay = timetableEntries?.reduce((acc: any, entry: any) => {
    const day = entry.dayOfWeek;
    if (!acc[day]) {
      acc[day] = [];
    }
    acc[day].push(entry);
    return acc;
  }, {});

  // Helper function to get day name
  const getDayName = (dayNum: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum % 7];
  };

  // Helper function to get class name
  const getClassName = (classId: number | null) => {
    if (!classId || !classes) return "Free Period";
    const cls = classes.find((c: any) => c.id === classId);
    return cls ? cls.name : "Unknown Class";
  };

  // Helper function to get subject name
  const getSubjectName = (subjectId: number | null) => {
    if (!subjectId || !subjects) return "";
    const subject = subjects.find((s: any) => s.id === subjectId);
    return subject ? subject.name : "Unknown Subject";
  };
  
  // Helper function to get time slot information
  const getTimeSlotInfo = (timeSlotId: number) => {
    if (!timeSlots) return { label: "", startTime: "", endTime: "" };
    const slot = timeSlots.find((s: any) => s.id === timeSlotId);
    return slot || { label: "Unknown", startTime: "", endTime: "" };
  };

  // Count classes and free periods
  const classCounts = Object.values(entriesByDay || {}).reduce((acc: any, dayEntries: any) => {
    dayEntries.forEach((entry: any) => {
      if (entry.isFreePeriod) {
        acc.free++;
      } else {
        acc.classes++;
      }
    });
    return acc;
  }, { classes: 0, free: 0 });

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Link href="/admin/teachers">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Teachers
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading teacher data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Teacher Info Card */}
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>Teacher Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                      {teacher?.firstName?.charAt(0)}
                      {teacher?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{teacher?.firstName} {teacher?.lastName}</h2>
                  <p className="text-gray-500 mb-4">{teacher?.email}</p>
                  
                  <div className="w-full flex flex-wrap gap-1 justify-center mb-4">
                    {teacher?.subjects?.map((subject: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => setIsSubstituteModalOpen(true)}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Assign Substitute
                  </Button>

                  <div className="w-full mt-6 space-y-3">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-gray-500 flex items-center">
                        <BookOpen className="h-4 w-4 mr-2" /> Classes
                      </span>
                      <span className="font-medium">{classCounts.classes}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-gray-500 flex items-center">
                        <Clock className="h-4 w-4 mr-2" /> Free Periods
                      </span>
                      <span className="font-medium">{classCounts.free}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                      <span className="text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" /> Days Active
                      </span>
                      <span className="font-medium">{Object.keys(entriesByDay || {}).length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Card */}
            <Card className="md:col-span-3">
              <CardHeader>
                <CardTitle>Weekly Schedule</CardTitle>
                <CardDescription>
                  Overview of {teacher?.firstName}'s teaching schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="1" className="space-y-4">
                  <TabsList className="grid grid-cols-5">
                    <TabsTrigger value="1">Monday</TabsTrigger>
                    <TabsTrigger value="2">Tuesday</TabsTrigger>
                    <TabsTrigger value="3">Wednesday</TabsTrigger>
                    <TabsTrigger value="4">Thursday</TabsTrigger>
                    <TabsTrigger value="5">Friday</TabsTrigger>
                  </TabsList>

                  {[1, 2, 3, 4, 5].map((day) => (
                    <TabsContent key={day} value={String(day)}>
                      {(!entriesByDay || !entriesByDay[day] || entriesByDay[day].length === 0) ? (
                        <div className="text-center py-8 text-gray-500">
                          No schedule entries for {getDayName(day)}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {entriesByDay[day]
                            .sort((a: any, b: any) => a.timeSlotId - b.timeSlotId)
                            .map((entry: any) => {
                              const timeSlot = getTimeSlotInfo(entry.timeSlotId);
                              return (
                                <div key={entry.id} className={`p-4 rounded-lg ${
                                  entry.isFreePeriod 
                                    ? "bg-gray-50 border border-gray-200" 
                                    : "bg-blue-50 border border-blue-200"
                                }`}>
                                  <div className="flex justify-between">
                                    <div>
                                      <h3 className="font-medium">
                                        {entry.isFreePeriod 
                                          ? timeSlot.label === "Lunch" ? "Lunch Break" : "Free Period" 
                                          : getSubjectName(entry.subjectId)}
                                      </h3>
                                      {!entry.isFreePeriod && (
                                        <p className="text-sm text-blue-700">{getClassName(entry.classId)}</p>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-gray-500">
                                        {timeSlot.startTime} - {timeSlot.endTime}
                                      </p>
                                      {entry.roomNumber && !entry.isFreePeriod && (
                                        <p className="text-sm flex items-center justify-end text-gray-500">
                                          <MapPin className="h-3 w-3 mr-1" />
                                          Room {entry.roomNumber}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Substitutions Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Substitution History</CardTitle>
              <CardDescription>
                Record of substitute assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {substitutions?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No substitution records found for this teacher.
                </div>
              ) : (
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Role</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Substituting For / By</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Start Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">End Date</th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Reason</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {substitutions?.map((sub: any) => (
                        <tr key={sub.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                          <td className="p-4 align-middle">
                            {sub.originalTeacherId === parseInt(id) ? (
                              <Badge variant="destructive">Absent</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Substitute</Badge>
                            )}
                          </td>
                          <td className="p-4 align-middle">
                            {/* This would need a lookup to get the teacher name */}
                            {sub.originalTeacherId === parseInt(id) 
                              ? `Substituted by ID: ${sub.substituteTeacherId}` 
                              : `Substituting for ID: ${sub.originalTeacherId}`}
                          </td>
                          <td className="p-4 align-middle">
                            {new Date(sub.startDate).toLocaleDateString()}
                          </td>
                          <td className="p-4 align-middle">
                            {new Date(sub.endDate).toLocaleDateString()}
                          </td>
                          <td className="p-4 align-middle">
                            {sub.reason || "No reason provided"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Substitute Assignment Modal */}
          <AssignSubstituteModal
            isOpen={isSubstituteModalOpen}
            onClose={() => setIsSubstituteModalOpen(false)}
            teacher={teacher}
            teacherId={parseInt(id)}
          />
        </>
      )}
    </div>
  );
}
