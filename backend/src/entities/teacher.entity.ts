import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from './user.entity';
import { Committee } from './committee.entity';
import { Position } from './position.entity';

@Entity('teachers')
export class Teacher {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @OneToOne(() => User, (user) => user.student)
  @JoinColumn({ name: 'user_id' })
  user: User;
  
  @ManyToMany(() => Committee, (committee) => committee.id)
  committee: Committee[];

  @ManyToMany(() => Position, (position) => position.teachers)
  @JoinTable()
  position: Position[];

  @Column()
  degree: string;
}
