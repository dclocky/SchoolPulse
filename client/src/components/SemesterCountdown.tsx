import { useState, useEffect } from "react";
import { differenceInDays } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { Clock, Calendar } from "lucide-react";

interface SemesterCountdownProps {
  startDate: Date;
  endDate: Date;
}

export function SemesterCountdown({ startDate, endDate }: SemesterCountdownProps) {
  const [daysRemaining, setDaysRemaining] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isValidDates, setIsValidDates] = useState<boolean>(false);

  useEffect(() => {
    // Validate dates
    if (!(startDate instanceof Date) || !(endDate instanceof Date) || 
        isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setIsValidDates(false);
      return;
    }
    
    setIsValidDates(true);
    
    // Calculate days between start and end dates
    const totalDays = differenceInDays(endDate, startDate);
    if (totalDays <= 0) {
      setIsValidDates(false);
      return;
    }
    
    // Calculate days remaining
    const today = new Date();
    const remaining = differenceInDays(endDate, today);
    setDaysRemaining(Math.max(0, remaining));
    
    // Calculate progress percentage
    const daysPassed = differenceInDays(today, startDate);
    const progressPercentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    setProgress(progressPercentage);
  }, [startDate, endDate]);

  if (!isValidDates) {
    return null;
  }

  return (
    <div className="bg-white p-3 rounded-lg border shadow-sm flex items-center space-x-3">
      <div className="flex-shrink-0 bg-primary-100 rounded-md p-2">
        <Calendar className="h-5 w-5 text-primary-600" />
      </div>
      <div className="min-w-[180px]">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-sm font-medium">Semester Progress</h3>
          <span className="text-sm font-medium">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>{daysRemaining} days remaining</span>
        </div>
      </div>
    </div>
  );
}
