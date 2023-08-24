import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity.js';

@Entity()
@Unique(['scope', 'name'])
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying')
  scope: string;

  @Column('character varying')
  name: string;

  @Column('character varying')
  module: string;

  @Column('text', { array: true })
  permissions: string[];

  @Column('boolean')
  hasId: boolean;

  @Column('boolean')
  isPredefined: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;

  @OneToMany(() => UserRole, (role) => role.user)
  users: Relation<UserRole>[];
}
