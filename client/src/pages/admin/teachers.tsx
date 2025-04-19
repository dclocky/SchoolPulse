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

  const { data: teachersData = [], isLoading: loadingTeachers } = useQuery({ queryKey: ['/api/teachers'] });
  const { data: timetableData = [], isLoading: loadingTimetable } = useQuery({ queryKey: ['/api/timetable'] });
  const { data: classesData = [], isLoading: loadingClasses } = useQuery({ queryKey: ['/api/classes'] });
  const { data: subjectsData = [], isLoading: loadingSubjects } = useQuery({ queryKey: ['/api/subjects'] });
  const { data: timeslotsData = [], isLoading: loadingTimeslots } = useQuery({ queryKey: ['/api/timeslots'] });

  const isLoading = loadingTeachers || loadingTimetable || loadingClasses || loadingSubjects || loadingTimeslots;

  const openTeacherProfile = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherProfileModalOpen(true);
  };

  const handleViewTeacher = (id: number) => {
    const teacher = teachersData.find((t: any) => t.id === id);
    if (teacher) openTeacherProfile(teacher);
  };

  const getInitials = (name: string) =>
    name.split(" ").map((n) => n[0]).join("");

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => {
        const { firstName, lastName, email } = row.original;
        return (
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarFallback className="bg-primary-100 text-primary-700">
                {firstName.charAt(0)}{lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{firstName} {lastName}</div>
              <div className="text-sm text-muted-foreground">{email}</div>
            </div>
          </div>
        );
      },
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
                {subjects.map((subject: string, i: number) => (
                  <Badge key={i} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                    {subject}
                  </Badge>
                ))}
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">No subjects assigned</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleViewTeacher(row.original.id)}>
            View Profile
          </Button>
          <Link href={`/admin/teacher/${row.original.id}`}>
            <Button size="sm" variant="default">Manage</Button>
          </Link>
        </div>
      ),
    },
  ];

  const transformedTeachers = teachersData.map((t: any) => ({ ...t, name: `${t.firstName} ${t.lastName}` }));

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
              <span className="text-muted-foreground">Loading...</span>
            </div>
          ) : (
            <DataTable columns={columns} data={transformedTeachers} />
          )}
        </TabsContent>

        <TabsContent value="cards">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {transformedTeachers.map((teacher: any) => (
              <Card key={teacher.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewTeacher(teacher.id)}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary-100 text-primary-700">
                        {teacher.firstName.charAt(0)}{teacher.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{teacher.firstName} {teacher.lastName}</CardTitle>
                      <CardDescription>{teacher.email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {(teacher.subjects || []).map((subject: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                        {subject}
                      </Badge>
                    ))}
                    {(!teacher.subjects || teacher.subjects.length === 0) && (
                      <span className="text-muted-foreground text-sm">No subjects assigned</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TeacherProfileModal
        isOpen={isTeacherProfileModalOpen}
        onClose={() => setIsTeacherProfileModalOpen(false)}
        teacher={selectedTeacher}
      />
    </div>
  );
}