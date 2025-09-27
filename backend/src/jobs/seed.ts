import bcrypt from "bcryptjs";
import { supabase } from "../config";
import { JwtService } from "../services/jwt.service";

interface SeedData {
  users: any[];
  courses: any[];
  lectures: any[];
  schedules: any[];
  notifications: any[];
}

const seedData: SeedData = {
  users: [
    // Admin users
    {
      name: "Admin User",
      email: "admin@campus.edu",
      password: "admin123",
      role: "admin",
      courses: [],
      metadata: { department: "IT" },
    },

    // Teachers
    {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@campus.edu",
      password: "teacher123",
      role: "teacher",
      courses: ["course-1", "course-2"],
      metadata: { department: "Computer Science", specialization: "AI/ML" },
    },
    {
      name: "Prof. Michael Chen",
      email: "michael.chen@campus.edu",
      password: "teacher123",
      role: "teacher",
      courses: ["course-3", "course-4"],
      metadata: { department: "Mathematics", specialization: "Statistics" },
    },
    {
      name: "Dr. Emily Rodriguez",
      email: "emily.rodriguez@campus.edu",
      password: "teacher123",
      role: "teacher",
      courses: ["course-5"],
      metadata: { department: "Physics", specialization: "Quantum Physics" },
    },
    {
      name: "Prof. David Wilson",
      email: "david.wilson@campus.edu",
      password: "teacher123",
      role: "teacher",
      courses: ["course-6"],
      metadata: {
        department: "Engineering",
        specialization: "Software Engineering",
      },
    },
    {
      name: "Dr. Lisa Brown",
      email: "lisa.brown@campus.edu",
      password: "teacher123",
      role: "teacher",
      courses: ["course-7"],
      metadata: {
        department: "Chemistry",
        specialization: "Organic Chemistry",
      },
    },

    // Students
    {
      name: "John Doe",
      email: "john.doe@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-1", "course-3"],
      attendance_rate: 85,
      metadata: { year: "Sophomore", major: "Computer Science" },
    },
    {
      name: "Jane Smith",
      email: "jane.smith@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-1", "course-2", "course-5"],
      attendance_rate: 92,
      metadata: { year: "Junior", major: "Physics" },
    },
    {
      name: "Alex Johnson",
      email: "alex.johnson@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-2", "course-4"],
      attendance_rate: 78,
      metadata: { year: "Freshman", major: "Mathematics" },
    },
    {
      name: "Maria Garcia",
      email: "maria.garcia@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-3", "course-6"],
      attendance_rate: 65,
      metadata: { year: "Senior", major: "Engineering" },
    },
    {
      name: "David Lee",
      email: "david.lee@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-4", "course-7"],
      attendance_rate: 88,
      metadata: { year: "Sophomore", major: "Chemistry" },
    },
    {
      name: "Sarah Williams",
      email: "sarah.williams@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-1", "course-5"],
      attendance_rate: 95,
      metadata: { year: "Junior", major: "Computer Science" },
    },
    {
      name: "Michael Brown",
      email: "michael.brown@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-2", "course-6"],
      attendance_rate: 72,
      metadata: { year: "Freshman", major: "Engineering" },
    },
    {
      name: "Emma Davis",
      email: "emma.davis@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-3", "course-7"],
      attendance_rate: 81,
      metadata: { year: "Senior", major: "Chemistry" },
    },
    {
      name: "James Wilson",
      email: "james.wilson@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-4", "course-5"],
      attendance_rate: 69,
      metadata: { year: "Sophomore", major: "Physics" },
    },
    {
      name: "Olivia Miller",
      email: "olivia.miller@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-1", "course-6"],
      attendance_rate: 91,
      metadata: { year: "Junior", major: "Computer Science" },
    },
    {
      name: "William Taylor",
      email: "william.taylor@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-2", "course-7"],
      attendance_rate: 83,
      metadata: { year: "Freshman", major: "Mathematics" },
    },
    {
      name: "Ava Anderson",
      email: "ava.anderson@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-3", "course-5"],
      attendance_rate: 76,
      metadata: { year: "Senior", major: "Physics" },
    },
    {
      name: "Noah Thomas",
      email: "noah.thomas@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-4", "course-6"],
      attendance_rate: 87,
      metadata: { year: "Sophomore", major: "Engineering" },
    },
    {
      name: "Sophia Jackson",
      email: "sophia.jackson@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-1", "course-7"],
      attendance_rate: 94,
      metadata: { year: "Junior", major: "Chemistry" },
    },
    {
      name: "Liam White",
      email: "liam.white@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-2", "course-5"],
      attendance_rate: 79,
      metadata: { year: "Freshman", major: "Computer Science" },
    },
    {
      name: "Isabella Harris",
      email: "isabella.harris@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-3", "course-6"],
      attendance_rate: 86,
      metadata: { year: "Senior", major: "Mathematics" },
    },
    {
      name: "Mason Martin",
      email: "mason.martin@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-4", "course-7"],
      attendance_rate: 73,
      metadata: { year: "Sophomore", major: "Physics" },
    },
    {
      name: "Charlotte Thompson",
      email: "charlotte.thompson@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-1", "course-5"],
      attendance_rate: 90,
      metadata: { year: "Junior", major: "Engineering" },
    },
    {
      name: "Benjamin Garcia",
      email: "benjamin.garcia@student.campus.edu",
      password: "student123",
      role: "student",
      courses: ["course-2", "course-6"],
      attendance_rate: 84,
      metadata: { year: "Freshman", major: "Chemistry" },
    },
  ],

  courses: [
    {
      id: "course-1",
      name: "Introduction to Computer Science",
      description: "Fundamental concepts in computer science and programming",
      teacher_id: "teacher-1",
      students: [
        "student-1",
        "student-2",
        "student-6",
        "student-10",
        "student-13",
        "student-16",
        "student-19",
      ],
      schedule: "MWF 10:00-11:00",
      room: "CS-101",
    },
    {
      id: "course-2",
      name: "Data Structures and Algorithms",
      description: "Advanced data structures and algorithmic problem solving",
      teacher_id: "teacher-1",
      students: [
        "student-2",
        "student-3",
        "student-7",
        "student-11",
        "student-14",
        "student-17",
        "student-20",
      ],
      schedule: "TTH 14:00-15:30",
      room: "CS-102",
    },
    {
      id: "course-3",
      name: "Calculus I",
      description: "Differential and integral calculus",
      teacher_id: "teacher-2",
      students: [
        "student-1",
        "student-4",
        "student-8",
        "student-12",
        "student-15",
        "student-18",
        "student-21",
      ],
      schedule: "MWF 09:00-10:00",
      room: "MATH-201",
    },
    {
      id: "course-4",
      name: "Statistics and Probability",
      description: "Statistical methods and probability theory",
      teacher_id: "teacher-2",
      students: [
        "student-3",
        "student-5",
        "student-9",
        "student-13",
        "student-16",
        "student-19",
        "student-22",
      ],
      schedule: "TTH 11:00-12:30",
      room: "MATH-202",
    },
    {
      id: "course-5",
      name: "Quantum Physics",
      description: "Introduction to quantum mechanics",
      teacher_id: "teacher-3",
      students: [
        "student-2",
        "student-6",
        "student-10",
        "student-14",
        "student-17",
        "student-20",
      ],
      schedule: "MW 15:00-16:30",
      room: "PHYS-301",
    },
    {
      id: "course-6",
      name: "Software Engineering",
      description: "Software development methodologies and practices",
      teacher_id: "teacher-4",
      students: [
        "student-4",
        "student-8",
        "student-12",
        "student-16",
        "student-19",
        "student-22",
      ],
      schedule: "TTH 10:00-11:30",
      room: "ENG-401",
    },
    {
      id: "course-7",
      name: "Organic Chemistry",
      description: "Structure and reactions of organic compounds",
      teacher_id: "teacher-5",
      students: [
        "student-5",
        "student-9",
        "student-13",
        "student-17",
        "student-20",
      ],
      schedule: "MWF 13:00-14:00",
      room: "CHEM-501",
    },
  ],

  lectures: [
    {
      course_id: "course-1",
      teacher_id: "teacher-1",
      date: "2024-01-15",
      recording_url: "https://example.com/recordings/lecture-1.mp4",
      transcript:
        "Today we will be discussing the fundamentals of computer science, including algorithms, data structures, and computational thinking. We will start with basic programming concepts and move towards more complex topics.",
    },
    {
      course_id: "course-1",
      teacher_id: "teacher-1",
      date: "2024-01-17",
      recording_url: "https://example.com/recordings/lecture-2.mp4",
      transcript:
        "In this lecture, we will explore different programming paradigms and their applications. We will cover procedural, object-oriented, and functional programming approaches.",
    },
    {
      course_id: "course-2",
      teacher_id: "teacher-1",
      date: "2024-01-16",
      recording_url: "https://example.com/recordings/lecture-3.mp4",
      transcript:
        "Data structures are fundamental to computer science. Today we will learn about arrays, linked lists, stacks, and queues, and their time and space complexities.",
    },
    {
      course_id: "course-3",
      teacher_id: "teacher-2",
      date: "2024-01-15",
      recording_url: "https://example.com/recordings/lecture-4.mp4",
      transcript:
        "Calculus is the mathematical study of continuous change. We will begin with limits and continuity, which are the foundation of differential calculus.",
    },
    {
      course_id: "course-4",
      teacher_id: "teacher-2",
      date: "2024-01-16",
      recording_url: "https://example.com/recordings/lecture-5.mp4",
      transcript:
        "Statistics helps us make sense of data. Today we will cover descriptive statistics, including measures of central tendency and variability.",
    },
    {
      course_id: "course-5",
      teacher_id: "teacher-3",
      date: "2024-01-17",
      recording_url: "https://example.com/recordings/lecture-6.mp4",
      transcript:
        "Quantum physics revolutionized our understanding of the microscopic world. We will start with the wave-particle duality and the uncertainty principle.",
    },
    {
      course_id: "course-6",
      teacher_id: "teacher-4",
      date: "2024-01-16",
      recording_url: "https://example.com/recordings/lecture-7.mp4",
      transcript:
        "Software engineering is the systematic approach to designing, developing, and maintaining software systems. We will cover the software development lifecycle.",
    },
    {
      course_id: "course-7",
      teacher_id: "teacher-5",
      date: "2024-01-15",
      recording_url: "https://example.com/recordings/lecture-8.mp4",
      transcript:
        "Organic chemistry is the study of carbon-containing compounds. We will start with the basics of molecular structure and bonding.",
    },
    {
      course_id: "course-1",
      teacher_id: "teacher-1",
      date: "2024-01-19",
      recording_url: "https://example.com/recordings/lecture-9.mp4",
      transcript:
        "Today we will discuss recursion and its applications in problem-solving. We will also cover common recursive algorithms and their implementations.",
    },
    {
      course_id: "course-2",
      teacher_id: "teacher-1",
      date: "2024-01-18",
      recording_url: "https://example.com/recordings/lecture-10.mp4",
      transcript:
        "Advanced data structures include trees, graphs, and hash tables. These structures are essential for efficient algorithm design and implementation.",
    },
  ],

  schedules: [
    {
      date: "2024-01-15",
      start_time: "10:00",
      end_time: "11:00",
      room: "CS-101",
      course_id: "course-1",
      teacher_id: "teacher-1",
    },
    {
      date: "2024-01-15",
      start_time: "09:00",
      end_time: "10:00",
      room: "MATH-201",
      course_id: "course-3",
      teacher_id: "teacher-2",
    },
    {
      date: "2024-01-15",
      start_time: "13:00",
      end_time: "14:00",
      room: "CHEM-501",
      course_id: "course-7",
      teacher_id: "teacher-5",
    },
    {
      date: "2024-01-16",
      start_time: "14:00",
      end_time: "15:30",
      room: "CS-102",
      course_id: "course-2",
      teacher_id: "teacher-1",
    },
    {
      date: "2024-01-16",
      start_time: "11:00",
      end_time: "12:30",
      room: "MATH-202",
      course_id: "course-4",
      teacher_id: "teacher-2",
    },
    {
      date: "2024-01-16",
      start_time: "10:00",
      end_time: "11:30",
      room: "ENG-401",
      course_id: "course-6",
      teacher_id: "teacher-4",
    },
  ],

  notifications: [
    {
      title: "Welcome to Campus Digitization Platform",
      body: "Welcome to our new campus digitization platform! You can now access all your academic resources in one place.",
      recipient_id: "all",
      read_by: [],
      link: "/dashboard",
    },
    {
      title: "Assignment Due Tomorrow",
      body: "Your Computer Science assignment is due tomorrow. Please submit it through the online portal.",
      recipient_id: "student-1",
      read_by: [],
      link: "/assignments",
    },
    {
      title: "New Lecture Recording Available",
      body: "The recording for today's Mathematics lecture is now available for review.",
      recipient_id: "student-3",
      read_by: [],
      link: "/lectures",
    },
  ],
};

