import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPhotoTakenAtToMealRecord1760277736061 implements MigrationInterface {
  name = 'AddPhotoTakenAtToMealRecord1760277736061'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "meal_records" ADD "photoTakenAt" TIMESTAMP`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "meal_records" DROP COLUMN "photoTakenAt"`)
  }
}
