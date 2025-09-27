import { supabase } from "../config";

interface SeedData {
  students: any[];
  teachers: any[];
  courses: any[];
  studentCourses: any[];
  teacherCourses: any[];
  attendance: any[];
  timetable: any[];
}

const seedData: SeedData = {
  students: [
    {
      usn: "CS001",
      branch: "CSE",
      name: "Alice Johnson",
      phone: "9876543210",
      email: "alice.johnson@student.edu",
      year: 3,
      sem: 5,
    },
    {
      usn: "CS002",
      branch: "CSE",
      name: "Bob Smith",
      phone: "9876543211",
      email: "bob.smith@student.edu",
      year: 3,
      sem: 5,
    },
    {
      usn: "CS003",
      branch: "CSE",
      name: "Charlie Brown",
      phone: "9876543212",
      email: "charlie.brown@student.edu",
      year: 2,
      sem: 3,
    },
    {
      usn: "IT001",
      branch: "IT",
      name: "Diana Prince",
      phone: "9876543213",
      email: "diana.prince@student.edu",
      year: 4,
      sem: 7,
    },
    {
      usn: "IT002",
      branch: "IT",
      name: "Eve Wilson",
      phone: "9876543214",
      email: "eve.wilson@student.edu",
      year: 4,
      sem: 7,
    },
  ],
  teachers: [
    {
      branch: "CSE",
      name: "Dr. Sarah Connor",
      phone: "9876543201",
      email: "sarah.connor@teacher.edu",
    },
    {
      branch: "CSE",
      name: "Prof. John Doe",
      phone: "9876543202",
      email: "john.doe@teacher.edu",
    },
    {
      branch: "IT",
      name: "Dr. Jane Smith",
      phone: "9876543203",
      email: "jane.smith@teacher.edu",
    },
    {
      branch: "IT",
      name: "Prof. Mike Johnson",
      phone: "9876543204",
      email: "mike.johnson@teacher.edu",
    },
  ],
  courses: [
    {
      name: "Data Structures and Algorithms",
      credits: 4,
    },
    {
      name: "Database Management Systems",
      credits: 3,
    },
    {
      name: "Computer Networks",
      credits: 3,
    },
    {
      name: "Software Engineering",
      credits: 4,
    },
    {
      name: "Web Technologies",
      credits: 3,
    },
  ],
  studentCourses: [
    // CSE students taking CSE courses
    { usn: "CS001", course_id: 1 },
    { usn: "CS001", course_id: 2 },
    { usn: "CS001", course_id: 3 },
    { usn: "CS002", course_id: 1 },
    { usn: "CS002", course_id: 2 },
    { usn: "CS002", course_id: 4 },
    { usn: "CS003", course_id: 1 },
    { usn: "CS003", course_id: 5 },
    // IT students taking IT courses
    { usn: "IT001", course_id: 2 },
    { usn: "IT001", course_id: 3 },
    { usn: "IT001", course_id: 4 },
    { usn: "IT002", course_id: 2 },
    { usn: "IT002", course_id: 3 },
    { usn: "IT002", course_id: 5 },
  ],
  teacherCourses: [
    // CSE teachers teaching CSE courses
    { teacher_id: 1, course_id: 1 },
    { teacher_id: 1, course_id: 2 },
    { teacher_id: 2, course_id: 3 },
    { teacher_id: 2, course_id: 4 },
    // IT teachers teaching IT courses
    { teacher_id: 3, course_id: 2 },
    { teacher_id: 3, course_id: 3 },
    { teacher_id: 4, course_id: 4 },
    { teacher_id: 4, course_id: 5 },
  ],
  attendance: [
    // Sample attendance for CS001
    { usn: "CS001", course_id: 1, date: "2024-01-15", status: "Present" },
    { usn: "CS001", course_id: 1, date: "2024-01-17", status: "Present" },
    { usn: "CS001", course_id: 1, date: "2024-01-19", status: "Late" },
    { usn: "CS001", course_id: 2, date: "2024-01-16", status: "Present" },
    { usn: "CS001", course_id: 2, date: "2024-01-18", status: "Absent" },
    // Sample attendance for CS002
    { usn: "CS002", course_id: 1, date: "2024-01-15", status: "Present" },
    { usn: "CS002", course_id: 1, date: "2024-01-17", status: "Present" },
    { usn: "CS002", course_id: 1, date: "2024-01-19", status: "Present" },
    { usn: "CS002", course_id: 2, date: "2024-01-16", status: "Present" },
    { usn: "CS002", course_id: 2, date: "2024-01-18", status: "Present" },
    // Sample attendance for IT001
    { usn: "IT001", course_id: 2, date: "2024-01-16", status: "Present" },
    { usn: "IT001", course_id: 2, date: "2024-01-18", status: "Late" },
    { usn: "IT001", course_id: 3, date: "2024-01-17", status: "Present" },
  ],
  timetable: [
    // Monday schedule
    {
      course_id: 1,
      teacher_id: 1,
      day_of_week: "Mon",
      time_slot: "09:00-10:00",
      room_no: "A101",
    },
    {
      course_id: 2,
      teacher_id: 1,
      day_of_week: "Mon",
      time_slot: "10:00-11:00",
      room_no: "A102",
    },
    {
      course_id: 3,
      teacher_id: 2,
      day_of_week: "Mon",
      time_slot: "11:00-12:00",
      room_no: "A103",
    },
    // Tuesday schedule
    {
      course_id: 1,
      teacher_id: 1,
      day_of_week: "Tue",
      time_slot: "09:00-10:00",
      room_no: "A101",
    },
    {
      course_id: 4,
      teacher_id: 2,
      day_of_week: "Tue",
      time_slot: "10:00-11:00",
      room_no: "A104",
    },
    {
      course_id: 5,
      teacher_id: 4,
      day_of_week: "Tue",
      time_slot: "11:00-12:00",
      room_no: "A105",
    },
    // Wednesday schedule
    {
      course_id: 2,
      teacher_id: 1,
      day_of_week: "Wed",
      time_slot: "09:00-10:00",
      room_no: "A102",
    },
    {
      course_id: 3,
      teacher_id: 2,
      day_of_week: "Wed",
      time_slot: "10:00-11:00",
      room_no: "A103",
    },
    {
      course_id: 4,
      teacher_id: 2,
      day_of_week: "Wed",
      time_slot: "11:00-12:00",
      room_no: "A104",
    },
    // Thursday schedule
    {
      course_id: 1,
      teacher_id: 1,
      day_of_week: "Thu",
      time_slot: "09:00-10:00",
      room_no: "A101",
    },
    {
      course_id: 2,
      teacher_id: 3,
      day_of_week: "Thu",
      time_slot: "10:00-11:00",
      room_no: "A102",
    },
    {
      course_id: 3,
      teacher_id: 3,
      day_of_week: "Thu",
      time_slot: "11:00-12:00",
      room_no: "A103",
    },
    // Friday schedule
    {
      course_id: 4,
      teacher_id: 2,
      day_of_week: "Fri",
      time_slot: "09:00-10:00",
      room_no: "A104",
    },
    {
      course_id: 5,
      teacher_id: 4,
      day_of_week: "Fri",
      time_slot: "10:00-11:00",
      room_no: "A105",
    },
  ],
};

