import type { Course } from "@/types/Course";

interface Props {
  course: Course;
}

export default function CourseCard({ course }: Props) {
  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-lg transition">
      <img
        src={`https://app.webfuze.in/${course.imageUrl}`}
        alt={course.title}
        className="w-full h-40 object-cover rounded"
      />
      <h3 className="text-lg font-bold mt-2">{course.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{course.description}</p>
      <p className="mt-2 font-semibold">₹{course.price}</p>

      <div className="flex flex-wrap gap-2 mt-3">
        {course.tags.map((tag) => (
          <span
            key={tag}
            className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
