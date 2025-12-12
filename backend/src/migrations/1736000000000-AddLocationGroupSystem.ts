import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLocationGroupSystem1736000000000 implements MigrationInterface {
  name = 'AddLocationGroupSystem1736000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. location_groups 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "location_groups" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "canonicalName" character varying(255) NOT NULL,
        "latitude" numeric(10,7) NOT NULL,
        "longitude" numeric(10,7) NOT NULL,
        "address" character varying,
        "category" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_location_groups" PRIMARY KEY ("id")
      )
    `)

    // 2. user_locations 테이블 생성
    await queryRunner.query(`
      CREATE TABLE "user_locations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "locationGroupId" uuid NOT NULL,
        "name" character varying(255) NOT NULL,
        "address" character varying,
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "isCustom" boolean NOT NULL DEFAULT false,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_locations" PRIMARY KEY ("id")
      )
    `)

    // 3. external_place_mappings 테이블 생성
    await queryRunner.query(`
      CREATE TYPE "external_place_mappings_platform_enum" AS ENUM('kakao', 'naver', 'google', 'instagram')
    `)

    await queryRunner.query(`
      CREATE TABLE "external_place_mappings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "locationGroupId" uuid NOT NULL,
        "platform" "external_place_mappings_platform_enum" NOT NULL,
        "externalId" character varying(255) NOT NULL,
        "externalName" character varying(500) NOT NULL,
        "externalData" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_external_place_mappings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_location_platform_external" UNIQUE ("locationGroupId", "platform", "externalId")
      )
    `)

    // 4. user_locations 인덱스 생성
    await queryRunner.query(`
      CREATE INDEX "IDX_user_locations_userId" ON "user_locations" ("userId")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_user_locations_locationGroupId" ON "user_locations" ("locationGroupId")
    `)

    // 5. external_place_mappings 인덱스 생성
    await queryRunner.query(`
      CREATE INDEX "IDX_external_place_mappings_platform" ON "external_place_mappings" ("platform")
    `)
    await queryRunner.query(`
      CREATE INDEX "IDX_external_place_mappings_externalId" ON "external_place_mappings" ("externalId")
    `)

    // 6. meal_records에 userLocationId 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE "meal_records" ADD "userLocationId" uuid
    `)

    // 7. Foreign Key 제약 조건 추가
    await queryRunner.query(`
      ALTER TABLE "user_locations"
      ADD CONSTRAINT "FK_user_locations_userId"
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "user_locations"
      ADD CONSTRAINT "FK_user_locations_locationGroupId"
      FOREIGN KEY ("locationGroupId") REFERENCES "location_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "external_place_mappings"
      ADD CONSTRAINT "FK_external_place_mappings_locationGroupId"
      FOREIGN KEY ("locationGroupId") REFERENCES "location_groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "meal_records"
      ADD CONSTRAINT "FK_meal_records_userLocationId"
      FOREIGN KEY ("userLocationId") REFERENCES "user_locations"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Foreign Keys 제거
    await queryRunner.query(`
      ALTER TABLE "meal_records" DROP CONSTRAINT "FK_meal_records_userLocationId"
    `)
    await queryRunner.query(`
      ALTER TABLE "external_place_mappings" DROP CONSTRAINT "FK_external_place_mappings_locationGroupId"
    `)
    await queryRunner.query(`
      ALTER TABLE "user_locations" DROP CONSTRAINT "FK_user_locations_locationGroupId"
    `)
    await queryRunner.query(`
      ALTER TABLE "user_locations" DROP CONSTRAINT "FK_user_locations_userId"
    `)

    // meal_records 컬럼 제거
    await queryRunner.query(`
      ALTER TABLE "meal_records" DROP COLUMN "userLocationId"
    `)

    // 인덱스 제거
    await queryRunner.query(`DROP INDEX "IDX_external_place_mappings_externalId"`)
    await queryRunner.query(`DROP INDEX "IDX_external_place_mappings_platform"`)
    await queryRunner.query(`DROP INDEX "IDX_user_locations_locationGroupId"`)
    await queryRunner.query(`DROP INDEX "IDX_user_locations_userId"`)

    // 테이블 제거
    await queryRunner.query(`DROP TABLE "external_place_mappings"`)
    await queryRunner.query(`DROP TYPE "external_place_mappings_platform_enum"`)
    await queryRunner.query(`DROP TABLE "user_locations"`)
    await queryRunner.query(`DROP TABLE "location_groups"`)
  }
}
