// import api from "@/lib/axios";

// export const TestService = {
//   async createTest(data: any) {
//     const response = await api.post("/tests/objective", data);
//     return response.data;
//   },

//   async getCourses() {
//     const response = await api.get("/courses");
//     return response.data;
//   },

//  async getChapters() {
//   const response = await api.get("/tests/subjects/chapters");
//   return response.data;
// }

// //



// };
import api from "@/lib/axios";

export const TestService = {
  // Test Creation
  async createTest(data: any) {
    const response = await api.post("/tests/objective", data);
    return response.data;
  },

  // Course and Chapter Management
  async getCourses() {
    const response = await api.get("/courses");
    return response.data;
  },

  async getChapters() {
    const response = await api.get("/tests/subjects/chapters");
    return response.data;
  },

  async getChaptersByStandardAndSubject(standard: string, subject: string) {
    const response = await api.get(`/tests/subjects/chapters?standard=${standard}&subject=${subject}`);
    return response.data;
  },

  async getCourseChapters(courseId: number) {
    const response = await api.get(`/tests/course/${courseId}/chapters`);
    return response.data;
  },

  // Test Retrieval
  async getTestDetails(testId: number, withSolutions: boolean = false) {
    const response = await api.get(`/tests/${testId}?withSolutions=${withSolutions}`);
    return response.data;
  },

  async getTestsForTeacher(teacherId: number) {
    const response = await api.get(`/tests/teacher/${teacherId}`);
    return response.data;
  },

  async getTestsForCourse(courseId: number, teacherId?: number) {
    const params = teacherId ? { teacherId } : {};
    const response = await api.get(`/tests/course/${courseId}`, { params });
    return response.data;
  },

  async getTestAttempts(testId: number, teacherId: number) {
    const response = await api.get(`/tests/${testId}/attempts?teacherId=${teacherId}`);
    return response.data;
  },

  // Test Management
  async publishTest(testId: number, teacherId: number) {
    const response = await api.patch(`/tests/${testId}/publish`, {
      teacherId
    });
    return response.data;
  },

  async unpublishTest(testId: number, teacherId: number) {
    const response = await api.patch(`/tests/${testId}/unpublish`, {
      teacherId
    });
    return response.data;
  },

  async deleteTest(testId: number, teacherId: number) {
    const response = await api.delete(`/tests/${testId}`, {
      data: { teacherId }
    });
    return response.data;
  },

  // Test Taking (Student APIs)
  async startTestAttempt(testId: number, studentId: number) {
    const response = await api.post(`/tests/${testId}/attempt`, {
      studentId
    });
    return response.data;
  },

  async submitObjectiveAnswers(attemptId: number, answers: any[]) {
    const response = await api.post(`/tests/attempts/${attemptId}/objective-answers`, {
      answers
    });
    return response.data;
  },

  async submitSubjectiveAnswers(attemptId: number, answers: any[]) {
    const response = await api.post(`/tests/attempts/${attemptId}/subjective-answers`, {
      answers
    });
    return response.data;
  },

  async evaluateSubjectiveAnswers(attemptId: number, evaluatorId: number, evaluations: any[]) {
    const response = await api.post(`/tests/attempts/${attemptId}/evaluate`, {
      evaluatorId,
      evaluations
    });
    return response.data;
  },

  // Student Dashboard
  async getStudentAttempts(studentId: number) {
    const response = await api.get(`/tests/student/${studentId}/attempts`);
    return response.data;
  },

  // Reference Data
  async getExamTypes() {
    const response = await api.get("/tests/exam-types");
    return response.data;
  },

  async getExamTypeChapters(examTypeId: number) {
    const response = await api.get(`/tests/exam-types/${examTypeId}/chapters`);
    return response.data;
  },

  async getQuestionBankQuestions(chapterOriginalId: number, examTypeId: number) {
    const response = await api.get(`/tests/qb-chapters/${chapterOriginalId}/questions?examTypeId=${examTypeId}`);
    return response.data;
  },

  // Subjective Test Creation
  async createSubjectiveTest(data: any) {
    const response = await api.post("/tests/subjective", data);
    return response.data;
  },

  // Utility Methods
  async getAllTests() {
    const response = await api.get("/tests");
    return response.data;
  },

  async getTestsByFilter(filters: {
    courseId?: number;
    teacherId?: number;
    type?: "OBJECTIVE" | "SUBJECTIVE";
    isPublished?: boolean;
  }) {
    const params = new URLSearchParams();

    if (filters.courseId) params.append("courseId", filters.courseId.toString());
    if (filters.teacherId) params.append("teacherId", filters.teacherId.toString());
    if (filters.type) params.append("type", filters.type);
    if (filters.isPublished !== undefined) params.append("isPublished", filters.isPublished.toString());

    const response = await api.get(`/tests?${params.toString()}`);
    return response.data;
  }
};

// Export default for backward compatibility
export default TestService;