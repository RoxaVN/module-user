import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { AccessToken } from './access-token.entity.js';
import { User } from './user.entity.js';

@Entity()
@Unique(['subject', 'type'])
export class Identity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('character varying')
  subject: string;

  @Column('character varying')
  type: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, (user) => user.identities)
  user: Relation<User>;

  @OneToMany(() => AccessToken, (accessToken) => accessToken.identity)
  accessTokens: Relation<Identity>[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedDate: Date;
}
