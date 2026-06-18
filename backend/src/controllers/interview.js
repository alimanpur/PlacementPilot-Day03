import prisma from "../prisma.js";

export async function getAll(req, res) {
  const { category, prepared } = req.query;
  const where = { userId: req.user.id };
  if (category) where.category = category;
  if (prepared !== undefined) where.prepared = prepared === "true";
  const questions = await prisma.interviewQ.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(questions);
}

export async function create(req, res) {
  const { question, category, answer } = req.body;
  if (!question || !category) return res.status(400).json({ message: "Question and category required" });
  const q = await prisma.interviewQ.create({
    data: { userId: req.user.id, question, category, answer },
  });
  res.status(201).json(q);
}

export async function update(req, res) {
  const q = await prisma.interviewQ.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!q) return res.status(404).json({ message: "Not found" });
  const updated = await prisma.interviewQ.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
}

export async function toggle(req, res) {
  const q = await prisma.interviewQ.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!q) return res.status(404).json({ message: "Not found" });
  const updated = await prisma.interviewQ.update({
    where: { id: req.params.id },
    data: { prepared: !q.prepared },
  });
  res.json(updated);
}

export async function remove(req, res) {
  const q = await prisma.interviewQ.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!q) return res.status(404).json({ message: "Not found" });
  await prisma.interviewQ.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
}
