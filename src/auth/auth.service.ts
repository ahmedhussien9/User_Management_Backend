import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { ERROR_MESSAGES } from '../constants/error-messages';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.findUserByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user.toObject();
      return result;
    }
    throw new UnauthorizedException(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, roles: user.roleId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
