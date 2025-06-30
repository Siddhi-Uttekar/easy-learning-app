import api from '@/lib/axios';

export const TestService = {
    async createTest(data: any){
        const res = await api.post("/tests/objective", data);
        return res.data;
    },
};