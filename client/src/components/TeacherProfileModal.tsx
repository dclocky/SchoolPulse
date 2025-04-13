import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Calendar, User, MessageSquare, Clock, BookOpen, MapPin } from "lucide-react";
import { AssignSubstituteModal } from "@/components/AssignSubstituteModal";

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: any;
  timetableEntries: any[];
  classes: any[];
  subjects: any[];
  timeSlots: any[];
}

export function TeacherProfileModal({
  isOpen,
  onClose,
  teacher,
  timetableEntries,
  classes,
  subjects,
  timeSlots,
}: TeacherProfileModalProps) {
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);

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

  // Count classes by day for schedule overview
  const classesByDay = Object.entries(entriesByDay || {}).reduce((acc: any, [day, entries]: [string, any]) => {
    const dayNum = parseInt(day);
    const dayName = getDayName(dayNum).slice(0, 3); // Get abbreviated day name
    
    const classCount = entries.filter((entry: any) => !entry.isFreePeriod).length;
    const freeCount = entries.filter((entry: any) => entry.isFreePeriod).length;
    
    acc[dayName] = { classes: classCount, free: freeCount };
    return acc;
  }, {});

  // Get unique classes taught by this teacher
  const uniqueClassesTeacherInfo = timetableEntries
    ?.filter((entry: any) => !entry.isFreePeriod && entry.classId)
    .reduce((acc: any[], entry: any) => {
      if (!acc.find(item => item.classId === entry.classId)) {
        const classInfo = classes.find(c => c.id === entry.classId);
        if (classInfo) {
          acc.push({
            classId: entry.classId,
            className: classInfo.name,
            subjectId: entry.subjectId,
            subjectName: getSubjectName(entry.subjectId),
            days: [getDayName(entry.dayOfWeek).slice(0, 3)],
            timeSlot: getTimeSlotInfo(entry.timeSlotId),
            roomNumber: entry.roomNumber
          });
        }
      } else {
        // Add additional days for existing class
        const existingEntry = acc.find(item => item.classId === entry.classId);
        const dayName = getDayName(entry.dayOfWeek).slice(0, 3);
        if (!existingEntry.days.includes(dayName)) {
          existingEntry.days.push(dayName);
        }
      }
      return acc;
    }, []);

  const handleAssignSubstitute = () => {
    setIsSubstituteModalOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Teacher Profile</DialogTitle>
            <DialogDescription>
              Detailed information about {teacher?.firstName} {teacher?.lastName}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col md:flex-row md:items-start gap-6 py-2">
            <div className="flex flex-col items-center md:w-1/3">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="bg-primary-100 text-primary-700 text-lg">
                  {teacher?.firstName?.charAt(0)}{teacher?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <h3 className="text-xl font-semibold mt-3">{teacher?.firstName} {teacher?.lastName}</h3>
              <p className="text-gray-500 mb-3">{teacher?.email}</p>
              
              <div className="flex flex-wrap justify-center gap-1 mb-4">
                {teacher?.subjects?.map((subject: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-primary-50 text-primary-700 border-primary-200">
                    {subject}
                  </Badge>
                ))}
              </div>
              
              <Button 
                className="w-full mt-2" 
                onClick={handleAssignSubstitute}
              >
                <User className="mr-2 h-4 w-4" />
                Assign Substitute
              </Button>
              
              <div className="mt-6 space-y-3 w-full">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-3 h-4 w-4 text-gray-400" />
                  {teacher?.email}
                </div>
              </div>
            </div>
            
            <div className="md:w-2/3">
              <Tabs defaultValue="schedule">
                <TabsList className="mb-4">
                  <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  <TabsTrigger value="classes">Classes</TabsTrigger>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                </TabsList>
                
                <TabsContent value="schedule" className="space-y-4">
                  {Object.entries(entriesByDay || {}).map(([day, entries]: [string, any]) => {
                    const dayNum = parseInt(day);
                    return (
                      <div key={day} className="border rounded-md p-3">
                        <h4 className="font-medium mb-2">{getDayName(dayNum)}</h4>
                        <div className="space-y-2">
                          {entries
                            .sort((a: any, b: any) => a.timeSlotId - b.timeSlotId)
                            .map((entry: any) => {
                              const timeSlot = getTimeSlotInfo(entry.timeSlotId);
                              return (
                                <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                                  <div>
                                    <span className="font-medium">
                                      {entry.isFreePeriod 
                                        ? "Free Period" 
                                        : `${getSubjectName(entry.subjectId)} - ${getClassName(entry.classId)}`}
                                    </span>
                                    {entry.roomNumber && !entry.isFreePeriod && (
                                      <div className="text-xs text-gray-500 flex items-center mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        Room {entry.roomNumber}
                                      </div>
                                    )}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {timeSlot.startTime} - {timeSlot.endTime}
                                  </span>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    );
                  })}
                  
                  {Object.keys(entriesByDay || {}).length === 0 && (
                    <div className="text-center py-6">
                      <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500">No schedule entries found for this teacher.</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="classes">
                  <div className="grid gap-3">
                    {uniqueClassesTeacherInfo?.length > 0 ? (
                      uniqueClassesTeacherInfo.map((item, index) => (
                        <div key={index} className="border rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{item.className}</h4>
                              <p className="text-sm text-gray-500">{item.subjectName}</p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">
                                {item.days.join(", ")}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.timeSlot.startTime} - {item.timeSlot.endTime}
                              </div>
                            </div>
                          </div>
                          {item.roomNumber && (
                            <div className="mt-2 flex items-center text-sm text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              Room {item.roomNumber}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-500">No classes assigned to this teacher.</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="overview">
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="border rounded-md p-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Total Classes</h4>
                        <p className="text-2xl font-bold">
                          {timetableEntries?.filter(entry => !entry.isFreePeriod).length || 0}
                        </p>
                      </div>
                      <div className="border rounded-md p-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">Free Periods</h4>
                        <p className="text-2xl font-bold">
                          {timetableEntries?.filter(entry => entry.isFreePeriod).length || 0}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-3">Schedule Overview</h4>
                      <div className="border rounded-md">
                        <table className="min-w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                              <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Classes</th>
                              <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase">Free Periods</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                              <tr key={day}>
                                <td className="p-3 text-sm font-medium">{day}</td>
                                <td className="p-3 text-center text-sm">
                                  {classesByDay[day]?.classes || 0}
                                </td>
                                <td className="p-3 text-center text-sm">
                                  {classesByDay[day]?.free || 0}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Substitute Modal */}
      <AssignSubstituteModal
        isOpen={isSubstituteModalOpen}
        onClose={() => setIsSubstituteModalOpen(false)}
        teacher={teacher}
        teacherId={teacher?.id}
      />
    </>
  );
}
