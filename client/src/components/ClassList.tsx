import { useState, useEffect } from "react";
import { Link } from "wouter";
import { BookOpen, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ClassListProps {
  classes: any[];
  classesData: any[];
  subjectsData: any[];
  timeslotsData: any[];
}

export function ClassList({
  classes,
  classesData,
  subjectsData,
  timeslotsData,
}: ClassListProps) {
  const [sortedClasses, setSortedClasses] = useState<any[]>([]);
  
  // Sort classes by time
  useEffect(() => {
    if (classes && timeslotsData) {
      const sorted = [...classes].sort((a, b) => {
        const aTimeSlot = timeslotsData.find((ts) => ts.id === a.timeSlotId);
        const bTimeSlot = timeslotsData.find((ts) => ts.id === b.timeSlotId);
        
        if (!aTimeSlot || !bTimeSlot) return 0;
        
        // Compare start times (assuming format like "09:00")
        return aTimeSlot.startTime.localeCompare(bTimeSlot.startTime);
      });
      
      setSortedClasses(sorted);
    }
  }, [classes, timeslotsData]);

  // Helper function to get class info
  const getClassInfo = (classId: number) => {
    return classesData?.find((c) => c.id === classId);
  };

  // Helper function to get subject info
  const getSubjectInfo = (subjectId: number) => {
    return subjectsData?.find((s) => s.id === subjectId);
  };

  // Helper function to get time slot info
  const getTimeSlotInfo = (timeSlotId: number) => {
    return timeslotsData?.find((ts) => ts.id === timeSlotId);
  };

  // Get current time to determine upcoming classes
  const currentTime = new Date();
  const currentTimeString = format(currentTime, "HH:mm");

  return (
    <div className="space-y-3">
      {sortedClasses.map((classEntry) => {
        const classInfo = getClassInfo(classEntry.classId);
        const subjectInfo = getSubjectInfo(classEntry.subjectId);
        const timeSlotInfo = getTimeSlotInfo(classEntry.timeSlotId);
        
        // Determine if this class is next/upcoming based on time
        const isUpcoming = timeSlotInfo && timeSlotInfo.startTime > currentTimeString;
        const isInProgress = timeSlotInfo && 
          timeSlotInfo.startTime <= currentTimeString && 
          timeSlotInfo.endTime > currentTimeString;
        
        return (
          <Link key={classEntry.id} href={`/teacher/class/${classEntry.id}`}>
            <a className="block group">
              <div className={`p-4 rounded-lg border ${
                isInProgress 
                  ? "bg-blue-50 border-blue-200" 
                  : "bg-white hover:bg-gray-50"
              } transition-colors`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{subjectInfo?.name || "Unknown Subject"}</h3>
                      {isInProgress && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                          In Progress
                        </Badge>
                      )}
                      {isUpcoming && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                          Upcoming
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {classInfo?.name || "Unknown Class"}
                      {classEntry.roomNumber && ` • Room ${classEntry.roomNumber}`}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <div className="text-right mr-2">
                      <p className="text-sm font-medium">{timeSlotInfo?.startTime} - {timeSlotInfo?.endTime}</p>
                      <p className="text-xs text-gray-500">{timeSlotInfo?.label}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </div>
              </div>
            </a>
          </Link>
        );
      })}

      {sortedClasses.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Classes Today</h3>
          <p className="text-gray-500 mt-2">You don't have any classes scheduled for today.</p>
        </div>
      )}
    </div>
  );
}
