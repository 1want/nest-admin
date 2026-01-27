import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, pass: string): Promise<any> {
    const user = await this.usersService.findByPhoneForAuth(phone);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.phone, sub: user.id };

    // 提取权限列表
    let permissions: string[] = [];
    if (user.role && user.role.permissions) {
      permissions = user.role.permissions;
    }

    return {
      access_token: this.jwtService.sign(payload),
      // 将 roleId 和 permissions 返回给前端，方便 setUserInfo
      roleId: user.role ? user.role.id : null,
      permissions: permissions,
      username: user.nickName || user.phone,
    };
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      return null;
    }

    // 提取权限列表
    let permissions: string[] = [];
    if (user.role && user.role.permissions) {
      permissions = user.role.permissions;
    }

    return {
      id: user.id,
      username: user.nickName || user.phone,
      phone: user.phone,
      roleId: user.role ? user.role.id : null,
      permissions: permissions,
      // 可以在这里返回更多用户信息
    };
  }
}
