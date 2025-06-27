export interface Course {
  id: number;
  title: string;
  description: string;
  price: string;
  category: string | null;
  imageUrl: string;
  tags: string[];
  teacherId: number;
  createdAt: string;
  updatedAt: string;
  teacher: {
    id: number;
    name: string;
  };
}
