import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

export async function register(req, res) {
  try {
    console.log("[REGISTER REQUEST]", { name: req.body.name, email: req.body.email });
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });

    // Seed demo data for new users
    await seedDemoDataForUser(user.id);

    const token = sign(user.id);
    console.log("[REGISTER SUCCESS]", user.id, "demo data seeded");
    return res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[REGISTER ERROR]", err.message);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
}

export async function login(req, res) {
  try {
    console.log("[LOGIN REQUEST]", { email: req.body.email });
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[DATABASE RESULT] User found:", user ? `id=${user.id}` : "null");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] Password match:", match);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = sign(user.id);
    console.log("[LOGIN SUCCESS]", user.id);
    return res.status(200).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("[LOGIN ERROR]", err.message);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
}

export async function me(req, res) {
  try {
    console.log("[ME REQUEST] userId:", req.user.id);
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("[ME RESPONSE]", user.email);
    return res.json(user);
  } catch (err) {
    console.error("[ME ERROR]", err.message);
    return res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
}

export async function resetDemo(req, res) {
  try {
    const uid = req.user.id;
    await prisma.application.deleteMany({ where: { userId: uid } });
    await prisma.dsaProblem.deleteMany({ where: { userId: uid } });
    await prisma.interviewQ.deleteMany({ where: { userId: uid } });
    await seedDemoDataForUser(uid);
    return res.json({ message: "Demo data reset successfully" });
  } catch (err) {
    console.error("[RESET DEMO ERROR]", err.message);
    return res.status(500).json({ message: "Reset failed", error: err.message });
  }
}

export async function seed(req, res) {
  try {
    const email = "demo@placementpilot.com";
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const hashed = await bcrypt.hash("12345678", 10);
      user = await prisma.user.create({ data: { name: "Demo User", email, password: hashed } });
      await seedDemoDataForUser(user.id);
      return res.status(201).json({ message: "Demo user created", email, password: "12345678" });
    }
    return res.json({ message: "Demo user already exists", email, password: "12345678" });
  } catch (err) {
    console.error("[SEED ERROR]", err.message);
    return res.status(500).json({ message: "Seed failed", error: err.message });
  }
}

