import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar, Edit, PersonStanding, Upload } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Timetable } from "@/components/Timetable";
import { ClassDetailsModal } from "@/components/ClassDetailsModal";
import { TeacherProfileModal } from "@/components/TeacherProfileModal";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isClassDetailsModalOpen, setIsClassDetailsModalOpen] = useState(false);
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  // Fetch timetable entries
  const { data: timetableData, isLoading: loadingTimetable } = useQuery({
    queryKey: ['/api/timetable'],
  });

  // Fetch teachers
  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ['/api/teachers'],
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

  const isLoading = loadingTimetable || loadingTeachers || loadingClasses || loadingSubjects || loadingTimeslots;

  const handleEntryClick = (entry: any) => {
    setSelectedEntry(entry);
    setIsClassDetailsModalOpen(true);
  };

  const handleTeacherClick = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherProfileModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading timetable data...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.firstName}</p>
            </div>
            <DatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>

          {timetableData && teachersData && classesData && subjectsData && timeslotsData && (
            <Timetable
              entries={timetableData}
              teachers={teachersData}
              classes={classesData}
              subjects={subjectsData}
              timeSlots={timeslotsData}
              date={selectedDate}
              isAdminView={true}
              onEntryClick={handleEntryClick}
              onTeacherClick={handleTeacherClick}
            />
          )}
          
          {/* Quick Actions Section */}
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Manage Timetable</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <Edit className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="text-sm text-gray-500 truncate">
                      Edit & update your school timetable
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-5 py-3 rounded-b-lg">
                <Link href="/admin/timetable">
                  <a className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Open Editor
                  </a>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Manage Teachers</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <PersonStanding className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="text-sm text-gray-500 truncate">
                      {teachersData?.length || 0} Active Teachers
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-5 py-3 rounded-b-lg">
                <Link href="/admin/teachers">
                  <a className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    View All Teachers
                  </a>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Data Import</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <Upload className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <div className="text-sm text-gray-500 truncate">
                      Upload CSV Files
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 px-5 py-3 rounded-b-lg">
                <Link href="/admin/data-import">
                  <a className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    Start Import
                  </a>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </>
      )}

      {/* Modals */}
      {selectedEntry && (
        <ClassDetailsModal
          isOpen={isClassDetailsModalOpen}
          onClose={() => setIsClassDetailsModalOpen(false)}
          entry={selectedEntry}
          classes={classesData || []}
          subjects={subjectsData || []}
          teachers={teachersData || []}
          timeSlots={timeslotsData || []}
        />
      )}

      {selectedTeacher && (
        <TeacherProfileModal
          isOpen={isTeacherProfileModalOpen}
          onClose={() => setIsTeacherProfileModalOpen(false)}
          teacher={selectedTeacher}
          timetableEntries={timetableData?.filter((entry: any) => entry.teacherId === selectedTeacher.id) || []}
          classes={classesData || []}
          subjects={subjectsData || []}
          timeSlots={timeslotsData || []}
        />
      )}
    </div>
  );
}
