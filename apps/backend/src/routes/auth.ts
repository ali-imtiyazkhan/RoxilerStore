import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { generateToken, AuthRequest } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(20).max(60),
  email: z.string().email(),
  address: z.string().max(400),
  password: z.string()
    .min(8)
    .max(16)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character'),
  role: z.enum(['NORMAL_USER', 'STORE_OWNER']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

router.post('/signup', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = signupSchema.parse(req.body);

  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
  if (existingUser) {
    throw new AppError(409, 'Email already registered');
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      address: data.address,
      role: data.role || 'NORMAL_USER'
    },
    select: { id: true, email: true, role: true, name: true }
  });

  const token = generateToken(user);
  res.status(201).json({ user, token });
}));

router.post('/login', asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) {
    throw new AppError(401, 'Invalid credentials');
  }

  const validPassword = await bcrypt.compare(data.password, user.password);
  if (!validPassword) {
    throw new AppError(401, 'Invalid credentials');
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    user: { id: user.id, email: user.email, role: user.role, name: user.name },
    token
  });
}));

router.get('/me', asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, name: true, email: true, address: true, role: true, createdAt: true }
  });
  res.json({ user });
}));

router.put('/password', asyncHandler(async (req: AuthRequest, res: Response) => {
  const schema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string()
      .min(8)
      .max(16)
      .regex(/[A-Z]/)
      .regex(/[!@#$%^&*(),.?":{}|<>]/)
  });

  const data = schema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) throw new AppError(404, 'User not found');

  const validPassword = await bcrypt.compare(data.currentPassword, user.password);
  if (!validPassword) throw new AppError(401, 'Current password is incorrect');

  const hashedPassword = await bcrypt.hash(data.newPassword, 12);
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { password: hashedPassword }
  });

  res.json({ message: 'Password updated successfully' });
}));

export default router;