// ── Demo data generator ──────────────────────────────────────
async function seedDemoDataForUser(userId) {
  const now = new Date();
  const daysAgo = (d) => new Date(now - d * 86400000);

  const companies = [
    { company: "Google",    role: "SWE Intern",          status: "Interview",  days: 45 },
    { company: "Meta",      role: "Frontend Engineer",   status: "Applied",    days: 30 },
    { company: "Amazon",    role: "SDE II",              status: "Offer",      days: 60 },
    { company: "Microsoft", role: "Software Engineer",   status: "Rejected",   days: 50 },
    { company: "Apple",     role: "iOS Developer",       status: "Applied",    days: 20 },
    { company: "Netflix",   role: "Backend Engineer",    status: "Interview",  days: 35 },
    { company: "Stripe",    role: "Full Stack Engineer", status: "Applied",    days: 15 },
    { company: "Figma",     role: "Frontend Developer",  status: "Offer",      days: 25 },
    { company: "Linear",    role: "SWE",                 status: "Applied",    days: 10 },
    { company: "Vercel",    role: "DevRel Engineer",     status: "Applied",    days: 5  },
    { company: "Notion",    role: "Product Engineer",    status: "Rejected",   days: 55 },
    { company: "Atlassian", role: "Junior SWE",          status: "Interview",  days: 40 },
  ];

  await prisma.application.createMany({
    data: companies.map(({ company, role, status, days }) => ({
      userId,
      company,
      role,
      status,
      appliedDate: daysAgo(days),
      createdAt: daysAgo(days),
    })),
  });

  const dsaData = [
    // Arrays
    { title: "Two Sum",                  topic: "Arrays",        difficulty: "Easy",   solved: true,  daysAgo: 30 },
    { title: "Best Time to Buy Stock",   topic: "Arrays",        difficulty: "Easy",   solved: true,  daysAgo: 28 },
    { title: "Contains Duplicate",       topic: "Arrays",        difficulty: "Easy",   solved: true,  daysAgo: 27 },
    { title: "Product of Array Except Self", topic: "Arrays",   difficulty: "Medium", solved: true,  daysAgo: 25 },
    { title: "Maximum Subarray",         topic: "Arrays",        difficulty: "Medium", solved: true,  daysAgo: 24 },
    { title: "3Sum",                     topic: "Arrays",        difficulty: "Medium", solved: false },
    // Strings
    { title: "Valid Anagram",            topic: "Strings",       difficulty: "Easy",   solved: true,  daysAgo: 22 },
    { title: "Valid Palindrome",         topic: "Strings",       difficulty: "Easy",   solved: true,  daysAgo: 21 },
    { title: "Longest Substring No Repeat", topic: "Strings",   difficulty: "Medium", solved: true,  daysAgo: 20 },
    { title: "Group Anagrams",           topic: "Strings",       difficulty: "Medium", solved: false },
    // Trees
    { title: "Invert Binary Tree",       topic: "Trees",         difficulty: "Easy",   solved: true,  daysAgo: 18 },
    { title: "Max Depth Binary Tree",    topic: "Trees",         difficulty: "Easy",   solved: true,  daysAgo: 17 },
    { title: "Same Tree",                topic: "Trees",         difficulty: "Easy",   solved: true,  daysAgo: 16 },
    { title: "Binary Tree Level Order",  topic: "Trees",         difficulty: "Medium", solved: true,  daysAgo: 14 },
    { title: "Validate BST",             topic: "Trees",         difficulty: "Medium", solved: false },
    { title: "Lowest Common Ancestor",   topic: "Trees",         difficulty: "Medium", solved: false },
    // Graphs
    { title: "Number of Islands",        topic: "Graphs",        difficulty: "Medium", solved: true,  daysAgo: 12 },
    { title: "Clone Graph",              topic: "Graphs",        difficulty: "Medium", solved: true,  daysAgo: 11 },
    { title: "Course Schedule",          topic: "Graphs",        difficulty: "Medium", solved: false },
    { title: "Pacific Atlantic Water",   topic: "Graphs",        difficulty: "Medium", solved: false },
    // DP
    { title: "Climbing Stairs",          topic: "DP",            difficulty: "Easy",   solved: true,  daysAgo: 10 },
    { title: "House Robber",             topic: "DP",            difficulty: "Medium", solved: true,  daysAgo: 9  },
    { title: "Coin Change",              topic: "DP",            difficulty: "Medium", solved: true,  daysAgo: 8  },
    { title: "Longest Common Subsequence", topic: "DP",          difficulty: "Medium", solved: false },
    { title: "Word Break",               topic: "DP",            difficulty: "Medium", solved: false },
    { title: "0/1 Knapsack",             topic: "DP",            difficulty: "Hard",   solved: false },
    // Binary Search
    { title: "Binary Search",            topic: "Binary Search", difficulty: "Easy",   solved: true,  daysAgo: 7  },
    { title: "Search Rotated Array",     topic: "Binary Search", difficulty: "Medium", solved: true,  daysAgo: 6  },
    { title: "Find Min Rotated Array",   topic: "Binary Search", difficulty: "Medium", solved: false },
    // Stack/Queue
    { title: "Valid Parentheses",        topic: "Stack/Queue",   difficulty: "Easy",   solved: true,  daysAgo: 5  },
    { title: "Min Stack",                topic: "Stack/Queue",   difficulty: "Medium", solved: true,  daysAgo: 4  },
    { title: "Daily Temperatures",       topic: "Stack/Queue",   difficulty: "Medium", solved: false },
    // Sorting
    { title: "Merge Intervals",          topic: "Sorting",       difficulty: "Medium", solved: true,  daysAgo: 3  },
    { title: "Sort Colors",              topic: "Sorting",       difficulty: "Medium", solved: false },
    // Hashing
    { title: "Top K Frequent Elements",  topic: "Hashing",       difficulty: "Medium", solved: true,  daysAgo: 2  },
    { title: "LRU Cache",                topic: "Hashing",       difficulty: "Hard",   solved: false },
    // Linked List
    { title: "Reverse Linked List",      topic: "Linked List",   difficulty: "Easy",   solved: true,  daysAgo: 1  },
    { title: "Merge Two Sorted Lists",   topic: "Linked List",   difficulty: "Easy",   solved: true,  daysAgo: 1  },
    { title: "Linked List Cycle",        topic: "Linked List",   difficulty: "Easy",   solved: false },
    // Greedy
    { title: "Jump Game",                topic: "Greedy",        difficulty: "Medium", solved: true,  daysAgo: 1  },
    { title: "Meeting Rooms",            topic: "Greedy",        difficulty: "Medium", solved: false },
    // Backtracking
    { title: "Subsets",                  topic: "Backtracking",  difficulty: "Medium", solved: false },
    { title: "Permutations",             topic: "Backtracking",  difficulty: "Medium", solved: false },
    // Hard
    { title: "Trapping Rain Water",      topic: "Arrays",        difficulty: "Hard",   solved: true,  daysAgo: 15 },
    { title: "Median of Two Arrays",     topic: "Binary Search", difficulty: "Hard",   solved: false },
    { title: "Serialize/Deserialize Tree", topic: "Trees",       difficulty: "Hard",   solved: false },
    { title: "Word Ladder",              topic: "Graphs",        difficulty: "Hard",   solved: false },
    { title: "Regular Expression Match", topic: "DP",            difficulty: "Hard",   solved: false },
    { title: "Sliding Window Maximum",   topic: "Stack/Queue",   difficulty: "Hard",   solved: false },
    { title: "Edit Distance",            topic: "DP",            difficulty: "Hard",   solved: false },
    { title: "N-Queens",                 topic: "Backtracking",  difficulty: "Hard",   solved: false },
    { title: "Longest Palindromic Substring", topic: "Strings", difficulty: "Medium", solved: true,  daysAgo: 13 },
    { title: "String to Integer (atoi)", topic: "Strings",       difficulty: "Medium", solved: false },
    { title: "Find All Anagrams",        topic: "Strings",       difficulty: "Medium", solved: false },
    { title: "Minimum Window Substring", topic: "Strings",       difficulty: "Hard",   solved: false },
    { title: "Diameter of Binary Tree",  topic: "Trees",         difficulty: "Easy",   solved: true,  daysAgo: 19 },
    { title: "Path Sum",                 topic: "Trees",         difficulty: "Easy",   solved: true,  daysAgo: 23 },
    { title: "Symmetric Tree",           topic: "Trees",         difficulty: "Easy",   solved: true,  daysAgo: 26 },
    { title: "Kth Largest Element",      topic: "Sorting",       difficulty: "Medium", solved: true,  daysAgo: 29 },
    { title: "Find Duplicate Number",    topic: "Arrays",        difficulty: "Medium", solved: true,  daysAgo: 31 },
    { title: "Spiral Matrix",            topic: "Arrays",        difficulty: "Medium", solved: false },
    { title: "Rotate Image",             topic: "Arrays",        difficulty: "Medium", solved: false },
    { title: "Set Matrix Zeroes",        topic: "Arrays",        difficulty: "Medium", solved: true,  daysAgo: 33 },
    { title: "Unique Paths",             topic: "DP",            difficulty: "Medium", solved: true,  daysAgo: 32 },
    { title: "Jump Game II",             topic: "Greedy",        difficulty: "Medium", solved: false },
    { title: "Combination Sum",          topic: "Backtracking",  difficulty: "Medium", solved: false },
    { title: "Letter Combinations",      topic: "Backtracking",  difficulty: "Medium", solved: false },
    { title: "Graph Valid Tree",         topic: "Graphs",        difficulty: "Medium", solved: true,  daysAgo: 36 },
    { title: "Walls and Gates",          topic: "Graphs",        difficulty: "Medium", solved: false },
    { title: "Decode Ways",              topic: "DP",            difficulty: "Medium", solved: true,  daysAgo: 34 },
  ];

  await prisma.dsaProblem.createMany({
    data: dsaData.map(({ title, topic, difficulty, solved, daysAgo: d }) => ({
      userId,
      title,
      topic,
      difficulty,
      solved,
      solvedAt: solved && d ? daysAgo(d) : null,
      createdAt: daysAgo(d ? d + 2 : Math.floor(Math.random() * 40) + 5),
    })),
  });

  const iqData = [
    // Behavioral
    { question: "Tell me about yourself.", category: "Behavioral", prepared: true, answer: "I'm a CS student passionate about building scalable systems. I've interned at 2 companies and worked on 5+ production projects." },
    { question: "Why do you want to work here?", category: "Behavioral", prepared: true, answer: "I admire the company's engineering culture and the scale of problems being solved." },
    { question: "Describe a challenging project.", category: "Behavioral", prepared: true, answer: "Built a real-time collaboration tool handling 1000 concurrent users. Solved WebSocket scaling issues using Redis pub/sub." },
    { question: "What's your biggest weakness?", category: "Behavioral", prepared: false },
    { question: "Where do you see yourself in 5 years?", category: "Behavioral", prepared: false },
    { question: "Tell me about a conflict with a teammate.", category: "Behavioral", prepared: false },
    // Technical
    { question: "Explain the difference between TCP and UDP.", category: "Technical", prepared: true, answer: "TCP is connection-oriented with guaranteed delivery. UDP is connectionless and faster but no guarantee." },
    { question: "What is a REST API?", category: "Technical", prepared: true, answer: "REST is an architectural style using HTTP methods. Stateless, uses standard HTTP verbs GET/POST/PUT/DELETE." },
    { question: "Explain indexing in databases.", category: "Technical", prepared: true, answer: "Indexes speed up queries by creating a data structure (B-tree) that allows faster lookups." },
    { question: "What is the difference between SQL and NoSQL?", category: "Technical", prepared: false },
    { question: "Explain how HTTPS works.", category: "Technical", prepared: false },
    { question: "What is a race condition?", category: "Technical", prepared: false },
    { question: "Explain garbage collection.", category: "Technical", prepared: false },
    // System Design
    { question: "Design a URL shortener like bit.ly.", category: "System Design", prepared: true, answer: "Use hashing (base62) to generate short codes. Store in DB with expiry. Use CDN for redirection." },
    { question: "Design Twitter's feed.", category: "System Design", prepared: false },
    { question: "Design a rate limiter.", category: "System Design", prepared: true, answer: "Token bucket or sliding window algorithm. Store counts in Redis with TTL." },
    { question: "Design a notification system.", category: "System Design", prepared: false },
    { question: "Design a chat application.", category: "System Design", prepared: false },
    // Coding
    { question: "Find the nth Fibonacci number efficiently.", category: "Coding", prepared: true, answer: "Use dynamic programming O(n) or matrix exponentiation O(log n)." },
    { question: "Implement LRU Cache.", category: "Coding", prepared: false },
    { question: "Write a function to check if a string is a palindrome.", category: "Coding", prepared: true, answer: "Two pointer approach: compare chars from both ends. O(n) time, O(1) space." },
    { question: "Implement a stack using queues.", category: "Coding", prepared: false },
    { question: "Find the first non-repeating character in a string.", category: "Coding", prepared: false },
    // HR
    { question: "What's your expected salary?", category: "HR", prepared: true, answer: "Based on market research and my experience, I'm targeting $X-Y range, but I'm open to discussion." },
    { question: "When can you start?", category: "HR", prepared: true, answer: "I can start within 2 weeks of receiving an offer." },
    { question: "Do you have other offers?", category: "HR", prepared: false },
    { question: "Are you open to relocation?", category: "HR", prepared: false },
    // Leadership
    { question: "Describe a time you led a team.", category: "Leadership", prepared: true, answer: "Led a 4-person team building a hackathon project. Delegated tasks based on strengths, held daily standups." },
    { question: "How do you handle underperforming team members?", category: "Leadership", prepared: false },
    { question: "Give an example of a decision you made with incomplete information.", category: "Leadership", prepared: false },
    // Other
    { question: "What programming languages are you comfortable with?", category: "Other", prepared: true, answer: "Most comfortable with JavaScript/TypeScript and Python. Also have experience with Java and Go." },
    { question: "Describe your ideal work environment.", category: "Other", prepared: false },
    { question: "What projects are you most proud of?", category: "Other", prepared: false },
    { question: "How do you stay up to date with technology?", category: "Other", prepared: false },
    { question: "What's a recent technical book or blog you read?", category: "Other", prepared: false },
  ];

  await prisma.interviewQ.createMany({
    data: iqData.map(({ question, category, prepared, answer }) => ({
      userId,
      question,
      category,
      prepared: prepared || false,
      answer: answer || null,
    })),
  });
}
