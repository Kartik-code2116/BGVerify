import { Router, Request, Response, NextFunction } from 'express';
import os from 'os';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { PaymentSession } from './paymentSession.model';
import { Wallet, WalletTransaction } from '../wallet/wallet.model';
import { AuditLog } from '../audit/audit.model';
import { BadRequestError, NotFoundError } from '../../utils/errors';

const router = Router();

/**
 * Helper to discover local Wi-Fi / LAN IP address for real phone access
 */
export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  
  // 1. First priority: Wi-Fi or standard LAN 192.168.x.x or 10.x.x.x
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal) {
        if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
          return iface.address;
        }
      }
    }
  }

  // 2. Fallback: Any valid non-internal IPv4 (excluding loopback)
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name] || []) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
        return iface.address;
      }
    }
  }

  return 'localhost';
}

// ─── GET /api/v1/payments/network-info ──────────────────
router.get('/network-info', (req: Request, res: Response) => {
  const lanIp = getLocalIpAddress();
  res.status(200).json({
    success: true,
    data: {
      lanIp,
      port: 5173,
      protocol: 'http',
    },
  });
});

// ─── POST /api/v1/payments/session (Authenticated) ───────
router.post(
  '/session',
  authenticate,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { amount, coins, orderTitle, customHost } = req.body;
      const orgId = req.user!.organizationId;

      if (!orgId) throw new BadRequestError('User does not belong to an organization');
      if (!amount || amount <= 0) throw new BadRequestError('Invalid payment amount');

      const sessionId = `pay_sess_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;
      const orderId = `order_Rzp${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // 15 minutes expiry
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      const session = await PaymentSession.create({
        sessionId,
        orderId,
        amount: Number(amount),
        coins: Number(coins) || 100,
        organizationId: orgId,
        userId: req.user!.id,
        orderTitle: orderTitle || 'BGCoin Wallet Top-Up',
        expiresAt,
        status: 'pending',
      });

      const lanIp = getLocalIpAddress();
      const host = customHost || `${lanIp}:5173`;
      const mobilePayUrl = `http://${host}/pay/${sessionId}`;

      res.status(201).json({
        success: true,
        message: 'Payment session created',
        data: {
          sessionId,
          orderId,
          amount: session.amount,
          coins: session.coins,
          orderTitle: session.orderTitle,
          expiresAt: session.expiresAt,
          lanIp,
          mobilePayUrl,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /api/v1/payments/session/:id (Public for Phone) ──
router.get(
  '/session/:id',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await PaymentSession.findOne({
        sessionId: req.params.id,
      }).populate('organizationId', 'name');

      if (!session) throw new NotFoundError('Payment session not found');

      if (session.status === 'pending' && new Date() > session.expiresAt) {
        session.status = 'expired';
        await session.save();
      }

      res.status(200).json({
        success: true,
        data: {
          sessionId: session.sessionId,
          orderId: session.orderId,
          amount: session.amount,
          coins: session.coins,
          orderTitle: session.orderTitle,
          status: session.status,
          paymentId: session.paymentId,
          expiresAt: session.expiresAt,
          orgName: (session.organizationId as any)?.name || 'BGVerify Enterprise',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── GET /api/v1/payments/session/:id/status (Desktop polling) ─
router.get(
  '/session/:id/status',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await PaymentSession.findOne({
        sessionId: req.params.id,
      });

      if (!session) throw new NotFoundError('Payment session not found');

      if (session.status === 'pending' && new Date() > session.expiresAt) {
        session.status = 'expired';
        await session.save();
      }

      res.status(200).json({
        success: true,
        data: {
          status: session.status,
          paymentId: session.paymentId,
          amount: session.amount,
          coins: session.coins,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/v1/payments/session/:id/confirm (Tapped by Phone) ───
router.post(
  '/session/:id/confirm',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await PaymentSession.findOne({
        sessionId: req.params.id,
      });

      if (!session) throw new NotFoundError('Payment session not found');

      if (session.status === 'confirmed') {
        return res.status(200).json({
          success: true,
          message: 'Payment was already confirmed',
          data: { status: 'confirmed', paymentId: session.paymentId },
        });
      }

      if (session.status === 'rejected') {
        throw new BadRequestError('This payment session was rejected');
      }

      if (new Date() > session.expiresAt) {
        session.status = 'expired';
        await session.save();
        throw new BadRequestError('Payment session has expired');
      }

      const generatedPaymentId = `pay_Rzp${Math.random().toString(36).substring(2, 11)}`;

      session.status = 'confirmed';
      session.paymentId = generatedPaymentId;
      session.confirmedAt = new Date();
      await session.save();

      // Automatically credit the organization's BGCoin wallet!
      const wallet = await Wallet.findOneAndUpdate(
        { organizationId: session.organizationId },
        {
          $inc: { balance: session.coins, totalPurchased: session.coins },
        },
        { new: true, upsert: true }
      );

      // Create transaction log
      await WalletTransaction.create({
        walletId: wallet._id,
        organizationId: session.organizationId,
        type: 'purchase',
        amount: session.coins,
        balanceAfter: wallet.balance,
        description: `Purchased package of ${session.coins} BGCoins (₹${session.amount.toLocaleString('en-IN')}) via Razorpay UPI QR`,
        referenceType: 'purchase',
        performedBy: session.userId,
      });

      // Audit log
      await AuditLog.create({
        userId: session.userId,
        organizationId: session.organizationId,
        action: 'wallet.purchase',
        resourceType: 'wallet',
        resourceId: wallet._id.toString(),
        details: {
          amount: session.coins,
          priceInr: session.amount,
          paymentId: generatedPaymentId,
          method: 'razorpay_upi_qr',
          newBalance: wallet.balance,
        },
      });

      res.status(200).json({
        success: true,
        message: 'Payment confirmed successfully! BGCoins credited.',
        data: {
          status: 'confirmed',
          paymentId: generatedPaymentId,
          coins: session.coins,
          amount: session.amount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// ─── POST /api/v1/payments/session/:id/reject (Tapped by Phone) ───
router.post(
  '/session/:id/reject',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await PaymentSession.findOne({
        sessionId: req.params.id,
      });

      if (!session) throw new NotFoundError('Payment session not found');

      if (session.status === 'confirmed') {
        throw new BadRequestError('Cannot reject an already confirmed payment');
      }

      session.status = 'rejected';
      session.rejectedAt = new Date();
      await session.save();

      res.status(200).json({
        success: true,
        message: 'Payment declined by user on mobile device',
        data: {
          status: 'rejected',
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
