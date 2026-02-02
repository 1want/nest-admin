import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { UsersService } from './users/users.service'
import { RolesService } from './roles/roles.service'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Software } from './softwares/entities/software.entity'
import { User } from './users/entities/user.entity'
import { Role } from './roles/entities/role.entity'
import { faker } from '@faker-js/faker'

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule)

  const rolesService = appContext.get(RolesService)
  const usersService = appContext.get(UsersService)
  const softwareRepository = appContext.get<Repository<Software>>(getRepositoryToken(Software))
  const userRepository = appContext.get<Repository<User>>(getRepositoryToken(User))
  const roleRepository = appContext.get<Repository<Role>>(getRepositoryToken(Role))

  await softwareRepository.delete({})
  await userRepository.delete({})
  await roleRepository.delete({})
  // 1. 初始化角色
  const adminRole = await rolesService.create({
    name: '超级管理员',
    description: 'System Administrator',
    permissions: ['dashboard', 'mobile-management', 'software']
  })
  console.log('Seeded Admin Role')

  const normalRole = await rolesService.create({
    name: '普通用户',
    description: 'Normal User',
    permissions: ['dashboard', 'mobile-management', 'software']
  })
  console.log('Seeded Normal Role')

  // 2. 初始化用户
  // 创建管理员用户 (假设 UsersService.create 现在接受 roleId，如果 service 逻辑改了这里也要对应传递)
  try {
    await usersService.create({
      nickName: 'Admin',
      phone: '13800138000',
      password: 'admin',
      roleId: adminRole.id
    } as any)
    console.log('Seeded Admin User: 13800138000 / admin')

    await usersService.create({
      nickName: 'User',
      phone: '13900139000',
      password: 'user',
      roleId: normalRole.id
    } as any)
    console.log('Seeded Normal User: 13900139000 / user')
  } catch (e) {
    console.log('Users might already exist, skipping...')
  }

  // 3. 初始化软件数据 (保留原有逻辑)
  const softwaresToSeed: Partial<Software>[] = []
  const numberOfSoftwares = 20

  for (let i = 0; i < numberOfSoftwares; i++) {
    const software = {
      name: faker.commerce.productName(),
      version: faker.system.semver(),
      features: faker.lorem.sentences(2),
      testDevice: faker.helpers.arrayElement([
        'iPhone 13',
        'iPhone 14 Pro',
        'Samsung Galaxy S22',
        'Pixel 7',
        'Xiaomi 13'
      ]),
      testSystem: faker.helpers.arrayElement(['iOS 16.0', 'iOS 15.5', 'Android 13', 'Android 12', 'MIUI 14'])
    }
    softwaresToSeed.push(software)
  }

  try {
    // 使用 insert 批量插入数据
    await softwareRepository.insert(softwaresToSeed)
    console.log(`Successfully seeded ${numberOfSoftwares} softwares.`)
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    // 关闭应用上下文
    console.log('Seeding process finished.')
  }

  await appContext.close()
}

bootstrap()