async function hashPasswords(): Promise<void> {
  console.log("Hashing passwords...");

  for (const user of seedData.users) {
    user.password_hash = await bcrypt.hash(user.password, 12);
    delete user.password;
  }
}

async function createUsers(): Promise<Map<string, string>> {
  console.log("Creating users...");

  const userIdMap = new Map<string, string>();

  for (const userData of seedData.users) {
    const { data: user, error } = await supabase
      .from("users")
      .insert(userData)
      .select()
      .single();

    if (error) {
      console.error(`Error creating user ${userData.email}:`, error);
      continue;
    }

    // Map original user data to new user ID
    const originalEmail = userData.email;
    if (originalEmail.includes("admin@campus.edu")) {
      userIdMap.set("admin-1", user.id);
    } else if (originalEmail.includes("sarah.johnson@campus.edu")) {
      userIdMap.set("teacher-1", user.id);
    } else if (originalEmail.includes("michael.chen@campus.edu")) {
      userIdMap.set("teacher-2", user.id);
    } else if (originalEmail.includes("emily.rodriguez@campus.edu")) {
      userIdMap.set("teacher-3", user.id);
    } else if (originalEmail.includes("david.wilson@campus.edu")) {
      userIdMap.set("teacher-4", user.id);
    } else if (originalEmail.includes("lisa.brown@campus.edu")) {
      userIdMap.set("teacher-5", user.id);
    } else {
      // Student mapping
      const studentIndex =
        seedData.users.findIndex((u) => u.email === originalEmail) - 6; // Subtract admin + teachers
      if (studentIndex >= 0) {
        userIdMap.set(`student-${studentIndex + 1}`, user.id);
      }
    }
  }

  return userIdMap;
}

