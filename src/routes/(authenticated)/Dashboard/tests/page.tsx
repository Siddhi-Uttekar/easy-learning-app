"use client";

import { useState } from "react";
import { TestService } from "@/service/TestService";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  BookOpen,
  FileText,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  MoreVertical,
  GraduationCap,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authService } from "@/service/authService";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { queryClient } from "@/lib/queryClient";

interface Test {
  id: number;
  title: string;
  description: string;
  type: "OBJECTIVE" | "SUBJECTIVE";
  courseId: number;
  teacherId: number;
  totalMarks: number;
  passingMarks: number;
  timeLimit: number;
  isPublished: boolean;
  isActive: boolean;
  createdAt: string;
  chapter: any;
  examType: {
    id: number;
    displayName: string;
  };
}

export function TestsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<number | null>(null);

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["user"],
    queryFn: authService.fetchUserData,
    retry: 1,
  });

  const {
    data: courses = [],
    isLoading: coursesLoading,
    error: coursesError,
  } = useQuery({
    queryKey: ["courses"],
    queryFn: TestService.getCourses,
    retry: 1,
  });

  const {
    data: tests = [],
    isLoading: testsLoading,
    error: testsError,
  } = useQuery({
    queryKey: ["tests", user?.id],
    queryFn: async () => {
      if (!user?.id || !courses.length) return [];

      const allTests: Test[] = [];
      for (const course of courses) {
        try {
          const testsResponse = await TestService.getTestsForCourse(
            course.id,
            user.id
          );
          allTests.push(...testsResponse);
        } catch (error) {
          console.error(`Error fetching tests for course ${course.id}:`, error);
        }
      }
      return allTests;
    },
    enabled: !!user?.id && courses.length > 0,
    retry: 1,
  });

  const publishMutation = useMutation({
    mutationFn: async ({
      testId,
      isPublished,
      teacherId,
    }: {
      testId: number;
      isPublished: boolean;
      teacherId: number;
    }) => {
      if (isPublished) {
        return TestService.unpublishTest(testId, teacherId);
      } else {
        return TestService.publishTest(testId, teacherId);
      }
    },
    onSuccess: (_, { isPublished }) => {
      toast.success(
        `Test ${isPublished ? "unpublished" : "published"} successfully`
      );
      queryClient.invalidateQueries({ queryKey: ["tests"] });
    },
    onError: (error, { isPublished }) => {
      toast.error(`Failed to ${isPublished ? "unpublish" : "publish"} test`);
      console.error("Error toggling publish status:", error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({
      testId,
      teacherId,
    }: {
      testId: number;
      teacherId: number;
    }) => {
      return TestService.deleteTest(testId, teacherId);
    },
    onSuccess: () => {
      toast.success("Test deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["tests"] });
      setDeleteDialogOpen(false);
      setTestToDelete(null);
    },
    onError: (error) => {
      toast.error("Failed to delete test");
      console.error("Error deleting test:", error);
    },
  });

  const handlePublishToggle = (testId: number, currentStatus: boolean) => {
    if (!user?.id) return;
    publishMutation.mutate({
      testId,
      isPublished: currentStatus,
      teacherId: user.id,
    });
  };

  const handleDeleteTest = () => {
    if (!testToDelete || !user?.id) return;
    deleteMutation.mutate({
      testId: testToDelete,
      teacherId: user.id,
    });
  };

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse =
      selectedCourse === "all" || test.courseId.toString() === selectedCourse;
    const matchesType = selectedType === "all" || test.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "published" && test.isPublished) ||
      (selectedStatus === "unpublished" && !test.isPublished);

    return matchesSearch && matchesCourse && matchesType && matchesStatus;
  });

  const getStatusBadge = (test: Test) => {
    if (!test.isActive) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (test.isPublished) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">Published</Badge>
      );
    }
    return <Badge variant="secondary">Draft</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge
        variant="outline"
        className={
          type === "OBJECTIVE"
            ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            : "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100"
        }
      >
        {type}
      </Badge>
    );
  };

  const getCourseNameById = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.name : "Unknown Course";
  };

  const isLoading = userLoading || coursesLoading || testsLoading;
  const hasError = userError || coursesError || testsError;

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-lg font-medium text-muted-foreground">
            Loading tests...
          </span>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <GraduationCap className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Failed to load tests
            </h3>
            <p className="text-muted-foreground">
              There was an error loading your tests. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[80vh] flex flex-col">
      <div className="flex-none space-y-6 p-6 border-b bg-background">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Tests Management
            </h1>
            <p className="text-muted-foreground">
              Create, manage, and monitor your tests
            </p>
          </div>
          <Button
            onClick={() => navigate({ to: "/Dashboard/tests/create" })}
            className="shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Test
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Tests
                  </p>
                  <p className="text-2xl font-bold">{tests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
                  <Play className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Published
                  </p>
                  <p className="text-2xl font-bold">
                    {tests.filter((t) => t.isPublished).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-lg dark:bg-orange-900">
                  <Pause className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Drafts
                  </p>
                  <p className="text-2xl font-bold">
                    {tests.filter((t) => !t.isPublished).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
                  <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Courses
                  </p>
                  <p className="text-2xl font-bold">{courses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="All Courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="OBJECTIVE">Objective</SelectItem>
                  <SelectItem value="SUBJECTIVE">Subjective</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="unpublished">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {filteredTests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tests found</h3>
                <p className="text-muted-foreground mb-6">
                  {tests.length === 0
                    ? "You haven't created any tests yet. Start by creating your first test!"
                    : "No tests match your current filters. Try adjusting your search criteria."}
                </p>
                {tests.length === 0 && (
                  <Button
                    onClick={() => navigate({ to: "/Dashboard/tests/create" })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Test
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card
                  key={test.id}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold mb-1 truncate">
                          {test.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {test.description || "No description provided"}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 shrink-0"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({ to: `/Dashboard/tests/${test.id}` })
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate({
                                to: `/Dashboard/tests/${test.id}/edit`,
                              })
                            }
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Test
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handlePublishToggle(test.id, test.isPublished)
                            }
                            disabled={publishMutation.isPending}
                          >
                            {test.isPublished ? (
                              <>
                                <Pause className="mr-2 h-4 w-4" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Play className="mr-2 h-4 w-4" />
                                Publish
                              </>
                            )}
                          </DropdownMenuItem>
                          <Separator />
                          <DropdownMenuItem
                            onClick={() => {
                              setTestToDelete(test.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getStatusBadge(test)}
                      {getTypeBadge(test.type)}
                    </div>

                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground truncate">
                        {getCourseNameById(test.courseId)}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <GraduationCap className="w-4 h-4" />
                          Exam Type
                        </span>
                        <span className="font-medium truncate ml-2">
                          {test.examType?.displayName || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          Total Marks
                        </span>
                        <span className="font-medium">{test.totalMarks}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          Duration
                        </span>
                        <span className="font-medium">
                          {test.timeLimit} mins
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Users className="w-4 h-4" />
                          Passing Marks
                        </span>
                        <span className="font-medium">{test.passingMarks}</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="text-xs text-muted-foreground">
                      Created {new Date(test.createdAt).toLocaleDateString()}
                    </div>

                    <div className="flex gap-2">
                      {authService.isAdmin() ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate({ to: `/Dashboard/tests/${test.id}` })
                            }
                            className="flex-1"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant={test.isPublished ? "secondary" : "default"}
                            size="sm"
                            onClick={() =>
                              handlePublishToggle(test.id, test.isPublished)
                            }
                            disabled={publishMutation.isPending}
                            className="flex-1"
                          >
                            {publishMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : test.isPublished ? (
                              <>
                                <Pause className="w-4 h-4 mr-1" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4 mr-1" />
                                Publish
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            navigate({
                              to: `/Dashboard/tests/${test.id}/start`,
                            })
                          }
                          className="w-full"
                          disabled={!test.isPublished}
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Attempt Test
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Test</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this test? This action cannot be
              undone and will permanently remove the test and all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTest}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Delete Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
