import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Link } from "wouter";
import { Calendar, Clock, ClipboardList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Timetable } from "@/components/Timetable";
import { ClassList } from "@/components/ClassList";
import { SemesterCountdown } from "@/components/SemesterCountdown";
import { useAuth } from "@/context/AuthContext";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Fetch timetable entries for this teacher
  const { data: timetableData, isLoading: loadingTimetable } = useQuery({
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
  const { data: classesData, isLoading: loadingClasses } = useQuery({
    queryKey: ['/api/classes'],
  });

  // Fetch subjects
  const { data: subjectsData, isLoading: loadingSubjects } = useQuery({
    queryKey: ['/api/subjects'],
  });

  // Fetch timeslots
  const { data: timeslotsData, isLoading: loadingTimeslots } = useQuery({
    queryKey: ['/api/timeslots'],
  });

  // Fetch settings for semester dates
  const { data: settingsData, isLoading: loadingSettings } = useQuery({
    queryKey: ['/api/settings'],
  });

  const isLoading = loadingTimetable || loadingClasses || loadingSubjects || loadingTimeslots || loadingSettings;

  // Get day of week from date (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay(); // Convert Sunday from 0 to 7 for consistency

  // Filter timetable entries for the selected day
  const todaysClasses = timetableData?.filter((entry: any) => 
    entry.dayOfWeek === dayOfWeek && !entry.isFreePeriod
  ) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading your schedule...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}</p>
            </div>
            <div className="flex items-center space-x-4">
              <DatePicker date={selectedDate} setDate={setSelectedDate} />
              <SemesterCountdown
                startDate={new Date(settingsData?.semesterStartDate)}
                endDate={new Date(settingsData?.semesterEndDate)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                    My Schedule - {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {timetableData && classesData && subjectsData && timeslotsData && (
                    <Timetable
                      entries={timetableData}
                      teachers={[user]}
                      classes={classesData}
                      subjects={subjectsData}
                      timeSlots={timeslotsData}
                      date={selectedDate}
                      isAdminView={false}
                      teacherId={user?.id}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2 text-primary-600" />
                    Today's Classes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClassList 
                    classes={todaysClasses}
                    classesData={classesData}
                    subjectsData={subjectsData}
                    timeslotsData={timeslotsData}
                  />

                  {todaysClasses.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No classes scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/teacher/profile">
                      <a>
                        <User className="mr-2 h-4 w-4" />
                        View My Profile
                      </a>
                    </Link>
                  </Button>
                  
                  {todaysClasses.length > 0 && (
                    <Button variant="default" className="w-full justify-start" asChild>
                      <Link href={`/teacher/class/${todaysClasses[0].id}`}>
                        <a>
                          <BookOpen className="mr-2 h-4 w-4" />
                          Go to Next Class
                        </a>
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { User, BookOpen } from "lucide-react";
