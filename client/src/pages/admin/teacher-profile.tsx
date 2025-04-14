import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, BookOpen, Clock, UserPlus } from "lucide-react";
import { AssignSubstituteModal } from "@/components/AssignSubstituteModal";
import { useTimetable } from "@/hooks/useTimetable";

export default function TeacherProfile() {
  const { id } = useParams();
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);

  const { data: teacher, isLoading: loadingTeacher } = useQuery({
    queryKey: ['/api/teachers', id],
    enabled: !!id,
  });

  const {
    timetableEntries,
    timeSlots,
    classes,
    subjects,
    isLoading: loadingTimetable
  } = useTimetable({
    teacherId: parseInt(id),
    includeTimeSlots: true,
    includeClasses: true,
    includeSubjects: true
  });

  if (loadingTeacher || loadingTimetable) {
    return <div>Loading...</div>;
  }

  const getDayName = (dayNum: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayNum % 7];
  };

  const getSubjectName = (subjectId: number) => {
    return subjects?.find(s => s.id === subjectId)?.name || "Unknown Subject";
  };

  const getClassName = (classId: number) => {
    return classes?.find(c => c.id === classId)?.name || "Unknown Class";
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-xl">
              {teacher?.firstName?.[0]}{teacher?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">
              {teacher?.firstName} {teacher?.lastName}
            </h1>
            <p className="text-gray-500">
              {teacher?.subjects?.join(", ") || "No subjects assigned"}
            </p>
          </div>
        </div>
        <Button onClick={() => setIsSubstituteModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Assign Substitute
        </Button>
      </div>

      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule">
            <CalendarDays className="mr-2 h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger value="classes">
            <BookOpen className="mr-2 h-4 w-4" />
            Classes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((day) => (
                  <div key={day} className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">{getDayName(day)}</h3>
                    <div className="space-y-2">
                      {timetableEntries
                        ?.filter(entry => entry.dayOfWeek === day)
                        .map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <div>
                              <p className="font-medium">
                                {entry.isFreePeriod ? "Free Period" : getSubjectName(entry.subjectId)}
                              </p>
                              {!entry.isFreePeriod && (
                                <p className="text-sm text-gray-500">
                                  {getClassName(entry.classId)} • Room {entry.roomNumber}
                                </p>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {timeSlots?.find(ts => ts.id === entry.timeSlotId)?.startTime} - 
                              {timeSlots?.find(ts => ts.id === entry.timeSlotId)?.endTime}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="classes">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {timetableEntries
                  ?.filter(entry => !entry.isFreePeriod)
                  .map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{getClassName(entry.classId)}</h4>
                          <p className="text-sm text-gray-500">{getSubjectName(entry.subjectId)}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          Room {entry.roomNumber}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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

      <AssignSubstituteModal
        isOpen={isSubstituteModalOpen}
        onClose={() => setIsSubstituteModalOpen(false)}
        teacher={teacher}
        teacherId={parseInt(id)}
      />
    </div>
  );
}