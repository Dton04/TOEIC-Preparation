import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { GoogleLoginDto } from './dto/google-login.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    avatarUrl?: string | null;
    targetScore?: number | null;
  };
  tokens: AuthTokens;
}

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.jwtSecret = this.configService.get<string>(
      'JWT_SECRET',
      'super-secret-jwt-key-for-development-change-in-prod',
    );
    this.jwtRefreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'super-secret-refresh-key-for-development',
    );
  }

  /**
   * Đăng ký tài khoản học viên mới
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (existing) {
      throw new ConflictException('Email này đã được đăng ký trong hệ thống');
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(dto.password, saltRounds);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        fullName: dto.fullName.trim(),
        role: Role.STUDENT,
        targetScore: dto.targetScore || 700,
      },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        targetScore: user.targetScore,
      },
      tokens,
    };
  }

  /**
   * Đăng nhập với Email và Password
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        targetScore: user.targetScore,
      },
      tokens,
    };
  }

  /**
   * Cấp lại Access Token mới bằng Refresh Token
   */
  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.jwtRefreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Người dùng không còn tồn tại');
      }

      return this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      });
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc đã hết hạn');
    }
  }

  /**
   * Đăng nhập / Đăng ký qua Google OAuth2
   */
  async googleLogin(dto: GoogleLoginDto): Promise<AuthResponse> {
    try {
      // Xác thực Google ID Token qua endpoint chính thức của Google
      const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.credential}`;
      const response = await fetch(verifyUrl);

      if (!response.ok) {
        throw new UnauthorizedException('Google ID Token không hợp lệ');
      }

      const googlePayload = (await response.json()) as {
        email: string;
        name?: string;
        picture?: string;
        sub: string;
      };

      if (!googlePayload.email) {
        throw new BadRequestException('Không thể lấy thông tin email từ Google Account');
      }

      const email = googlePayload.email.toLowerCase().trim();
      let user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        // Sinh ngẫu nhiên password hash cho tài khoản OAuth
        const randomPassword = Math.random().toString(36).slice(-12) + Date.now();
        const passwordHash = await bcrypt.hash(randomPassword, 10);

        user = await this.prisma.user.create({
          data: {
            email,
            passwordHash,
            fullName: googlePayload.name || email.split('@')[0],
            avatarUrl: googlePayload.picture || null,
            role: Role.STUDENT,
            targetScore: dto.targetScore || 700,
          },
        });
      } else if (googlePayload.picture && !user.avatarUrl) {
        // Cập nhật avatar nếu có
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: googlePayload.picture },
        });
      }

      const tokens = await this.generateTokens({
        sub: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          targetScore: user.targetScore,
        },
        tokens,
      };
    } catch (err) {
      if (err instanceof UnauthorizedException || err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Lỗi trong quá trình xác thực Google: ' + (err as Error).message);
    }
  }

  /**
   * Lấy thông tin chi tiết của người dùng hiện tại
   */
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        targetScore: true,
        targetDate: true,
        createdAt: true,
        _count: {
          select: {
            submissions: true,
            flashcards: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại');
    }

    return user;
  }

  /**
   * Xác thực hoặc tạo mới tài khoản người dùng từ OAuth profile (Google)
   */
  async validateOAuthUser(profile: {
    email: string;
    fullName: string;
    avatarUrl?: string | null;
  }): Promise<AuthResponse> {
    const email = profile.email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-12) + Date.now();
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          fullName: profile.fullName || email.split('@')[0],
          avatarUrl: profile.avatarUrl || null,
          role: Role.STUDENT,
          targetScore: 700,
        },
      });
    } else if (profile.avatarUrl && !user.avatarUrl) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: profile.avatarUrl },
      });
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        targetScore: user.targetScore,
      },
      tokens,
    };
  }

  /**
   * Sinh cặp Access Token (15m) và Refresh Token (7d)
   */
  private async generateTokens(payload: {
    sub: string;
    email: string;
    role: string;
    fullName: string;
  }): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.jwtSecret,
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(
        { sub: payload.sub },
        {
          secret: this.jwtRefreshSecret,
          expiresIn: '7d',
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 phút tính theo giây
    };
  }
}