async function seedDatabase() {
  console.log("🌱 Starting database seeding with new schema...");

  try {
    // Insert students
    console.log("📚 Inserting students...");
    const { error: studentsError } = await supabase
      .from("student")
      .insert(seedData.students);

    if (studentsError) {
      throw new Error(`Failed to insert students: ${studentsError.message}`);
    }
    console.log(`✅ Inserted ${seedData.students.length} students`);

    // Insert teachers
    console.log("👨‍🏫 Inserting teachers...");
    const { error: teachersError } = await supabase
      .from("teacher")
      .insert(seedData.teachers);

    if (teachersError) {
      throw new Error(`Failed to insert teachers: ${teachersError.message}`);
    }
    console.log(`✅ Inserted ${seedData.teachers.length} teachers`);

    // Insert courses
    console.log("📖 Inserting courses...");
    const { error: coursesError } = await supabase
      .from("course")
      .insert(seedData.courses);

    if (coursesError) {
      throw new Error(`Failed to insert courses: ${coursesError.message}`);
    }
    console.log(`✅ Inserted ${seedData.courses.length} courses`);

    // Insert student-course relationships
    console.log("🔗 Inserting student-course relationships...");
    const { error: studentCoursesError } = await supabase
      .from("student_course")
      .insert(seedData.studentCourses);

    if (studentCoursesError) {
      throw new Error(
        `Failed to insert student-course relationships: ${studentCoursesError.message}`
      );
    }
    console.log(
      `✅ Inserted ${seedData.studentCourses.length} student-course relationships`
    );

    // Insert teacher-course relationships
    console.log("🔗 Inserting teacher-course relationships...");
    const { error: teacherCoursesError } = await supabase
      .from("teacher_course")
      .insert(seedData.teacherCourses);

    if (teacherCoursesError) {
      throw new Error(
        `Failed to insert teacher-course relationships: ${teacherCoursesError.message}`
      );
    }
    console.log(
      `✅ Inserted ${seedData.teacherCourses.length} teacher-course relationships`
    );

    // Insert attendance records
    console.log("📊 Inserting attendance records...");
    const { error: attendanceError } = await supabase
      .from("attendance")
      .insert(seedData.attendance);

    if (attendanceError) {
      throw new Error(
        `Failed to insert attendance records: ${attendanceError.message}`
      );
    }
    console.log(`✅ Inserted ${seedData.attendance.length} attendance records`);

    // Insert timetable
    console.log("📅 Inserting timetable...");
    const { error: timetableError } = await supabase
      .from("timetable")
      .insert(seedData.timetable);

    if (timetableError) {
      throw new Error(`Failed to insert timetable: ${timetableError.message}`);
    }
    console.log(`✅ Inserted ${seedData.timetable.length} timetable entries`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`- Students: ${seedData.students.length}`);
    console.log(`- Teachers: ${seedData.teachers.length}`);
    console.log(`- Courses: ${seedData.courses.length}`);
    console.log(
      `- Student-Course relationships: ${seedData.studentCourses.length}`
    );
    console.log(
      `- Teacher-Course relationships: ${seedData.teacherCourses.length}`
    );
    console.log(`- Attendance records: ${seedData.attendance.length}`);
    console.log(`- Timetable entries: ${seedData.timetable.length}`);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
