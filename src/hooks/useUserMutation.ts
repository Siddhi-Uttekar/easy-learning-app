import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService, USER_QUERY_KEY } from "@/service/authService";
import api from "@/lib/axios";

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: any) => {
      const response = await api.put("/auth/profile", userData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(USER_QUERY_KEY, data.user);
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
    },
    onError: (error) => {
      console.error("Failed to update user:", error);
    },
  });
}

export function useRefreshUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.fetchUserData,
    onSuccess: (data) => {
      queryClient.setQueryData(USER_QUERY_KEY, data);
    },
  });
}
