import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AuthEntity } from '../entities/auth.entity';

export interface IAuthService {
  register(dto: RegisterDto): Promise<AuthEntity>;
  login(dto: LoginDto): Promise<AuthEntity>;
}