async function createCourses(userIdMap: Map<string, string>): Promise<void> {
  console.log("Creating courses...");

  for (const courseData of seedData.courses) {
    // Update course data with real user IDs
    const updatedCourse = {
      ...courseData,
      teacher_id: userIdMap.get(courseData.teacher_id),
      students: courseData.students
        .map((studentId: string) => userIdMap.get(studentId))
        .filter(Boolean),
    };

    const { error } = await supabase.from("courses").insert(updatedCourse);

    if (error) {
      console.error(`Error creating course ${courseData.name}:`, error);
    }
  }
}

async function createLectures(userIdMap: Map<string, string>): Promise<void> {
  console.log("Creating lectures...");

  for (const lectureData of seedData.lectures) {
    const updatedLecture = {
      ...lectureData,
      teacher_id: userIdMap.get(lectureData.teacher_id),
    };

    const { error } = await supabase.from("lectures").insert(updatedLecture);

    if (error) {
      console.error(`Error creating lecture:`, error);
    }
  }
}

async function createSchedules(userIdMap: Map<string, string>): Promise<void> {
  console.log("Creating schedules...");

  for (const scheduleData of seedData.schedules) {
    const updatedSchedule = {
      ...scheduleData,
      teacher_id: userIdMap.get(scheduleData.teacher_id),
    };

    const { error } = await supabase.from("schedules").insert(updatedSchedule);

    if (error) {
      console.error(`Error creating schedule:`, error);
    }
  }
}

