import prisma from "../prisma.js";

export async function getAll(req, res) {
  const { topic, difficulty, solved } = req.query;
  const where = { userId: req.user.id };
  if (topic) where.topic = topic;
  if (difficulty) where.difficulty = difficulty;
  if (solved !== undefined) where.solved = solved === "true";
  const problems = await prisma.dsaProblem.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(problems);
}

export async function create(req, res) {
  const { title, topic, difficulty, link } = req.body;
  if (!title || !topic || !difficulty) return res.status(400).json({ message: "Title, topic, difficulty required" });
  const problem = await prisma.dsaProblem.create({
    data: { userId: req.user.id, title, topic, difficulty, link },
  });
  res.status(201).json(problem);
}

export async function toggle(req, res) {
  const problem = await prisma.dsaProblem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!problem) return res.status(404).json({ message: "Not found" });
  const updated = await prisma.dsaProblem.update({
    where: { id: req.params.id },
    data: { solved: !problem.solved, solvedAt: !problem.solved ? new Date() : null },
  });
  res.json(updated);
}

export async function remove(req, res) {
  const problem = await prisma.dsaProblem.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!problem) return res.status(404).json({ message: "Not found" });
  await prisma.dsaProblem.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
}

export async function getStats(req, res) {
  const problems = await prisma.dsaProblem.findMany({ where: { userId: req.user.id } });
  const total = problems.length;
  const solved = problems.filter((p) => p.solved).length;

  const byTopic = problems.reduce((acc, p) => {
    if (!acc[p.topic]) acc[p.topic] = { total: 0, solved: 0 };
    acc[p.topic].total++;
    if (p.solved) acc[p.topic].solved++;
    return acc;
  }, {});

  const byDifficulty = problems.reduce((acc, p) => {
    if (!acc[p.difficulty]) acc[p.difficulty] = { total: 0, solved: 0 };
    acc[p.difficulty].total++;
    if (p.solved) acc[p.difficulty].solved++;
    return acc;
  }, {});

  res.json({ total, solved, byTopic, byDifficulty });
}
