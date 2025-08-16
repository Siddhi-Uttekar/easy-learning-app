import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { authService, USER_QUERY_KEY } from "@/service/authService";

interface User {
  id: string;
  email: string;
  role: string;
  [key: string]: any;
}

export function useUser(): UseQueryResult<User, Error> {
  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: authService.fetchUserData,
    enabled: authService.isLoggedIn(),
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401) {
        authService.logout();
        return false;
      }
      return failureCount < 1;
    },
  });
}
