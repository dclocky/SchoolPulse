import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Calendar, Clock, Mail, MapPin, Phone } from "lucide-react";

export default function TeacherProfilePage() {
  const { user } = useAuth();
  
  // Fetch timetable entries for this teacher
  const { data: timetableEntries, isLoading: loadingTimetable } = useQuery({
    queryKey: ['/api/timetable/teacher', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/timetable/teacher/${user?.id}`, { credentials: 'include' });
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

  const isLoading = loadingTimetable || loadingClasses || loadingSubjects || loadingTimeslots;

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

  // Get unique class IDs taught by this teacher
  const uniqueClassIds = timetableEntries
    ?.filter((entry: any) => !entry.isFreePeriod && entry.classId)
    .map((entry: any) => entry.classId)
    .filter((value: number, index: number, self: number[]) => self.indexOf(value) === index) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Teacher Info Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle>My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h2>
              <p className="text-gray-500 mb-4">{user?.email}</p>
              
              <div className="w-full flex flex-wrap gap-1 justify-center mb-4">
                {user?.subjects?.map((subject: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                    {subject}
                  </Badge>
                ))}
              </div>

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
              
              <div className="w-full mt-6 pt-6 border-t">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Mail className="h-4 w-4 mr-2" />
                  {user?.email}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  Not provided
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
              Overview of your teaching schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>

      {/* Classes Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Classes</CardTitle>
          <CardDescription>
            Overview of classes you're teaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : uniqueClassIds.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No classes assigned yet
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {uniqueClassIds.map((classId: number) => {
                const classInfo = classes?.find((c: any) => c.id === classId);
                const classEntries = timetableEntries?.filter((entry: any) => 
                  entry.classId === classId && !entry.isFreePeriod
                );
                
                const subjectIds = [...new Set(classEntries?.map((e: any) => e.subjectId))];
                const subjectNames = subjectIds.map((id: number) => getSubjectName(id)).filter(Boolean);
                
                return (
                  <Card key={classId} className="border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{classInfo?.name || "Unknown Class"}</CardTitle>
                      <CardDescription>
                        {classInfo ? `Grade ${classInfo.grade}-${classInfo.section}` : ""}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium">Subjects:</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {subjectNames.map((name: string, idx: number) => (
                            <Badge key={idx} variant="outline">{name}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Room:</h4>
                        <p className="text-sm text-gray-500">
                          {classEntries?.[0]?.roomNumber || "Not assigned"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Schedule:</h4>
                        <div className="text-sm text-gray-500">
                          {classEntries?.map((entry: any) => {
                            const timeSlot = getTimeSlotInfo(entry.timeSlotId);
                            return (
                              <div key={entry.id} className="flex justify-between text-xs py-1">
                                <span>{getDayName(entry.dayOfWeek)}</span>
                                <span>{timeSlot.startTime} - {timeSlot.endTime}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
