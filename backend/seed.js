require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Course = require('./models/Course');
const Post = require('./models/Post');
const ChatRoom = require('./models/ChatRoom');
const Message = require('./models/Message');
const Assignment = require('./models/Assignment');
const Submission = require('./models/Submission');
const zoomService = require('./services/zoomService');

// Helper function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Helper to get random items from array
const getRandomItems = (array, count) => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('📊 Connected to MongoDB. Starting seed...\n');

    // ============================================
    // PHASE 1: CLEAR EXISTING DATA
    // ============================================
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Post.deleteMany({});
    await ChatRoom.deleteMany({});
    await Message.deleteMany({});
    await Assignment.deleteMany({});
    await Submission.deleteMany({});
    console.log('✅ Existing data cleared\n');
    
    // Wait to ensure deletion is complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = new Date();
    const hashedPassword = await hashPassword('password123');

    // ============================================
    // PHASE 2: CREATE USERS (21 TOTAL)
    // ============================================
    console.log('👥 Creating users...');
    
    // Create ALL users at once using insertMany to avoid double hashing
    const allUsers = await User.insertMany([
      // 1. Super Admin
      {
        name: 'Emmanuel Okafor',
        email: 'superadmin@emmidevcode.com',
        passwordHash: hashedPassword,
        role: 'superadmin',
        bio: 'Platform Super Administrator with full access',
        avatarUrl: 'https://ui-avatars.com/api/?name=Emmanuel+Okafor&background=DC2626&color=fff',
        isActive: true,
        emailVerified: true
      },
      // 2. Two Admins
      {
        name: 'Chioma Adeleke',
        email: 'chioma@emmidevcode.com',
        passwordHash: hashedPassword,
        role: 'admin',
        bio: 'Content Moderator & Support Lead',
        avatarUrl: 'https://ui-avatars.com/api/?name=Chioma+Adeleke&background=7C3AED&color=fff',
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Ibrahim Hassan',
        email: 'ibrahim@emmidevcode.com',
        passwordHash: hashedPassword,
        role: 'admin',
        bio: 'Quality Assurance & Course Reviewer',
        avatarUrl: 'https://ui-avatars.com/api/?name=Ibrahim+Hassan&background=0891B2&color=fff',
        isActive: true,
        emailVerified: true
      },
      // 3. Four Tutors
      {
        name: 'Chinedu Okonkwo',
        email: 'chinedu@emmidevcode.com',
        passwordHash: hashedPassword,
        role: 'tutor',
        bio: 'Senior Backend Developer with 8+ years experience. Specialized in Node.js, Python, and cloud architecture.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Chinedu+Okonkwo&background=3B82F6&color=fff',
        verifiedTutor: true,
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Aisha Bello',
        email: 'aisha@emmidevcode.com',
        passwordHash: hashedPassword,
        role: 'tutor',
        bio: 'Frontend Expert & UI/UX Enthusiast. Passionate about React, Vue, and modern web design.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Aisha+Bello&background=EC4899&color=fff',
        verifiedTutor: true,
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Emeka Nwankwo',
        email: 'emeka@emmidevcode.com',
        passwordHash: hashedPassword,
        role: 'tutor',
        bio: 'Full-Stack Developer & Mobile App Specialist. Building scalable applications since 2015.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Emeka+Nwankwo&background=F59E0B&color=fff',
        verifiedTutor: true,
        isActive: true,
        emailVerified: true
      },
      {
        name: 'Fatima Abdullahi',
        email: 'fatima@emmidevcode.com',
        passwordHash: hashedPassword,
        role: 'tutor',
        bio: 'DevOps Engineer & Cloud Architect. Helping developers deploy with confidence.',
        avatarUrl: 'https://ui-avatars.com/api/?name=Fatima+Abdullahi&background=10B981&color=fff',
        verifiedTutor: true,
        isActive: true,
        emailVerified: true
      },
      // 4. Fourteen Students
      {
        name: 'Oluwaseun Adeyemi',
        email: 'seun@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Aspiring full-stack developer from Lagos',
        avatarUrl: 'https://ui-avatars.com/api/?name=Oluwaseun+Adeyemi&background=6366F1&color=fff',
        emailVerified: true
      },
      {
        name: 'Ngozi Okafor',
        email: 'ngozi@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Career switcher learning web development',
        avatarUrl: 'https://ui-avatars.com/api/?name=Ngozi+Okafor&background=8B5CF6&color=fff',
        emailVerified: true
      },
      {
        name: 'Yusuf Mohammed',
        email: 'yusuf@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Computer Science student from Kano',
        avatarUrl: 'https://ui-avatars.com/api/?name=Yusuf+Mohammed&background=EF4444&color=fff',
        emailVerified: true
      },
      {
        name: 'Blessing Okoro',
        email: 'blessing@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Frontend enthusiast from Port Harcourt',
        avatarUrl: 'https://ui-avatars.com/api/?name=Blessing+Okoro&background=F59E0B&color=fff',
        emailVerified: true
      },
      {
        name: 'Tunde Bakare',
        email: 'tunde@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Backend developer in training',
        avatarUrl: 'https://ui-avatars.com/api/?name=Tunde+Bakare&background=06B6D4&color=fff',
        emailVerified: true
      },
      {
        name: 'Amina Yusuf',
        email: 'amina@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Mobile app development student from Abuja',
        avatarUrl: 'https://ui-avatars.com/api/?name=Amina+Yusuf&background=EC4899&color=fff',
        emailVerified: true
      },
      {
        name: 'Chukwudi Eze',
        email: 'chukwudi@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Learning DevOps and cloud technologies',
        avatarUrl: 'https://ui-avatars.com/api/?name=Chukwudi+Eze&background=10B981&color=fff',
        emailVerified: true
      },
      {
        name: 'Zainab Ibrahim',
        email: 'zainab@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Passionate about React and modern web',
        avatarUrl: 'https://ui-avatars.com/api/?name=Zainab+Ibrahim&background=8B5CF6&color=fff',
        emailVerified: true
      },
      {
        name: 'Kunle Ajayi',
        email: 'kunle@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Full-stack development journey',
        avatarUrl: 'https://ui-avatars.com/api/?name=Kunle+Ajayi&background=3B82F6&color=fff',
        emailVerified: true
      },
      {
        name: 'Adaobi Nnamdi',
        email: 'adaobi@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'UI/UX designer learning to code',
        avatarUrl: 'https://ui-avatars.com/api/?name=Adaobi+Nnamdi&background=F43F5E&color=fff',
        emailVerified: true
      },
      {
        name: 'Musa Garba',
        email: 'musa@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Python and data science enthusiast',
        avatarUrl: 'https://ui-avatars.com/api/?name=Musa+Garba&background=14B8A6&color=fff',
        emailVerified: true
      },
      {
        name: 'Chiamaka Obi',
        email: 'chiamaka@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Learning web development from Enugu',
        avatarUrl: 'https://ui-avatars.com/api/?name=Chiamaka+Obi&background=A855F7&color=fff',
        emailVerified: true
      },
      {
        name: 'Abdullahi Sani',
        email: 'abdullahi@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Software engineering student',
        avatarUrl: 'https://ui-avatars.com/api/?name=Abdullahi+Sani&background=F97316&color=fff',
        emailVerified: true
      },
      {
        name: 'Nneka Onyeka',
        email: 'nneka@student.com',
        passwordHash: hashedPassword,
        role: 'student',
        bio: 'Aspiring mobile developer from Calabar',
        avatarUrl: 'https://ui-avatars.com/api/?name=Nneka+Onyeka&background=6366F1&color=fff',
        emailVerified: true
      }
    ]);

    // Extract references
    const superadmin = allUsers[0];
    const admin1 = allUsers[1];
    const admin2 = allUsers[2];
    const tutors = allUsers.slice(3, 7); // indices 3-6
    const students = allUsers.slice(7);  // indices 7-20

    console.log('✅ Super Admin created:', superadmin.email);
    console.log('✅ 2 Admins created');
    console.log('✅ 4 Tutors created');
    console.log('✅ 14 Students created');
    console.log(`\n📊 Total Users: ${allUsers.length}\n`);

    // ============================================
    // PHASE 3: CREATE 8 COURSES
    // ============================================
    console.log('📚 Creating 8 courses...\n');

    const coursesData = [
      // ...existing code...
      // Tutor 1 (Chinedu - Backend Specialist) - 2 courses
      {
        title: 'Node.js Backend Masterclass',
        description: 'Master backend development with Node.js, Express, and MongoDB. Build RESTful APIs, authentication systems, and deploy to production.',
        tutorId: tutors[0]._id,
        price: 45000,
        currency: 'NGN',
        category: 'Web Development',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
        maxStudents: 50,
        syllabus: [
          { title: 'Introduction to Node.js', description: 'Event Loop, NPM, Modules', order: 1 },
          { title: 'Express Framework', description: 'Routing, Middleware, RESTful APIs', order: 2 },
          { title: 'MongoDB Integration', description: 'Mongoose, CRUD Operations', order: 3 },
          { title: 'Authentication & Authorization', description: 'JWT, Passport.js, OAuth', order: 4 }
        ],
        tags: ['nodejs', 'backend', 'express', 'mongodb', 'api'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin1._id,
        approvedAt: new Date()
      },
      {
        title: 'Python Backend Development',
        description: 'Learn backend development with Python, Django, and PostgreSQL. Build scalable web applications from scratch.',
        tutorId: tutors[0]._id,
        price: 50000,
        currency: 'NGN',
        category: 'Web Development',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800',
        maxStudents: 40,
        syllabus: [
          { title: 'Python Fundamentals', description: 'Syntax, Data Structures, OOP', order: 1 },
          { title: 'Django Framework', description: 'MVT Pattern, ORM, Templates', order: 2 },
          { title: 'REST APIs with Django', description: 'Django REST Framework', order: 3 }
        ],
        tags: ['python', 'django', 'backend', 'postgresql'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin1._id,
        approvedAt: new Date()
      },
      {
        title: 'Modern React Development',
        description: 'Master React 18 with hooks, context, Redux Toolkit, and build production-ready applications.',
        tutorId: tutors[1]._id,
        price: 40000,
        currency: 'NGN',
        category: 'Web Development',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
        maxStudents: 60,
        syllabus: [
          { title: 'React Fundamentals', description: 'JSX, Components, Props, State', order: 1 },
          { title: 'React Hooks', description: 'useState, useEffect, Custom Hooks', order: 2 },
          { title: 'State Management', description: 'Redux Toolkit, RTK Query', order: 3 }
        ],
        tags: ['react', 'frontend', 'javascript', 'redux'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin2._id,
        approvedAt: new Date()
      },
      {
        title: 'Vue.js Complete Guide',
        description: 'Learn Vue 3 Composition API, Vuex, Vue Router, and build modern SPAs.',
        tutorId: tutors[1]._id,
        price: 38000,
        currency: 'NGN',
        category: 'Web Development',
        level: 'Beginner',
        thumbnail: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=800',
        maxStudents: 45,
        syllabus: [
          { title: 'Vue.js Basics', description: 'Reactivity, Templates, Directives', order: 1 },
          { title: 'Composition API', description: 'ref, reactive, computed, watch', order: 2 },
          { title: 'Routing & State', description: 'Vue Router, Vuex, Pinia', order: 3 }
        ],
        tags: ['vue', 'frontend', 'javascript', 'spa'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin2._id,
        approvedAt: new Date()
      },
      {
        title: 'MERN Stack Bootcamp',
        description: 'Build full-stack applications with MongoDB, Express, React, and Node.js. From zero to deployed!',
        tutorId: tutors[2]._id,
        price: 75000,
        currency: 'NGN',
        category: 'Web Development',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
        maxStudents: 35,
        syllabus: [
          { title: 'Frontend with React', description: 'React Basics, Redux, API Integration', order: 1 },
          { title: 'Backend with Node.js', description: 'Express, MongoDB, Authentication', order: 2 },
          { title: 'Real-time Features', description: 'Socket.io, Chat Apps', order: 3 },
          { title: 'Deployment', description: 'Vercel, Render, Environment Setup', order: 4 }
        ],
        tags: ['mern', 'fullstack', 'react', 'nodejs', 'mongodb'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin1._id,
        approvedAt: new Date()
      },
      {
        title: 'Django Full-Stack Development',
        description: 'Build complete web applications with Django, PostgreSQL, and deploy to production.',
        tutorId: tutors[2]._id,
        price: 65000,
        currency: 'NGN',
        category: 'Web Development',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800',
        maxStudents: 30,
        syllabus: [
          { title: 'Django Fundamentals', description: 'MVT, Models, Views, Templates', order: 1 },
          { title: 'Advanced Django', description: 'Class-based Views, Forms, Admin', order: 2 },
          { title: 'REST APIs', description: 'DRF, Authentication, Permissions', order: 3 }
        ],
        tags: ['django', 'python', 'fullstack', 'postgresql'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin1._id,
        approvedAt: new Date()
      },
      {
        title: 'React Native Mobile Development',
        description: 'Build cross-platform mobile apps with React Native. One codebase, iOS & Android.',
        tutorId: tutors[2]._id,
        price: 55000,
        currency: 'NGN',
        category: 'Mobile Development',
        level: 'Intermediate',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
        maxStudents: 40,
        syllabus: [
          { title: 'React Native Basics', description: 'Components, Navigation, Styling', order: 1 },
          { title: 'Native Features', description: 'Camera, Location, Push Notifications', order: 2 },
          { title: 'State & API', description: 'Redux, API Calls, AsyncStorage', order: 3 }
        ],
        tags: ['react-native', 'mobile', 'ios', 'android'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin2._id,
        approvedAt: new Date()
      },
      {
        title: 'DevOps & Cloud Deployment',
        description: 'Master Docker, Kubernetes, CI/CD pipelines, and deploy applications to AWS.',
        tutorId: tutors[3]._id,
        price: 60000,
        currency: 'NGN',
        category: 'Data Science',
        level: 'Advanced',
        thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
        maxStudents: 30,
        syllabus: [
          { title: 'Docker Fundamentals', description: 'Containers, Images, Docker Compose', order: 1 },
          { title: 'Kubernetes', description: 'Pods, Services, Deployments, Helm', order: 2 },
          { title: 'CI/CD Pipelines', description: 'GitHub Actions, Jenkins', order: 3 },
          { title: 'Cloud Deployment', description: 'AWS EC2, S3, RDS', order: 4 }
        ],
        tags: ['devops', 'docker', 'kubernetes', 'aws', 'cicd'],
        isPublished: true,
        isApproved: true,
        approvedBy: admin1._id,
        approvedAt: new Date()
      }
    ];

    const courses = [];
    for (const courseData of coursesData) {
      const course = await Course.create(courseData);
      courses.push(course);
      console.log(`  ✅ Created: ${course.title}`);
    }
    console.log(`\n✅ ${courses.length} courses created\n`);

    // ...rest of your code remains the same...
    // (Continue with PHASE 4, 5, 6, 7 as is)

    // ============================================
    // PHASE 4: CREATE GROUP CHATS FOR COURSES
    // ============================================
    console.log('💬 Creating group chats for courses...\n');

    const chatRooms = [];
    for (const course of courses) {
      const chatRoom = await ChatRoom.create({
        name: `${course.title} - Class Discussion`,
        type: 'course',
        courseId: course._id,
        participants: [
          { userId: course.tutorId, role: 'admin', joinedAt: new Date() }
        ]
      });

      course.groupId = chatRoom._id;
      await course.save();

      chatRooms.push(chatRoom);
      console.log(`  ✅ Chat room created for: ${course.title}`);
    }
    console.log(`\n✅ ${chatRooms.length} chat rooms created\n`);

    // ============================================
    // PHASE 5: ENROLL STUDENTS IN COURSES
    // ============================================
    console.log('📝 Enrolling students in courses...\n');

    let totalEnrollments = 0;
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const chatRoom = chatRooms[i];
      
      const enrollCount = Math.floor(Math.random() * 4) + 5;
      const enrolledStudents = getRandomItems(students, enrollCount);

      for (const student of enrolledStudents) {
        const progress = Math.floor(Math.random() * 76);
        
        course.enrolledStudents.push({
          studentId: student._id,
          enrolledAt: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000),
          progress
        });

        chatRoom.participants.push({
          userId: student._id,
          role: 'member',
          joinedAt: new Date(now.getTime() - Math.random() * 14 * 24 * 60 * 60 * 1000)
        });

        await User.findByIdAndUpdate(student._id, {
          $addToSet: { enrolledCourses: course._id }
        });

        totalEnrollments++;
      }

      await course.save();
      await chatRoom.save();
      
      console.log(`  ✅ ${enrolledStudents.length} students enrolled in: ${course.title}`);
    }
    console.log(`\n✅ Total enrollments: ${totalEnrollments}\n`);

    // ============================================
    // PHASE 6: CREATE CHAT MESSAGES
    // ============================================
    console.log('💬 Creating chat messages...\n');

    const welcomeMessages = [
      "Welcome everyone! Excited to start this learning journey together! 🎉",
      "Hi all! Looking forward to learning with everyone here.",
      "Hello! Can't wait to get started with the course.",
      "Greetings! Happy to be part of this class.",
      "Hey everyone! Let's do this! 💪"
    ];

    const studentQuestions = [
      "What IDE do you recommend for this course?",
      "Are the class recordings available?",
      "How much time should I dedicate weekly?",
      "Any recommended resources to supplement the course?",
      "Will we have group projects?"
    ];

    const tutorResponses = [
      "Great question! I'll cover that in our next session.",
      "Yes, all sessions are recorded and available 24 hours after class.",
      "I recommend 5-10 hours per week for practice.",
      "Check the resources section - I've added helpful links!",
      "Absolutely! We'll have both individual and group projects."
    ];

    let totalMessages = 0;
    for (let i = 0; i < chatRooms.length; i++) {
      const chatRoom = chatRooms[i];
      const course = courses[i];
      const tutor = await User.findById(course.tutorId);
      const enrolledStudentIds = course.enrolledStudents.map(e => e.studentId);
      const enrolledStudentDocs = await User.find({ _id: { $in: enrolledStudentIds } });

      await Message.create({
        roomId: chatRoom._id.toString(),
        from: tutor._id,
        message: `Welcome to ${course.title}! 🎉 I'm ${tutor.name}, and I'm excited to guide you through this course. Our first session is coming up soon. Feel free to introduce yourselves!`,
        type: 'text',
        createdAt: new Date(now.getTime() - 13 * 24 * 60 * 60 * 1000)
      });
      totalMessages++;

      const introCount = Math.min(enrolledStudentDocs.length, 5);
      for (let j = 0; j < introCount; j++) {
        const student = enrolledStudentDocs[j];
        await Message.create({
          roomId: chatRoom._id.toString(),
          from: student._id,
          message: welcomeMessages[j % welcomeMessages.length],
          type: 'text',
          createdAt: new Date(now.getTime() - (12 - j) * 24 * 60 * 60 * 1000)
        });
        totalMessages++;
      }

      for (let q = 0; q < 3; q++) {
        const randomStudent = enrolledStudentDocs[Math.floor(Math.random() * enrolledStudentDocs.length)];
        
        await Message.create({
          roomId: chatRoom._id.toString(),
          from: randomStudent._id,
          message: studentQuestions[q % studentQuestions.length],
          type: 'text',
          createdAt: new Date(now.getTime() - (8 - q * 2) * 24 * 60 * 60 * 1000)
        });
        totalMessages++;

        await Message.create({
          roomId: chatRoom._id.toString(),
          from: tutor._id,
          message: tutorResponses[q % tutorResponses.length],
          type: 'text',
          createdAt: new Date(now.getTime() - (8 - q * 2 - 0.5) * 24 * 60 * 60 * 1000)
        });
        totalMessages++;
      }

      console.log(`  ✅ Messages created for: ${course.title}`);
    }
    console.log(`\n✅ Created ${totalMessages} chat messages\n`);

    // ============================================
    // PHASE 7: CREATE COMMUNITY POSTS
    // ============================================
    console.log('📝 Creating community posts...\n');

    await Post.insertMany([
      {
        authorId: tutors[0]._id,
        contentText: '🎉 Welcome to EmmiDev CodeBridge! Excited to share knowledge with amazing students. #coding #teaching',
        visibility: 'public',
        hashtags: ['coding', 'teaching'],
        likes: [tutors[1]._id, tutors[2]._id]
      },
      {
        authorId: tutors[1]._id,
        contentText: 'Just updated my React course with the latest features from React 18! 💻 #react #frontend',
        visibility: 'public',
        hashtags: ['react', 'frontend'],
        likes: [tutors[0]._id, tutors[3]._id]
      },
      {
        authorId: tutors[2]._id,
        contentText: 'Pro tip: Always start with the user experience, then build your backend around it. #fullstack #webdev',
        visibility: 'public',
        hashtags: ['fullstack', 'webdev'],
        likes: [tutors[0]._id, tutors[1]._id]
      }
    ]);

    const studentPosts = [];
    for (let i = 0; i < 8; i++) {
      const randomStudent = students[i];
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      
      const postTexts = [
        'Just completed my first project! The feeling is incredible 🚀',
        'Anyone want to form a study group? Looking for accountability partners 📚',
        'Finally understood how async/await works! Mind blown 🤯',
        'Deployed my first app to production today! Dreams do come true 🎉',
        'Looking for tips on debugging. Any recommendations?',
        'Finished the React module. Vue.js is next on my list! ⚛️',
        'Job hunting as a junior dev. Any advice from seniors?',
        'Built a to-do app and it actually works! Small wins matter 💪'
      ];

      studentPosts.push({
        authorId: randomStudent._id,
        contentText: postTexts[i],
        visibility: 'public',
        courseId: randomCourse._id,
        likes: getRandomItems(students, Math.floor(Math.random() * 5) + 2).map(s => s._id),
        comments: []
      });
    }
    await Post.insertMany(studentPosts);
    console.log('✅ Created 3 tutor posts and 8 student posts\n');

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('\n🎉 DATABASE SEEDING COMPLETE!\n');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    SEEDING SUMMARY                         ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n👥 USERS:');
    console.log(`   • Super Admin: 1`);
    console.log(`   • Admins: 2`);
    console.log(`   • Tutors: 4`);
    console.log(`   • Students: 14`);
    console.log(`   • Total: 21 users`);
    
    console.log('\n📚 COURSES:');
    console.log(`   • Total: 8 courses`);
    
    console.log('\n💬 GROUP CHATS:');
    console.log(`   • Total: 8 chat rooms`);
    console.log(`   • Total messages: ${totalMessages}`);
    
    console.log('\n📊 ENROLLMENTS:');
    console.log(`   • Total: ${totalEnrollments} enrollments`);
    
    console.log('\n📝 POSTS:');
    console.log(`   • Total: 11 community posts`);
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                   LOGIN CREDENTIALS                        ');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🔐 Password for all users: password123\n');
    
    console.log('👑 SUPER ADMIN:');
    console.log('   Email: superadmin@emmidevcode.com\n');
    
    console.log('🛡️  ADMINS:');
    console.log('   • chioma@emmidevcode.com');
    console.log('   • ibrahim@emmidevcode.com\n');
    
    console.log('👨‍🏫 TUTORS:');
    console.log('   • chinedu@emmidevcode.com');
    console.log('   • aisha@emmidevcode.com');
    console.log('   • emeka@emmidevcode.com');
    console.log('   • fatima@emmidevcode.com\n');
    
    console.log('👨‍🎓 STUDENTS:');
    console.log('   • seun@student.com, ngozi@student.com');
    console.log('   • yusuf@student.com, blessing@student.com');
    console.log('   • + 10 more students\n');
    
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ All users can now login successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();