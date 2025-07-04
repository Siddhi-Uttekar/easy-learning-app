// "use client";

// import { useEffect, useState } from "react";
// import { TestService } from "@/service/TestService";
// import { toast } from "sonner";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import {
//   Loader2,
//   Plus,
//   Search,
//   Filter,
//   Clock,
//   Users,
//   BookOpen,
//   FileText,
//   Eye,
//   Edit,
//   Trash2,
//   Play,
//   Pause,
//   MoreVertical
// } from "lucide-react";
// import { useNavigate } from "@tanstack/react-router";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";

// interface Test {
//   id: number;
//   title: string;
//   description: string;
//   type: "OBJECTIVE" | "SUBJECTIVE";
//   courseId: number;
//   teacherId: number;
//   totalMarks: number;
//   passingMarks: number;
//   timeLimit: number;
//   isPublished: boolean;
//   isActive: boolean;
//   createdAt: string;
//   chapter: any;
//   examType: {
//     id: number;
//     displayName: string;
//   };
// }

// export function TestsPage() {
//   const navigate = useNavigate();
//   const [tests, setTests] = useState<Test[]>([]);
//   const [courses, setCourses] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [selectedCourse, setSelectedCourse] = useState<string>("all");
//   const [selectedType, setSelectedType] = useState<string>("all");
//   const [selectedStatus, setSelectedStatus] = useState<string>("all");
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
//   const [testToDelete, setTestToDelete] = useState<number | null>(null);
//   const [actionLoading, setActionLoading] = useState<number | null>(null);

//   // Teacher ID - replace with actual logged-in teacher ID
//   const teacherId = 123;

//   useEffect(() => {
//     fetchCoursesAndTests();
//   }, []);

//   const fetchCoursesAndTests = async () => {
//     try {
//       setLoading(true);

//       // First fetch courses
//       const coursesResponse = await TestService.getCourses();
//       setCourses(coursesResponse);

//       // Then fetch tests for all courses for this teacher
//       const allTests: Test[] = [];

//       for (const course of coursesResponse) {
//         try {
//           const testsResponse = await TestService.getTestsForCourse(course.id, teacherId);
//           allTests.push(...testsResponse);
//         } catch (error) {
//           console.error(`Error fetching tests for course ${course.id}:`, error);
//         }
//       }

//       setTests(allTests);
//     } catch (error) {
//       toast.error("Failed to load tests and courses");
//       console.error("Error fetching tests and courses:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePublishToggle = async (testId: number, currentStatus: boolean) => {
//     try {
//       setActionLoading(testId);
//       if (currentStatus) {
//         await TestService.unpublishTest(testId, teacherId);
//         toast.success("Test unpublished successfully");
//       } else {
//         await TestService.publishTest(testId, teacherId);
//         toast.success("Test published successfully");
//       }
//       fetchCoursesAndTests(); // Refresh the list
//     } catch (error) {
//       toast.error(`Failed to ${currentStatus ? 'unpublish' : 'publish'} test`);
//       console.error("Error toggling publish status:", error);
//     } finally {
//       setActionLoading(null);
//     }
//   };

//   const handleDeleteTest = async () => {
//     if (!testToDelete) return;

//     try {
//       setActionLoading(testToDelete);
//       await TestService.deleteTest(testToDelete, teacherId);
//       toast.success("Test deleted successfully");
//       fetchCoursesAndTests(); // Refresh the list
//     } catch (error) {
//       toast.error("Failed to delete test");
//       console.error("Error deleting test:", error);
//     } finally {
//       setActionLoading(null);
//       setDeleteDialogOpen(false);
//       setTestToDelete(null);
//     }
//   };

//   const filteredTests = tests.filter((test) => {
//     const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          test.description?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesCourse = selectedCourse === "all" || test.courseId.toString() === selectedCourse;
//     const matchesType = selectedType === "all" || test.type === selectedType;
//     const matchesStatus = selectedStatus === "all" ||
//                          (selectedStatus === "published" && test.isPublished) ||
//                          (selectedStatus === "unpublished" && !test.isPublished);

//     return matchesSearch && matchesCourse && matchesType && matchesStatus;
//   });

//   const getStatusBadge = (test: Test) => {
//     if (!test.isActive) {
//       return <Badge variant="destructive">Inactive</Badge>;
//     }
//     if (test.isPublished) {
//       return <Badge variant="default">Published</Badge>;
//     }
//     return <Badge variant="secondary">Draft</Badge>;
//   };

//   const getTypeBadge = (type: string) => {
//     return (
//       <Badge variant="outline" className={type === "OBJECTIVE" ? "border-blue-500 text-blue-600" : "border-purple-500 text-purple-600"}>
//         {type}
//       </Badge>
//     );
//   };

//   const getCourseNameById = (courseId: number) => {
//     const course = courses.find(c => c.id === courseId);
//     return course ? course.name : 'Unknown Course';
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="flex items-center gap-2">
//           <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//           <span className="text-lg font-medium text-gray-700">Loading tests...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Tests Management</h1>
//             <p className="text-gray-600">Create, manage, and monitor your tests</p>
//           </div>
//           <Button
//             onClick={() => navigate({ to: '/Dashboard/tests/create' })}
//             className="mt-4 md:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
//           >
//             <Plus className="w-4 h-4 mr-2" />
//             Create New Test
//           </Button>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <FileText className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Tests</p>
//                   <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <Play className="w-6 h-6 text-green-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Published</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {tests.filter(t => t.isPublished).length}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-yellow-100 rounded-lg">
//                   <Pause className="w-6 h-6 text-yellow-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Drafts</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {tests.filter(t => !t.isPublished).length}
//                   </p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardContent className="p-6">
//               <div className="flex items-center">
//                 <div className="p-2 bg-purple-100 rounded-lg">
//                   <BookOpen className="w-6 h-6 text-purple-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Courses</p>
//                   <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Filters */}
//         <Card className="mb-6 shadow-lg">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Filter className="w-5 h-5 text-gray-600" />
//               Filters
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                 <Input
//                   placeholder="Search tests..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>

//               <Select value={selectedCourse} onValueChange={setSelectedCourse}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Courses" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Courses</SelectItem>
//                   {courses.map((course) => (
//                     <SelectItem key={course.id} value={course.id.toString()}>
//                       {course.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <Select value={selectedType} onValueChange={setSelectedType}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Types" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Types</SelectItem>
//                   <SelectItem value="OBJECTIVE">Objective</SelectItem>
//                   <SelectItem value="SUBJECTIVE">Subjective</SelectItem>
//                 </SelectContent>
//               </Select>

//               <Select value={selectedStatus} onValueChange={setSelectedStatus}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="All Status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Status</SelectItem>
//                   <SelectItem value="published">Published</SelectItem>
//                   <SelectItem value="unpublished">Draft</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </CardContent>
//         </Card>

//         {/* Tests Grid */}
//         {filteredTests.length === 0 ? (
//           <Card className="shadow-lg">
//             <CardContent className="p-12 text-center">
//               <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-xl font-semibold text-gray-700 mb-2">No tests found</h3>
//               <p className="text-gray-500 mb-6">
//                 {tests.length === 0
//                   ? "You haven't created any tests yet. Start by creating your first test!"
//                   : "No tests match your current filters. Try adjusting your search criteria."
//                 }
//               </p>
//               {tests.length === 0 && (
//                 <Button
//                   onClick={() => navigate({ to: '/Dashboard/tests/create' })}
//                   className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create Your First Test
//                 </Button>
//               )}
//             </CardContent>
//           </Card>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredTests.map((test) => (
//               <Card key={test.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-start justify-between">
//                     <div className="flex-1">
//                       <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
//                         {test.title}
//                       </CardTitle>
//                       <p className="text-sm text-gray-600 line-clamp-2">
//                         {test.description || "No description provided"}
//                       </p>
//                     </div>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
//                           <MoreVertical className="h-4 w-4" />
//                         </Button>
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent align="end">
//                         <DropdownMenuItem onClick={() => navigate({ to: `/Dashboard/tests/${test.id}` })}>
//                           <Eye className="mr-2 h-4 w-4" />
//                           View Details
//                         </DropdownMenuItem>
//                         <DropdownMenuItem onClick={() => navigate({ to: `/Dashboard/tests/${test.id}/edit` })}>
//                           <Edit className="mr-2 h-4 w-4" />
//                           Edit Test
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           onClick={() => handlePublishToggle(test.id, test.isPublished)}
//                           disabled={actionLoading === test.id}
//                         >
//                           {test.isPublished ? (
//                             <>
//                               <Pause className="mr-2 h-4 w-4" />
//                               Unpublish
//                             </>
//                           ) : (
//                             <>
//                               <Play className="mr-2 h-4 w-4" />
//                               Publish
//                             </>
//                           )}
//                         </DropdownMenuItem>
//                         <DropdownMenuItem
//                           onClick={() => {
//                             setTestToDelete(test.id);
//                             setDeleteDialogOpen(true);
//                           }}
//                           className="text-red-600"
//                         >
//                           <Trash2 className="mr-2 h-4 w-4" />
//                           Delete
//                         </DropdownMenuItem>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>
//                 </CardHeader>

