import prisma from "../prisma.js";

export async function getAll(req, res) {
  const { status, search } = req.query;
  const where = { userId: req.user.id };
  if (status) where.status = status;
  if (search) where.OR = [
    { company: { contains: search, mode: "insensitive" } },
    { role: { contains: search, mode: "insensitive" } },
  ];
  const apps = await prisma.application.findMany({ where, orderBy: { createdAt: "desc" } });
  res.json(apps);
}

export async function create(req, res) {
  const { company, role, status, appliedDate, notes, link } = req.body;
  if (!company || !role) return res.status(400).json({ message: "Company and role required" });
  const app = await prisma.application.create({
    data: { userId: req.user.id, company, role, status: status || "Applied", appliedDate: appliedDate ? new Date(appliedDate) : new Date(), notes, link },
  });
  res.status(201).json(app);
}

export async function update(req, res) {
  const app = await prisma.application.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!app) return res.status(404).json({ message: "Not found" });
  const updated = await prisma.application.update({ where: { id: req.params.id }, data: req.body });
  res.json(updated);
}

export async function remove(req, res) {
  const app = await prisma.application.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!app) return res.status(404).json({ message: "Not found" });
  await prisma.application.delete({ where: { id: req.params.id } });
  res.json({ message: "Deleted" });
}
