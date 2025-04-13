import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CSVImporter } from "@/components/ui/csv-importer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, FileText, Info } from "lucide-react";

export default function DataImport() {
  const [activeTab, setActiveTab] = useState("teachers");
  const [teacherImportSuccess, setTeacherImportSuccess] = useState<any>(null);
  const [studentImportSuccess, setStudentImportSuccess] = useState<any>(null);
  const [classImportSuccess, setClassImportSuccess] = useState<any>(null);

  // Fetch existing data for reference
  const { data: teachersData } = useQuery({
    queryKey: ['/api/teachers'],
  });

  const { data: classesData } = useQuery({
    queryKey: ['/api/classes'],
  });

  const { data: studentsData } = useQuery({
    queryKey: ['/api/students'],
  });

  const handleTeacherImportSuccess = (data: any) => {
    setTeacherImportSuccess(data);
  };

  const handleStudentImportSuccess = (data: any) => {
    setStudentImportSuccess(data);
  };

  const handleClassImportSuccess = (data: any) => {
    setClassImportSuccess(data);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Data Import</h1>
          <p className="text-muted-foreground">Import teachers, classes, and students using CSV files.</p>
        </div>
      </div>

      <Tabs defaultValue="teachers" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="classes">Classes</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CSVImporter
              endpoint="/api/import/teachers"
              title="Import Teachers"
              description="Upload a CSV file containing teacher information."
              onSuccess={handleTeacherImportSuccess}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Teacher Import Format</CardTitle>
                <CardDescription>
                  Your CSV file should include the following columns:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left font-medium text-gray-500 pb-2">Column</th>
                          <th className="text-left font-medium text-gray-500 pb-2">Required</th>
                          <th className="text-left font-medium text-gray-500 pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1 pr-4 font-medium">firstName</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">Teacher's first name</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">lastName</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">Teacher's last name</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">email</td>
                          <td className="py-1 pr-4 text-yellow-600">Optional</td>
                          <td className="py-1 pr-4">Email address (generated if missing)</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">username</td>
                          <td className="py-1 pr-4 text-yellow-600">Optional</td>
                          <td className="py-1 pr-4">Login username (generated if missing)</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">password</td>
                          <td className="py-1 pr-4 text-yellow-600">Optional</td>
                          <td className="py-1 pr-4">Password (defaults to "teacher123")</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">subjects</td>
                          <td className="py-1 pr-4 text-yellow-600">Optional</td>
                          <td className="py-1 pr-4">Comma-separated list of subjects taught</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Example Format</AlertTitle>
                    <AlertDescription className="font-mono text-xs mt-2">
                      firstName,lastName,email,subjects<br />
                      John,Smith,john.smith@school.edu,"Mathematics,Physics"<br />
                      Jane,Doe,jane.doe@school.edu,"English,Literature"
                    </AlertDescription>
                  </Alert>
                  
                  {teacherImportSuccess && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-800">
                        Successfully imported {teacherImportSuccess.teachers.length} teachers.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    <FileText className="inline-block mr-2 h-4 w-4" />
                    Current teacher count: {teachersData?.length || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="classes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CSVImporter
              endpoint="/api/import/classes"
              title="Import Classes"
              description="Upload a CSV file containing class information."
              onSuccess={handleClassImportSuccess}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Class Import Format</CardTitle>
                <CardDescription>
                  Your CSV file should include the following columns:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left font-medium text-gray-500 pb-2">Column</th>
                          <th className="text-left font-medium text-gray-500 pb-2">Required</th>
                          <th className="text-left font-medium text-gray-500 pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1 pr-4 font-medium">name</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">Class name (e.g., "10A")</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">grade</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">Grade level (e.g., "10")</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">section</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">Section identifier (e.g., "A")</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">roomNumber</td>
                          <td className="py-1 pr-4 text-yellow-600">Optional</td>
                          <td className="py-1 pr-4">Default classroom number</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Example Format</AlertTitle>
                    <AlertDescription className="font-mono text-xs mt-2">
                      name,grade,section,roomNumber<br />
                      10A,10,A,101<br />
                      11B,11,B,102<br />
                      9C,9,C,103
                    </AlertDescription>
                  </Alert>
                  
                  {classImportSuccess && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-800">
                        Successfully imported {classImportSuccess.classes.length} classes.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    <FileText className="inline-block mr-2 h-4 w-4" />
                    Current class count: {classesData?.length || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CSVImporter
              endpoint="/api/import/students"
              title="Import Students"
              description="Upload a CSV file containing student information."
              onSuccess={handleStudentImportSuccess}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Student Import Format</CardTitle>
                <CardDescription>
                  Your CSV file should include the following columns:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="text-left font-medium text-gray-500 pb-2">Column</th>
                          <th className="text-left font-medium text-gray-500 pb-2">Required</th>
                          <th className="text-left font-medium text-gray-500 pb-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="py-1 pr-4 font-medium">firstName</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">Student's first name</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">lastName</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">Student's last name</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">classId</td>
                          <td className="py-1 pr-4 text-green-600">Yes</td>
                          <td className="py-1 pr-4">ID of the student's class</td>
                        </tr>
                        <tr>
                          <td className="py-1 pr-4 font-medium">email</td>
                          <td className="py-1 pr-4 text-yellow-600">Optional</td>
                          <td className="py-1 pr-4">Student's email address</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertTitle>Example Format</AlertTitle>
                    <AlertDescription className="font-mono text-xs mt-2">
                      firstName,lastName,classId,email<br />
                      John,Smith,1,john.smith@student.school.edu<br />
                      Jane,Doe,2,jane.doe@student.school.edu
                    </AlertDescription>
                  </Alert>
                  
                  <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                    <Info className="h-4 w-4 text-yellow-500" />
                    <AlertTitle>Important Note</AlertTitle>
                    <AlertDescription className="text-yellow-800">
                      You must import classes before importing students, as each student needs to be assigned to a valid class ID.
                    </AlertDescription>
                  </Alert>
                  
                  {studentImportSuccess && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-800">
                        Successfully imported {studentImportSuccess.students.length} students.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="text-sm text-gray-500">
                    <FileText className="inline-block mr-2 h-4 w-4" />
                    Current student count: {studentsData?.length || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
