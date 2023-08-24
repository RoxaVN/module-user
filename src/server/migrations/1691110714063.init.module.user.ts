import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitModuleUser1691110714063 implements MigrationInterface {
  name = 'InitModuleUser1691110714063';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "identity" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "subject" character varying NOT NULL,
        "type" character varying NOT NULL,
        "userId" uuid NOT NULL,
        "metadata" jsonb,
        "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_aa53ba3fb9039424bba6124e3ac" UNIQUE ("subject", "type"),
        CONSTRAINT "PK_ff16a44186b286d5e626178f726" PRIMARY KEY ("id")
      )
      `);
    await queryRunner.query(`
      CREATE TABLE "access_token" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "authenticator" character varying NOT NULL,
        "token" character varying NOT NULL,
        "ipAddress" character varying NOT NULL,
        "userAgent" character varying,
        "identityId" uuid NOT NULL,
        "userId" uuid NOT NULL,
        "metadata" jsonb,
        "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "expiryDate" TIMESTAMP WITH TIME ZONE NOT NULL,
        CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id")
      )
      `);
    await queryRunner.query(`
      CREATE TABLE "user" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying NOT NULL,
        "metadata" jsonb,
        "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id")
      )
      `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_78a916df40e02a9deb1c4b75ed" ON "user" ("username")
      `);
    await queryRunner.query(`
      CREATE TABLE "user_role" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "scopeId" character varying NOT NULL DEFAULT '',
        "userId" uuid NOT NULL,
        "scope" character varying NOT NULL,
        "roleId" integer NOT NULL,
        "metadata" jsonb,
        "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fb2e442d14add3cefbdf33c4561" PRIMARY KEY ("id")
      )
      `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_99c89742571e394163801ca271" ON "user_role" ("scopeId", "userId", "scope")
      `);
    await queryRunner.query(`
      CREATE TABLE "role" (
        "id" SERIAL NOT NULL,
        "scope" character varying NOT NULL,
        "name" character varying NOT NULL,
        "module" character varying NOT NULL,
        "permissions" text array NOT NULL,
        "hasId" boolean NOT NULL,
        "isPredefined" boolean NOT NULL,
        "metadata" jsonb,
        "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_5b49d0f504f7ef31045a1fb2eb8" UNIQUE ("scope", "name"),
        CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id")
      )
      `);
    await queryRunner.query(`
      ALTER TABLE "identity"
      ADD CONSTRAINT "FK_12915039d2868ab654567bf5181" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
    await queryRunner.query(`
      ALTER TABLE "access_token"
      ADD CONSTRAINT "FK_5dd4aa1254c35e23414d4406f83" FOREIGN KEY ("identityId") REFERENCES "identity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
    await queryRunner.query(`
      ALTER TABLE "access_token"
      ADD CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
    await queryRunner.query(`
      ALTER TABLE "user_role"
      ADD CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
    await queryRunner.query(`
      ALTER TABLE "user_role"
      ADD CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_role" DROP CONSTRAINT "FK_dba55ed826ef26b5b22bd39409b"
      `);
    await queryRunner.query(`
      ALTER TABLE "user_role" DROP CONSTRAINT "FK_ab40a6f0cd7d3ebfcce082131fd"
      `);
    await queryRunner.query(`
      ALTER TABLE "access_token" DROP CONSTRAINT "FK_9949557d0e1b2c19e5344c171e9"
      `);
    await queryRunner.query(`
      ALTER TABLE "access_token" DROP CONSTRAINT "FK_5dd4aa1254c35e23414d4406f83"
      `);
    await queryRunner.query(`
      ALTER TABLE "identity" DROP CONSTRAINT "FK_12915039d2868ab654567bf5181"
      `);
    await queryRunner.query(`
      DROP TABLE "role"
      `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_99c89742571e394163801ca271"
      `);
    await queryRunner.query(`
      DROP TABLE "user_role"
      `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_78a916df40e02a9deb1c4b75ed"
      `);
    await queryRunner.query(`
      DROP TABLE "user"
      `);
    await queryRunner.query(`
      DROP TABLE "access_token"
      `);
    await queryRunner.query(`
      DROP TABLE "identity"
      `);
  }
}
