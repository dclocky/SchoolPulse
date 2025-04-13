import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Check,
  Clock,
  Loader2,
  Save,
  Search,
  User,
  Users,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AttendanceTrackerProps {
  students: any[];
  classSessionId: number | null;
}

// Attendance status options
const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT: "absent",
  LATE: "late",
};

// Status badge components
const StatusBadge = ({ status }: { status: string }) => {
  switch (status) {
    case ATTENDANCE_STATUS.PRESENT:
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <Check className="mr-1 h-3 w-3" />
          Present
        </Badge>
      );
    case ATTENDANCE_STATUS.ABSENT:
      return (
        <Badge variant="destructive">
          <X className="mr-1 h-3 w-3" />
          Absent
        </Badge>
      );
    case ATTENDANCE_STATUS.LATE:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
          <Clock className="mr-1 h-3 w-3" />
          Late
        </Badge>
      );
    default:
      return null;
  }
};

export function AttendanceTracker({
  students,
  classSessionId,
}: AttendanceTrackerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [attendanceRecords, setAttendanceRecords] = useState<Record<number, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch existing attendance records
  const { data: existingAttendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['/api/attendance/classsession', classSessionId],
    queryFn: async () => {
      if (!classSessionId) return [];
      const res = await fetch(`/api/attendance/classsession/${classSessionId}`, { credentials: 'include' });
      if (!res.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      return res.json();
    },
    enabled: !!classSessionId,
  });

  // Update state when existing attendance data is loaded
  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const records: Record<number, string> = {};
      existingAttendance.forEach((record: any) => {
        records[record.studentId] = record.status;
      });
      setAttendanceRecords(records);
      setHasChanges(false);
    }
  }, [existingAttendance]);

  // Submit attendance records mutation
  const submitAttendance = useMutation({
    mutationFn: async (records: any[]) => {
      return apiRequest('POST', '/api/attendance/batch', { records });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/classsession', classSessionId] });
      toast({
        title: "Success",
        description: "Attendance records saved successfully",
      });
      setHasChanges(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save attendance records",
        variant: "destructive",
      });
    },
  });

  // Handle attendance status change for a student
  const handleStatusChange = (studentId: number, status: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
    setHasChanges(true);
  };

  // Bulk update all student statuses
  const handleBulkAction = (status: string) => {
    const newRecords: Record<number, string> = {};
    students.forEach(student => {
      newRecords[student.id] = status;
    });
    setAttendanceRecords(newRecords);
    setHasChanges(true);
  };

  // Handle save action
  const handleSave = () => {
    if (!classSessionId) {
      toast({
        title: "Error",
        description: "No active class session",
        variant: "destructive",
      });
      return;
    }

    const records = Object.entries(attendanceRecords).map(([studentId, status]) => ({
      classSessionId,
      studentId: Number(studentId),
      status,
      timestamp: new Date()
    }));

    submitAttendance.mutate(records);
  };

  // Filter students based on search query and status filter
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      searchQuery === "" || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      attendanceRecords[student.id] === statusFilter || 
      (statusFilter === "unmarked" && !attendanceRecords[student.id]);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate attendance stats
  const stats = {
    total: students.length,
    present: Object.values(attendanceRecords).filter(status => status === ATTENDANCE_STATUS.PRESENT).length,
    absent: Object.values(attendanceRecords).filter(status => status === ATTENDANCE_STATUS.ABSENT).length,
    late: Object.values(attendanceRecords).filter(status => status === ATTENDANCE_STATUS.LATE).length,
    unmarked: students.length - Object.keys(attendanceRecords).length
  };

  if (!classSessionId) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No Active Class Session</h3>
        <p className="text-gray-500 mt-2">A class session must be created before attendance can be taken.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-medium">Attendance</h3>
          <p className="text-sm text-gray-500">
            {stats.total} students in class • 
            {stats.present > 0 && ` ${stats.present} present •`}
            {stats.absent > 0 && ` ${stats.absent} absent •`}
            {stats.late > 0 && ` ${stats.late} late •`}
            {stats.unmarked > 0 && ` ${stats.unmarked} unmarked`}
            {stats.unmarked === 0 && ` All marked`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleBulkAction(ATTENDANCE_STATUS.PRESENT)}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark All Present
          </Button>
          <Button 
            size="sm" 
            variant="default" 
            onClick={handleSave}
            disabled={!hasChanges || submitAttendance.isPending}
          >
            {submitAttendance.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search students..."
            className="pl-9"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Students</SelectItem>
            <SelectItem value="unmarked">Unmarked</SelectItem>
            <SelectItem value={ATTENDANCE_STATUS.PRESENT}>Present</SelectItem>
            <SelectItem value={ATTENDANCE_STATUS.ABSENT}>Absent</SelectItem>
            <SelectItem value={ATTENDANCE_STATUS.LATE}>Late</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student list */}
      {loadingAttendance ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Students Found</h3>
          <p className="text-gray-500 mt-2">
            {searchQuery || statusFilter !== "all" 
              ? "Try adjusting your search or filter criteria" 
              : "No students are enrolled in this class"}
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] rounded-md border">
          <div className="p-4 space-y-3">
            {filteredStudents.map(student => (
              <div 
                key={student.id}
                className="p-3 border rounded-lg flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{student.firstName} {student.lastName}</div>
                    <div className="text-sm text-gray-500">{student.email || "No email"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {attendanceRecords[student.id] && (
                    <StatusBadge status={attendanceRecords[student.id]} />
                  )}
                  <Select
                    value={attendanceRecords[student.id] || ""}
                    onValueChange={(value) => handleStatusChange(student.id, value)}
                  >
                    <SelectTrigger className="w-[120px] bg-white">
                      <SelectValue placeholder="Mark..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ATTENDANCE_STATUS.PRESENT}>Present</SelectItem>
                      <SelectItem value={ATTENDANCE_STATUS.ABSENT}>Absent</SelectItem>
                      <SelectItem value={ATTENDANCE_STATUS.LATE}>Late</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
