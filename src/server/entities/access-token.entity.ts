import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { Identity } from './identity.entity.js';
import { User } from './user.entity.js';

@Entity()
export class AccessToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('character varying')
  authenticator: string;

  @Column('character varying')
  token: string;

  @Column('character varying')
  ipAddress: string;

  @Column('character varying', { nullable: true })
  userAgent?: string;

  @Column('uuid')
  identityId: string;

  @ManyToOne(() => Identity, (identity) => identity.accessTokens)
  identity: Relation<Identity>;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.accessTokens)
  user: Relation<User>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;

  @Column({ type: 'timestamptz' })
  expiryDate: Date;
}
