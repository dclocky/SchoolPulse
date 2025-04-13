import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { PlusCircle, Mail, Calendar, BookOpen } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { TeacherProfileModal } from "@/components/TeacherProfileModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Teachers() {
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);

  // Fetch teachers
  const { data: teachersData, isLoading: loadingTeachers } = useQuery({
    queryKey: ['/api/teachers'],
  });

  // Fetch timetable entries
  const { data: timetableData, isLoading: loadingTimetable } = useQuery({
    queryKey: ['/api/timetable'],
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

  const isLoading = loadingTeachers || loadingTimetable || loadingClasses || loadingSubjects || loadingTimeslots;

  const openTeacherProfile = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherProfileModalOpen(true);
  };

  const handleViewTeacher = (id: number) => {
    const teacher = teachersData.find((t: any) => t.id === id);
    if (teacher) {
      openTeacherProfile(teacher);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  // Table columns definition
  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => {
        const teacher = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {teacher.firstName.charAt(0)}
                {teacher.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{teacher.firstName} {teacher.lastName}</div>
              <div className="text-sm text-muted-foreground">{teacher.email}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "subjects",
      header: "Subjects",
      cell: ({ row }: any) => {
        const subjects = row.original.subjects || [];
        return (
          <div>
            {subjects.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {subjects.map((subject: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                    {subject}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">No subjects assigned</span>
            )}
          </div>
        );
      }
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => {
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleViewTeacher(row.original.id)}
            >
              View Profile
            </Button>
            <Link href={`/admin/teacher/${row.original.id}`}>
              <Button size="sm" variant="default">
                Manage
              </Button>
            </Link>
          </div>
        );
      }
    }
  ];

  const transformedTeachers = teachersData?.map((teacher: any) => ({
    ...teacher,
    name: `${teacher.firstName} ${teacher.lastName}`
  })) || [];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">Manage your school's teachers and their assignments.</p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <Tabs defaultValue="table" className="space-y-4">
        <TabsList>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="cards">Card View</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="space-y-4">
          {isLoading ? (
            <div className="w-full h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading teachers data...</p>
              </div>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={transformedTeachers}
              searchKey="name"
              searchPlaceholder="Search teachers..."
            />
          )}
        </TabsContent>

        <TabsContent value="cards">
          {isLoading ? (
            <div className="w-full h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading teachers data...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachersData?.map((teacher: any) => (
                <Card key={teacher.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => openTeacherProfile(teacher)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                          {getInitials(`${teacher.firstName} ${teacher.lastName}`)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{teacher.firstName} {teacher.lastName}</CardTitle>
                        <CardDescription>{teacher.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 my-2">
                      <div className="flex items-center text-sm">
                        <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {teacher.subjects && teacher.subjects.length 
                            ? teacher.subjects.join(", ")
                            : "No subjects assigned"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>
                          {timetableData?.filter((entry: any) => entry.teacherId === teacher.id && !entry.isFreePeriod).length || 0} Classes
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t flex justify-between">
                      <Button size="sm" variant="ghost">
                        <Mail className="mr-2 h-4 w-4" />
                        Contact
                      </Button>
                      <Link href={`/admin/teacher/${teacher.id}`}>
                        <Button size="sm">Manage</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Teacher Profile Modal */}
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
