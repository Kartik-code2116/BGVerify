import jwt from 'jsonwebtoken';
import config from '../../config';
import { User, IUser } from '../users/user.model';
import { Organization } from '../organizations/organization.model';
import { Wallet } from '../wallet/wallet.model';
import { RegisterInput, LoginInput } from './auth.validation';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';

class AuthService {
  /**
   * Generate JWT access token
   */
  private generateToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Generate refresh token
   */
  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      { id: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  /**
   * Register a new user + optionally an organization
   */
  async register(input: RegisterInput) {
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    const role = input.role || 'candidate';

    // Create the user
    const user = new User({
      email: input.email,
      password: input.password,
      firstName: input.firstName,
      lastName: input.lastName,
      role,
      phone: input.phone,
    });

    // If org_owner, create organization and wallet
    if (role === 'org_owner' && input.organizationName) {
      await user.save();

      const organization = new Organization({
        name: input.organizationName,
        email: input.email,
        ownerId: user._id,
      });
      await organization.save();

      // Create wallet for the organization
      const wallet = new Wallet({
        organizationId: organization._id,
        balance: 10, // 10 free BGCoins for new organizations
      });
      await wallet.save();

      // Link user to organization
      user.organizationId = organization._id;
      await user.save();

      logger.info(
        `New organization registered: ${organization.name} by ${user.email}`
      );
    } else {
      await user.save();
    }

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Login with email and password
   */
  async login(input: LoginInput) {
    const user = await User.findOne({ email: input.email }).select('+password');
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is deactivated');
    }

    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        organizationId: user.organizationId,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Get current user profile
   */
  async getProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    let organization = null;
    let wallet = null;

    if (user.organizationId) {
      organization = await Organization.findById(user.organizationId);
      wallet = await Wallet.findOne({ organizationId: user.organizationId });
    }

    return {
      user,
      organization,
      wallet: wallet
        ? {
            balance: wallet.balance,
            totalPurchased: wallet.totalPurchased,
            totalSpent: wallet.totalSpent,
          }
        : null,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshTokenStr: string) {
    try {
      const decoded = jwt.verify(refreshTokenStr, config.jwt.refreshSecret) as {
        id: string;
      };

      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const token = this.generateToken(user);
      return { token };
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}

export const authService = new AuthService();
