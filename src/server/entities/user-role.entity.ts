import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  type Relation,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from 'typeorm';
import { Role } from './role.entity.js';
import { User } from './user.entity.js';

@Entity()
@Index(['scopeId', 'userId', 'scope'], { unique: true })
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('character varying', { default: '' })
  scopeId: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.roles)
  user: Relation<User>;

  // cache scope value for better query
  @Column('character varying')
  scope: string;

  @Column('integer')
  roleId: number;

  @ManyToOne(() => Role, (role) => role.users)
  role: Relation<Role>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;
}
