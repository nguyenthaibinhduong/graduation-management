import { Course } from "src/entities/course.entity";

export class CourseFactory {
  static createCurrent(): Course {
    const course = new Course();
    const currentYear = new Date().getFullYear();

    course.name = `Năm học ${currentYear}-${currentYear + 1}`;
    course.start_time = new Date(`${currentYear}-09-01`);
    course.end_time = new Date(`${currentYear + 1}-06-01`);
    course.is_current = true;

    return course;
  }
}
