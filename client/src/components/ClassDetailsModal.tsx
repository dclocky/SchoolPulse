import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, BookOpen, Check, Clock, MessageSquare, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ClassDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: any;
  classes: any[];
  subjects: any[];
  teachers: any[];
  timeSlots: any[];
}

export function ClassDetailsModal({
  isOpen,
  onClose,
  entry,
  classes,
  subjects,
  teachers,
  timeSlots,
}: ClassDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");
  
  // Fetch class session data
  const { data: classSessions, isLoading: loadingClassSessions } = useQuery({
    queryKey: ['/api/classsessions/timetable', entry?.id],
    queryFn: async () => {
      if (!entry?.id) return [];
      const res = await fetch(`/api/classsessions/timetable/${entry.id}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch class sessions');
      }
      return res.json();
    },
    enabled: !!entry?.id && isOpen,
  });

  // Fetch attendance data if we have a class session
  const classSessionId = classSessions && classSessions.length > 0 ? classSessions[0].id : null;
  
  const { data: attendanceData, isLoading: loadingAttendance } = useQuery({
    queryKey: ['/api/attendance/classsession', classSessionId],
    queryFn: async () => {
      if (!classSessionId) return [];
      const res = await fetch(`/api/attendance/classsession/${classSessionId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch attendance');
      }
      return res.json();
    },
    enabled: !!classSessionId && isOpen,
  });

  // Fetch homework data if we have a class session
  const { data: homeworkData, isLoading: loadingHomework } = useQuery({
    queryKey: ['/api/homework/classsession', classSessionId],
    queryFn: async () => {
      if (!classSessionId) return [];
      const res = await fetch(`/api/homework/classsession/${classSessionId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch homework');
      }
      return res.json();
    },
    enabled: !!classSessionId && isOpen,
  });

  // Reset the active tab when the modal is opened
  useEffect(() => {
    if (isOpen) {
      setActiveTab("details");
    }
  }, [isOpen]);

  // Helper functions to get related data
  const getTeacher = () => {
    if (!entry?.teacherId) return null;
    return teachers.find(t => t.id === entry.teacherId);
  };

  const getClass = () => {
    if (!entry?.classId) return null;
    return classes.find(c => c.id === entry.classId);
  };

  const getSubject = () => {
    if (!entry?.subjectId) return null;
    return subjects.find(s => s.id === entry.subjectId);
  };

  const getTimeSlot = () => {
    if (!entry?.timeSlotId) return null;
    return timeSlots.find(t => t.id === entry.timeSlotId);
  };

  // Calculate attendance stats
  const getAttendanceStats = () => {
    if (!attendanceData || attendanceData.length === 0) {
      return { present: 0, absent: 0, late: 0, total: 0 };
    }
    
    const present = attendanceData.filter((record: any) => record.status === "present").length;
    const absent = attendanceData.filter((record: any) => record.status === "absent").length;
    const late = attendanceData.filter((record: any) => record.status === "late").length;
    
    return {
      present,
      absent,
      late,
      total: attendanceData.length
    };
  };

  const attendanceStats = getAttendanceStats();
  const classInfo = getClass();
  const subjectInfo = getSubject();
  const teacherInfo = getTeacher();
  const timeSlotInfo = getTimeSlot();
  const classSession = classSessions && classSessions.length > 0 ? classSessions[0] : null;

  const isLoading = loadingClassSessions || loadingAttendance || loadingHomework;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {entry && !entry.isFreePeriod
              ? `${subjectInfo?.name || 'Class'} - ${classInfo?.name || ''}`
              : 'Free Period'}
          </DialogTitle>
          <DialogDescription>
            {timeSlotInfo ? `${timeSlotInfo.startTime} - ${timeSlotInfo.endTime}` : ''} 
            {entry?.roomNumber && !entry.isFreePeriod ? ` • Room ${entry.roomNumber}` : ''}
          </DialogDescription>
        </DialogHeader>

        {entry?.isFreePeriod ? (
          <div className="py-8 text-center">
            <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium">
              {timeSlotInfo?.label === 'Lunch' ? 'Lunch Break' : 'Free Period'}
            </h3>
            <p className="text-gray-500 mt-2">No class scheduled during this time slot.</p>
          </div>
        ) : (
          <>
            {teacherInfo && (
              <div className="flex items-center mb-6">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarFallback className="bg-primary-100 text-primary-700">
                    {teacherInfo.firstName.charAt(0)}{teacherInfo.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{teacherInfo.firstName} {teacherInfo.lastName}</div>
                  <div className="text-sm text-gray-500">
                    {teacherInfo.subjects && teacherInfo.subjects.length > 0 
                      ? teacherInfo.subjects.join(', ') 
                      : 'No subjects assigned'}
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !classSession ? (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Class Session Found</AlertTitle>
                <AlertDescription>
                  There is no recorded data for this class session yet.
                </AlertDescription>
              </Alert>
            ) : (
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="details">Class Details</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="homework">Homework</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-4">
                  <div className="border-t border-b border-gray-200 py-4">
                    <h4 className="font-medium text-gray-700 mb-3">Class Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {classSession?.notes ? (
                        <p className="text-gray-800 whitespace-pre-line">{classSession.notes}</p>
                      ) : (
                        <p className="text-gray-500 italic">No notes have been added for this class.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">Lesson Plan</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {classSession?.lessonPlan ? (
                        <p className="text-gray-800 whitespace-pre-line">{classSession.lessonPlan}</p>
                      ) : (
                        <p className="text-gray-500 italic">No lesson plan has been added for this class.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="attendance" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-green-600">{attendanceStats.present}</p>
                      <p className="text-sm text-green-700">Present</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-red-600">{attendanceStats.absent}</p>
                      <p className="text-sm text-red-700">Absent</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <p className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</p>
                      <p className="text-sm text-yellow-700">Late</p>
                    </div>
                  </div>
                  
                  {attendanceData && attendanceData.length > 0 ? (
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Time
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {attendanceData.map((record: any) => (
                            <tr key={record.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="text-sm font-medium text-gray-900">
                                    {/* This would need actual student data */}
                                    Student ID: {record.studentId}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {record.status === "present" && (
                                  <Badge className="bg-green-100 text-green-800 border-green-200">
                                    <Check className="mr-1 h-3 w-3" />
                                    Present
                                  </Badge>
                                )}
                                {record.status === "absent" && (
                                  <Badge variant="destructive">
                                    <X className="mr-1 h-3 w-3" />
                                    Absent
                                  </Badge>
                                )}
                                {record.status === "late" && (
                                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    <Clock className="mr-1 h-3 w-3" />
                                    Late
                                  </Badge>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {new Date(record.timestamp).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p>No attendance records found for this class session.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="homework" className="space-y-4">
                  {homeworkData && homeworkData.length > 0 ? (
                    <div className="space-y-4">
                      {homeworkData.map((item: any) => (
                        <div key={item.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-lg">{item.title}</h4>
                            <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p>No homework has been assigned for this class session.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            Contact Teacher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
