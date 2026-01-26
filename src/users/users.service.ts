import { Injectable, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    // 检查手机号是否已存在
    const existingUser = await this.usersRepository.findOneBy({
      phone: createUserDto.phone,
    });
    if (existingUser) {
      throw new ConflictException("该手机号已注册");
    }

    // 处理密码：如果未提供，默认 123456
    const plainPassword = createUserDto.password || "123456";
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(plainPassword, salt);

    const newUser = this.usersRepository.create({
      ...createUserDto,
      password: hashPassword,
    });

    return this.usersRepository.save(newUser);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  // 用于登录验证，因为 password 字段 select: false，所以需要用 addSelect 显式查出来
  async findByPhoneForAuth(phone: string) {
    return this.usersRepository
      .createQueryBuilder("user")
      .addSelect("user.password")
      .where("user.phone = :phone", { phone })
      .getOne();
  }

  async update(id: number, updateUserDto: Partial<CreateUserDto>) {
    // 更新时通常不处理密码，除非有专门的重置密码接口
    // 这里简单处理，如果传了密码就加密，没传就不动
    const dataToUpdate = { ...updateUserDto };

    if (dataToUpdate.password) {
      const salt = await bcrypt.genSalt();
      dataToUpdate.password = await bcrypt.hash(dataToUpdate.password, salt);
    } else {
      delete dataToUpdate.password;
    }

    await this.usersRepository.update(id, dataToUpdate);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }
}
