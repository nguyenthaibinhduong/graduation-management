import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Position } from './position.entity';
import { Teacher } from './teacher.entity';

@Entity('positions_teachers')
export class PositionTeacher {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Position, (position) => position.id)
  @JoinColumn({ name: 'position_id' })
  position: Position;

  @ManyToOne(() => Teacher, (teacher) => teacher.id)
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;
}
