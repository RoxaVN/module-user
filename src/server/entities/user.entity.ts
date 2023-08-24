import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';
import { AccessToken } from './access-token.entity.js';
import { Identity } from './identity.entity.js';
import { UserRole } from './user-role.entity.js';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column('character varying')
  username: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;

  @OneToMany(() => Identity, (identity) => identity.user)
  identities: Relation<Identity>[];

  @OneToMany(() => AccessToken, (accessToken) => accessToken.user)
  accessTokens: Relation<Identity>[];

  @OneToMany(() => UserRole, (role) => role.user)
  roles: Relation<UserRole>[];
}
