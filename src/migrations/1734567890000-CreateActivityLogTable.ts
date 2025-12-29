import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableForeignKey,
} from 'typeorm';

export class CreateActivityLogTable1734567890000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'activity_log',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'actionType',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'method',
            type: 'varchar',
            length: '10',
          },
          {
            name: 'endpoint',
            type: 'varchar',
            length: '500',
          },
          {
            name: 'userId',
            type: 'varchar',
            length: '14',
            isNullable: true,
          },
          {
            name: 'userEmail',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'userRoles',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'branchID',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'entityType',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'entityId',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'statusCode',
            type: 'int',
          },
          {
            name: 'ipAddress',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'userAgent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'timestamp',
            type: 'timestamp',
          },
          {
            name: 'metadata',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex(
      'activity_log',
      new TableIndex({
        name: 'IDX_activity_log_userId_timestamp',
        columnNames: ['userId', 'timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'activity_log',
      new TableIndex({
        name: 'IDX_activity_log_actionType_timestamp',
        columnNames: ['actionType', 'timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'activity_log',
      new TableIndex({
        name: 'IDX_activity_log_entityType_timestamp',
        columnNames: ['entityType', 'timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'activity_log',
      new TableIndex({
        name: 'IDX_activity_log_branchID_timestamp',
        columnNames: ['branchID', 'timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'activity_log',
      new TableIndex({
        name: 'IDX_activity_log_timestamp',
        columnNames: ['timestamp'],
      }),
    );

    await queryRunner.createIndex(
      'activity_log',
      new TableIndex({
        name: 'IDX_activity_log_actionType',
        columnNames: ['actionType'],
      }),
    );

    // Create foreign keys
    await queryRunner.createForeignKey(
      'activity_log',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'profile',
        onDelete: 'SET NULL',
        name: 'FK_activity_log_userId',
      }),
    );

    await queryRunner.createForeignKey(
      'activity_log',
      new TableForeignKey({
        columnNames: ['branchID'],
        referencedColumnNames: ['id'],
        referencedTableName: 'branch',
        onDelete: 'SET NULL',
        name: 'FK_activity_log_branchID',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('activity_log');
    if (table) {
      const foreignKeyUserId = table.foreignKeys.find(
        (fk) => fk.name === 'FK_activity_log_userId',
      );
      if (foreignKeyUserId) {
        await queryRunner.dropForeignKey('activity_log', foreignKeyUserId);
      }

      const foreignKeyBranchID = table.foreignKeys.find(
        (fk) => fk.name === 'FK_activity_log_branchID',
      );
      if (foreignKeyBranchID) {
        await queryRunner.dropForeignKey('activity_log', foreignKeyBranchID);
      }
    }

    // Drop indexes
    await queryRunner.dropIndex(
      'activity_log',
      'IDX_activity_log_userId_timestamp',
    );
    await queryRunner.dropIndex(
      'activity_log',
      'IDX_activity_log_actionType_timestamp',
    );
    await queryRunner.dropIndex(
      'activity_log',
      'IDX_activity_log_entityType_timestamp',
    );
    await queryRunner.dropIndex(
      'activity_log',
      'IDX_activity_log_branchID_timestamp',
    );
    await queryRunner.dropIndex('activity_log', 'IDX_activity_log_timestamp');
    await queryRunner.dropIndex('activity_log', 'IDX_activity_log_actionType');

    // Drop table
    await queryRunner.dropTable('activity_log');
  }
}
