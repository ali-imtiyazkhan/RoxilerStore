import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, requireRole } from '../middleware/auth.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

const router = Router();

const ratingSchema = z.object({
  value: z.number().int().min(1).max(5)
});

router.post('/stores/:storeId', requireRole('NORMAL_USER'), asyncHandler(async (req: AuthRequest, res) => {
  const { value } = ratingSchema.parse(req.body);
  const { storeId } = req.params;

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new AppError(404, 'Store not found');

  const existingRating = await prisma.rating.findUnique({
    where: { userId_storeId: { userId: req.user!.id, storeId } }
  });

  let rating;
  if (existingRating) {
    rating = await prisma.rating.update({
      where: { id: existingRating.id },
      data: { value },
      include: { user: { select: { id: true, name: true } }, store: { select: { id: true, name: true } } }
    });
  } else {
    rating = await prisma.rating.create({
      data: { value, userId: req.user!.id, storeId },
      include: { user: { select: { id: true, name: true } }, store: { select: { id: true, name: true } } }
    });
  }

  res.json({ rating, message: existingRating ? 'Rating updated' : 'Rating submitted' });
}));

router.get('/stores/:storeId/my-rating', requireRole('NORMAL_USER'), asyncHandler(async (req: AuthRequest, res) => {
  const { storeId } = req.params;

  const rating = await prisma.rating.findUnique({
    where: { userId_storeId: { userId: req.user!.id, storeId } },
    select: { value: true, createdAt: true, updatedAt: true }
  });

  res.json({ rating });
}));

router.delete('/stores/:storeId', requireRole('NORMAL_USER'), asyncHandler(async (req: AuthRequest, res) => {
  const { storeId } = req.params;

  await prisma.rating.delete({
    where: { userId_storeId: { userId: req.user!.id, storeId } }
  });

  res.json({ message: 'Rating deleted' });
}));

router.get('/store/:storeId', requireRole('STORE_OWNER', 'SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res) => {
  const { storeId } = req.params;

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new AppError(404, 'Store not found');

  if (req.user?.role === 'STORE_OWNER' && store.ownerId !== req.user.id) {
    throw new AppError(403, 'Not authorized');
  }

  const ratings = await prisma.rating.findMany({
    where: { storeId },
    include: { user: { select: { id: true, name: true, email: true, address: true } } },
    orderBy: { createdAt: 'desc' }
  });

  const avgRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length
    : 0;

  res.json({
    ratings,
    averageRating: Math.round(avgRating * 10) / 10,
    totalRatings: ratings.length
  });
}));

export default router;