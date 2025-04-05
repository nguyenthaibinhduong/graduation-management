import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Student } from './student.entity';
import { Major } from './major.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column()
  code: string;

  @Column()
  name: string;

  @OneToMany(() => Student, (student) => student.department)
  students: Student[];

  @OneToMany(() => Major, (major) => major.department)
  major: Major[];
}
