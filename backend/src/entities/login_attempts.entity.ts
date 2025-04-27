    // src/auth/entities/login-attempt.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('login_attempts')
export class LoginAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column({ default: 0 })
  failed_attempts: number;

  @Column({ type: 'timestamp', nullable: true })
  last_failed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  locked_until: Date;

  @Column({ nullable: true })
  ip_address: string;
}