//                 <CardContent className="space-y-4">
//                   {/* Badges */}
//                   <div className="flex items-center gap-2 flex-wrap">
//                     {getStatusBadge(test)}
//                     {getTypeBadge(test.type)}
//                   </div>

//                   {/* Course Name */}
//                   <div className="flex items-center gap-2">
//                     <BookOpen className="w-4 h-4 text-gray-500" />
//                     <span className="text-sm text-gray-600">{getCourseNameById(test.courseId)}</span>
//                   </div>

//                   {/* Test Info */}
//                   <div className="space-y-2">
//                     <div className="flex items-center justify-between text-sm">
//                       <span className="flex items-center gap-1 text-gray-600">
//                         <FileText className="w-4 h-4" />
//                         Exam Type
//                       </span>
//                       <span className="font-medium">{test.examType.displayName}</span>
//                     </div>

//                     <div className="flex items-center justify-between text-sm">
//                       <span className="flex items-center gap-1 text-gray-600">
//                         <FileText className="w-4 h-4" />
//                         Total Marks
//                       </span>
//                       <span className="font-medium">{test.totalMarks}</span>
//                     </div>

//                     <div className="flex items-center justify-between text-sm">
//                       <span className="flex items-center gap-1 text-gray-600">
//                         <Clock className="w-4 h-4" />
//                         Duration
//                       </span>
//                       <span className="font-medium">{test.timeLimit} mins</span>
//                     </div>

//                     <div className="flex items-center justify-between text-sm">
//                       <span className="flex items-center gap-1 text-gray-600">
//                         <Users className="w-4 h-4" />
//                         Passing Marks
//                       </span>
//                       <span className="font-medium">{test.passingMarks}</span>
//                     </div>
//                   </div>

//                   {/* Created Date */}
//                   <div className="pt-3 border-t border-gray-200">
//                     <p className="text-xs text-gray-500">
//                       Created on {new Date(test.createdAt).toLocaleDateString()}
//                     </p>
//                   </div>

//                   {/* Action Buttons */}
//                   <div className="flex gap-2 pt-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => navigate({ to: `/Dashboard/tests/${test.id}` })}
//                       className="flex-1"
//                     >
//                       <Eye className="w-4 h-4 mr-1" />
//                       View
//                     </Button>
//                     <Button
//                       variant={test.isPublished ? "secondary" : "default"}
//                       size="sm"
//                       onClick={() => handlePublishToggle(test.id, test.isPublished)}
//                       disabled={actionLoading === test.id}
//                       className="flex-1"
//                     >
//                       {actionLoading === test.id ? (
//                         <Loader2 className="w-4 h-4 animate-spin" />
//                       ) : test.isPublished ? (
//                         <>
//                           <Pause className="w-4 h-4 mr-1" />
//                           Unpublish
//                         </>
//                       ) : (
//                         <>
//                           <Play className="w-4 h-4 mr-1" />
//                           Publish
//                         </>
//                       )}
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         )}

//         {/* Delete Confirmation Dialog */}
//         <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//           <AlertDialogContent>
//             <AlertDialogHeader>
//               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
//               <AlertDialogDescription>
//                 This action cannot be undone. This will permanently delete the test and all associated data.
//               </AlertDialogDescription>
//             </AlertDialogHeader>
//             <AlertDialogFooter>
//               <AlertDialogCancel>Cancel</AlertDialogCancel>
//               <AlertDialogAction
//                 onClick={handleDeleteTest}
//                 className="bg-red-600 hover:bg-red-700"
//                 disabled={actionLoading !== null}
//               >
//                 {actionLoading !== null ? (
//                   <Loader2 className="w-4 h-4 animate-spin mr-2" />
//                 ) : (
//                   <Trash2 className="w-4 h-4 mr-2" />
//                 )}
//                 Delete Test
//               </AlertDialogAction>
//             </AlertDialogFooter>
//           </AlertDialogContent>
//         </AlertDialog>
//       </div>
//     </div>
//   );
// }