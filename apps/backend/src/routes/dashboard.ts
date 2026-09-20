import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { AuthRequest, requireRole } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router: Router = Router();

router.get('/admin', requireRole('SYSTEM_ADMIN'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);

  const usersByRole = await prisma.user.groupBy({
    by: ['role'],
    _count: true
  });

  res.json({
    stats: {
      totalUsers,
      totalStores,
      totalRatings,
      usersByRole: usersByRole.reduce((acc, item) => {
        acc[item.role] = item._count;
        return acc;
      }, {} as Record<string, number>)
    }
  });
}));

router.get('/store-owner', requireRole('STORE_OWNER'), asyncHandler(async (req: AuthRequest, res: Response) => {
  const store = await prisma.store.findUnique({
    where: { ownerId: req.user!.id },
    include: {
      ratings: {
        include: { user: { select: { id: true, name: true, email: true, address: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!store) {
    return res.json({ store: null, ratings: [], averageRating: 0, totalRatings: 0 });
  }

  const avgRating = store.ratings.length > 0
    ? store.ratings.reduce((sum, r) => sum + r.value, 0) / store.ratings.length
    : 0;

  res.json({
    store: {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address
    },
    ratings: store.ratings,
    averageRating: Math.round(avgRating * 10) / 10,
    totalRatings: store.ratings.length
  });
}));

export default router;