import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, requireRole } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router: Router = Router();

const createUserSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  password: z.string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/)
    .regex(/[!@#$%^&*(),.?":{}|<>]/),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER'])
});

const updateUserSchema = z.object({
  name: z.string().min(20).max(60).optional(),
  email: z.string().email().optional(),
  address: z.string().max(400).optional(),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional()
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['SYSTEM_ADMIN', 'NORMAL_USER', 'STORE_OWNER']).optional()
});

router.get('/', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = querySchema.parse(req.query);
  const { page, limit, sortBy, sortOrder, name, email, address, role } = query;

  const where: any = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };
  if (role) where.role = role;

  const orderBy: any = {};
  if (sortBy) orderBy[sortBy] = sortOrder;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
store: { select: { id: true, name: true, ratings: { select: { value: true } } } }
      }
    }),
    prisma.user.count({ where })
  ]);

  res.json({
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}));

router.post('/', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createUserSchema.parse(req.body);

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError(409, 'Email already registered');

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { ...data, password: hashedPassword },
    select: { id: true, name: true, email: true, address: true, role: true, createdAt: true }
  });

  res.status(201).json({ user });
}));

router.get('/:id', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      store: { select: { id: true, name: true, ratings: { select: { value: true } } } }
    }
  });
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user });
}));

router.put('/:id', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateUserSchema.parse(req.body);

  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== req.params.id) {
      throw new AppError(409, 'Email already in use');
    }
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data,
    select: { id: true, name: true, email: true, address: true, role: true }
  });
  res.json({ user });
}));

router.delete('/:id', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ message: 'User deleted' });
}));

export default router;