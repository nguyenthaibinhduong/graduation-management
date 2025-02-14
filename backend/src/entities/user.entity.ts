import { Exclude } from 'class-transformer';
import { Student } from './student.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from './refresh_token.entity';
import { Teacher } from './teacher.entity';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string; // Địa chỉ email (unique)

  @Exclude()
  @Column({ length: 255 })
  password: string; // Mật khẩu (lưu trữ sau khi mã hóa)

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @CreateDateColumn()
  created_at: Date; // Ngày tạo tài khoản

  @UpdateDateColumn()
  updated_at: Date; // Ngày cập nhật thông tin người dùng

  @OneToOne(() => Student, (student) => student.user, { cascade: true })
  student?: Student;

  @OneToOne(() => Teacher, (teacher) => teacher.user, { cascade: true })
  teacher?: Teacher;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
  })
  refreshTokens: RefreshToken[];
}
