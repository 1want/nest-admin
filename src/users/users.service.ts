import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, Like } from 'typeorm'
import { User } from './entities/user.entity'
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcryptjs'
import { RolesService } from '../roles/roles.service'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private rolesService: RolesService
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { roleId, ...userData } = createUserDto

    // 检查手机号是否已存在
    const existingUser = await this.usersRepository.findOneBy({
      phone: userData.phone
    })
    if (existingUser) {
      throw new ConflictException('该手机号已注册')
    }

    // 处理密码：如果未提供，默认 123456
    const plainPassword = userData.password || '123456'
    const salt = await bcrypt.genSalt()
    const hashPassword = await bcrypt.hash(plainPassword, salt)

    const newUser = this.usersRepository.create({
      ...userData,
      password: hashPassword
    })

    // 关联角色
    if (roleId) {
      const role = await this.rolesService.findOne(roleId)
      newUser.role = role
    }

    return this.usersRepository.save(newUser)
  }

  async update(id: number, updateUserDto: any) {
    const { roleId, ...updateData } = updateUserDto
    const user = await this.findOne(id)

    if (!user) {
      throw new NotFoundException(`User #${id} not found`)
    }

    // 处理角色更新
    if (roleId) {
      const role = await this.rolesService.findOne(roleId)
      user.role = role
    }

    // 处理密码加密
    if (updateData.password) {
      const salt = await bcrypt.genSalt()
      updateData.password = await bcrypt.hash(updateData.password, salt)
    } else {
      delete updateData.password
    }

    // 合并并保存
    this.usersRepository.merge(user, updateData)
    return this.usersRepository.save(user)
  }

  async findAll(query: any) {
    const { pageNum = 1, pageSize = 10, phone, nickname } = query
    const skip = (pageNum - 1) * pageSize

    // 构建查询条件
    const where: any = {}
    if (phone) {
      where.phone = Like(`%${phone}%`)
    }
    if (nickname) {
      where.nickname = Like(`%${nickname}%`)
    }

    const [list, total] = await this.usersRepository.findAndCount({
      where,
      skip,
      take: +pageSize,
      order: { id: 'DESC' },
      relations: ['role']
    })

    const flatList = list.map(item => ({
      ...item,
      roleId: item.role ? item.role.id : null,
      roleName: item.role ? item.role.name : null
    }))

    return {
      data: flatList,
      total,
      pageNum: +pageNum,
      pageSize: +pageSize
    }
  }

  findOne(id: number) {
    return this.usersRepository.findOne({ where: { id }, relations: ['role'] })
  }

  async findByPhoneForAuth(phone: string) {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.role', 'role')
      .where('user.phone = :phone', { phone })
      .getOne()
  }

  remove(id: number) {
    return this.usersRepository.delete(id)
  }
}
