import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm'
import { Role } from '../../roles/entities/role.entity'

@Entity('sys_user')
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ length: 50, comment: '用户昵称' })
  nickName: string

  @Column({ length: 11, unique: true, comment: '手机号码' })
  phone: string

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string

  // 0男 1女 2未知
  @Column({
    type: 'char',
    length: 1,
    default: '0',
    comment: '用户性别（0男 1女 2未知）'
  })
  sex: string

  // select: false 意味着默认查询时不返回密码字段
  @Column({ select: false, comment: '密码' })
  password: string

  @Column({ default: true, comment: '帐号状态（1正常 0停用）' })
  status: boolean

  @CreateDateColumn()
  createTime: Date

  @UpdateDateColumn()
  updateTime: Date

  @ManyToOne(() => Role, role => role.users)
  role: Role
}
