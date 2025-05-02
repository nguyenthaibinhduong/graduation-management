import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { Project } from './project.entity';

@Entity('scores')
export class Score {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Group, (group) => group.score)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @OneToOne(() => Project, (project) => project.id)
  project: Project;

  @Column({ type: 'double', nullable: true })
  total_score?: number;

  @Column({ type: 'varchar', length: 255 })
  comment: string;


  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản
  
  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng
}
