import { DateTime } from 'luxon';
import { QueryRunner, MigrationInterface } from 'typeorm';

export class Sql1783980000000 implements MigrationInterface {
  #year = 2025;
  #month = 1;
  #tables = [
    'alert',
    'audit_log',
    'user_auth_session',
    'user_notification',
    'wallet_transaction',
    'wallet_transaction_history',
    'payment_transaction',
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    while (this.#year < 2035) {
      while (this.#month < 13) {
        const date = DateTime.now().set({ year: this.#year, month: this.#month });

        const start = date.startOf('month').toFormat('yyyy-LL-dd 00:00:00.000');
        const end = date.endOf('month').toFormat('yyyy-LL-dd 23:59:59.999');
        const suffix = `${this.#year}_${date.toFormat('LL')}`;

        for (const table of this.#tables) {
          await queryRunner.query(`
            CREATE TABLE ${table}_${suffix} PARTITION OF ${table}
            FOR VALUES FROM ('${start}') TO ('${end}')
          `);
        }

        this.#month++;
      }
      this.#month = 1;
      this.#year++;
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    while (this.#year < 2035) {
      while (this.#month < 13) {
        const date = DateTime.now().set({ year: this.#year, month: this.#month });
        const suffix = `${this.#year}_${date.toFormat('LL')}`;

        for (const table of this.#tables) {
          await queryRunner.query(`
            DROP TABLE ${table}_${suffix}`);
        }

        this.#month++;
      }
      this.#month = 1;
      this.#year++;
    }
  }
}
