
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Student } from './student.entity';
import { Department } from './department.entity';


@Entity('majors')
export class Major {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @OneToMany(() => Student, (student) => student.major)
  students: Student[];

  @ManyToOne(() => Department, (department) => department.id)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @CreateDateColumn()
    created_at: Date; // Ngày tạo tài khoản
  
    @UpdateDateColumn()
    updated_at: Date; // Ngày cập nhật thông tin người dùng
}
