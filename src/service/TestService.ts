import api from "@/lib/axios";

export const TestService = {
  async createTest(data: any) {
    const response = await api.post("/tests/objective", data);
    return response.data;
  },

  async getCourses() {
    const response = await api.get("/courses");
    return response.data;
  },

 async getChapters() {
  const response = await api.get("/tests/subjects/chapters");
  return response.data;
}


};
