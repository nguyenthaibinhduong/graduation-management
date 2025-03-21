import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Group } from './group.entity';
import { Student } from './student.entity';

@Entity('group_students')
export class GroupStudent {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Group, (group) => group.id)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @OneToOne(() => Student, (student) => student.id)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}
