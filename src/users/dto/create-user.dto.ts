import { IsEmail, IsNotEmpty, IsOptional, Length } from "class-validator";

export class CreateUserDto {
  @IsNotEmpty({ message: "用户昵称不能为空" })
  nickName: string;

  @IsNotEmpty({ message: "手机号码不能为空" })
  @Length(11, 11, { message: "手机号码长度必须为11位" })
  phone: string;

  @IsEmail({}, { message: "邮箱格式不正确" })
  @IsOptional()
  email?: string;

  @IsOptional()
  sex?: string;

  // 密码可选，如果不传则后端默认设置
  @IsOptional()
  password?: string;

  @IsOptional()
  roleId?: string;
}