async function createNotifications(
  userIdMap: Map<string, string>
): Promise<void> {
  console.log("Creating notifications...");

  for (const notificationData of seedData.notifications) {
    const updatedNotification = {
      ...notificationData,
      recipient_id:
        notificationData.recipient_id === "all"
          ? "all"
          : userIdMap.get(notificationData.recipient_id),
    };

    const { error } = await supabase
      .from("notifications")
      .insert(updatedNotification);

    if (error) {
      console.error(`Error creating notification:`, error);
    }
  }
}

async function createAttendanceEvents(
  userIdMap: Map<string, string>
): Promise<void> {
  console.log("Creating attendance events...");

  // Create some sample attendance events
  const attendanceEvents = [
    {
      class_id: "course-1",
      timestamp: "2024-01-15T10:00:00Z",
      students: [
        { user_id: userIdMap.get("student-1"), status: "present" },
        { user_id: userIdMap.get("student-2"), status: "present" },
        { user_id: userIdMap.get("student-6"), status: "late" },
        { user_id: userIdMap.get("student-10"), status: "present" },
        { user_id: userIdMap.get("student-13"), status: "absent" },
        { user_id: userIdMap.get("student-16"), status: "present" },
        { user_id: userIdMap.get("student-19"), status: "present" },
      ],
      recorded_by: userIdMap.get("teacher-1"),
    },
    {
      class_id: "course-2",
      timestamp: "2024-01-16T14:00:00Z",
      students: [
        { user_id: userIdMap.get("student-2"), status: "present" },
        { user_id: userIdMap.get("student-3"), status: "present" },
        { user_id: userIdMap.get("student-7"), status: "present" },
        { user_id: userIdMap.get("student-11"), status: "absent" },
        { user_id: userIdMap.get("student-14"), status: "present" },
        { user_id: userIdMap.get("student-17"), status: "late" },
        { user_id: userIdMap.get("student-20"), status: "present" },
      ],
      recorded_by: userIdMap.get("teacher-1"),
    },
  ];

  for (const event of attendanceEvents) {
    const { error } = await supabase.from("attendance_events").insert(event);

    if (error) {
      console.error(`Error creating attendance event:`, error);
    }
  }
}

async function seedDatabase(): Promise<void> {
  try {
    console.log("🌱 Starting database seeding...");

    // Hash passwords first
    await hashPasswords();

    // Create users and get ID mapping
    const userIdMap = await createUsers();

    // Create other entities with proper user ID references
    await createCourses(userIdMap);
    await createLectures(userIdMap);
    await createSchedules(userIdMap);
    await createNotifications(userIdMap);
    await createAttendanceEvents(userIdMap);

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📋 Created:");
    console.log(
      `- ${seedData.users.length} users (1 admin, 5 teachers, ${
        seedData.users.length - 6
      } students)`
    );
    console.log(`- ${seedData.courses.length} courses`);
    console.log(`- ${seedData.lectures.length} lectures`);
    console.log(`- ${seedData.schedules.length} schedules`);
    console.log(`- ${seedData.notifications.length} notifications`);
    console.log("- Sample attendance events");

    console.log("\n🔑 Test Credentials:");
    console.log("Admin: admin@campus.edu / admin123");
    console.log("Teacher: sarah.johnson@campus.edu / teacher123");
    console.log("Student: john.doe@student.campus.edu / student123");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };
