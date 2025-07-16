import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IAuthService } from '../interfaces/auth-service.interface';
import { RegisterDto } from '../dto/register.dto';
import { AuthEntity } from '../entities/auth.entity';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthEntity> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    dto = {...dto, password: hashedPassword}
    const user = await this.prisma.user.create({ data: dto });
    return { id: user.id, email: user.email, role: user.role }
  }

  async login(dto: LoginDto): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      access_token: this.jwtService.sign(payload),
    };
  }
}
