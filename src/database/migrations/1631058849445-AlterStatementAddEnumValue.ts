import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AlterStatementAddEnumValue1631058849445
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "type");
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["transfer", "withdraw", "deposit"],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn("statements", "type");
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "type",
        type: "enum",
        enum: ["deposit", "withdraw"],
      })
    );
  }
}
