import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("softwares")
export class Software {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255, comment: "软件名称" })
  name: string;

  @Column({ length: 50, comment: "版本号" })
  version: string;

  @Column("text", { comment: "功能描述", nullable: true })
  features: string;

  @Column({ length: 255, comment: "测试机型", nullable: true })
  testDevice: string;

  @Column({ length: 255, comment: "测试系统", nullable: true })
  testSystem: string;
}
