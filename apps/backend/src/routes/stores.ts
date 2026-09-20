import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, requireRole } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

const createStoreSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email(),
  address: z.string().max(400),
  ownerId: z.string()
});

const updateStoreSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional(),
  address: z.string().max(400).optional()
});

const querySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  name: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional()
});

router.get('/', asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = querySchema.parse(req.query);
  const { page, limit, sortBy, sortOrder, name, email, address } = query;

  const where: any = {};
  if (name) where.name = { contains: name, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (address) where.address = { contains: address, mode: 'insensitive' };

  if (req.user?.role === 'STORE_OWNER') {
    where.ownerId = req.user.id;
  }

  const orderBy: any = {};
  if (sortBy) orderBy[sortBy] = sortOrder;

  const [stores, total] = await Promise.all([
    prisma.store.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        ratings: { select: { value: true } }
      }
    }),
    prisma.store.count({ where })
  ]);

  const storesWithRating = stores.map(store => {
    const avgRating = store.ratings.length > 0
      ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
      : 0;
    return {
      ...store,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: store.ratings.length
    };
  });

  res.json({
    stores: storesWithRating,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  });
}));

router.post('/', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = createStoreSchema.parse(req.body);

  const owner = await prisma.user.findUnique({ where: { id: data.ownerId } });
  if (!owner) throw new AppError(404, 'Owner not found');
  if (owner.role !== 'STORE_OWNER') throw new AppError(400, 'User must be a Store Owner');

  const existingStore = await prisma.store.findUnique({ where: { ownerId: data.ownerId } });
  if (existingStore) throw new AppError(409, 'User already owns a store');

  const existingEmail = await prisma.store.findUnique({ where: { email: data.email } });
  if (existingEmail) throw new AppError(409, 'Store email already in use');

  const store = await prisma.store.create({
    data: data,
    include: { owner: { select: { id: true, name: true, email: true } } }
  });

  res.status(201).json({ store });
}));

router.get('/:id', asyncHandler(async (req: AuthRequest, res: Response) => {
  const store = await prisma.store.findUnique({
    where: { id: req.params.id },
    include: {
      owner: { select: { id: true, name: true, email: true, address: true } },
      ratings: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });
  if (!store) throw new AppError(404, 'Store not found');

  if (req.user?.role === 'STORE_OWNER' && store.ownerId !== req.user.id) {
    throw new AppError(403, 'Not authorized');
  }

  const avgRating = store.ratings.length > 0
    ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
    : 0;

  res.json({
    store: {
      ...store,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: store.ratings.length
    }
  });
}));

router.put('/:id', requireRole('SYSTEM_ADMIN', 'STORE_OWNER'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const store = await prisma.store.findUnique({ where: { id: req.params.id } });
  if (!store) throw new AppError(404, 'Store not found');

  if (req.user?.role === 'STORE_OWNER' && store.ownerId !== req.user.id) {
    throw new AppError(403, 'Not authorized');
  }

  const data = updateStoreSchema.parse(req.body);
  const updated = await prisma.store.update({
    where: { id: req.params.id },
    data,
    include: { owner: { select: { id: true, name: true, email: true } } }
  });

  res.json({ store: updated });
}));

router.delete('/:id', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  await prisma.store.delete({ where: { id: req.params.id } });
  res.json({ message: 'Store deleted' });
}));

export default router;