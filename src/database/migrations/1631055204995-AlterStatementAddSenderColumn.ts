import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from "typeorm";

export class AlterStatementAddSenderColumn1631055204995
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      "statements",
      new TableColumn({
        name: "sender_id",
        type: "uuid",
        isNullable: true,
      })
    );

    await queryRunner.createForeignKey(
      "statements",
      new TableForeignKey({
        name: "FKSenderStatement",
        columnNames: ["sender_id"],
        referencedColumnNames: ["id"],
        referencedTableName: "users",
        onDelete: "SET NULL",
        onUpdate: "SET NULL",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey("statements", "FKSenderStatement");
    await queryRunner.dropColumn("statements", "sender_id");
  }
}
