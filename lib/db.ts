import mysql, { type ServerlessMysql } from 'serverless-mysql';
import { SQLStatement } from 'sql-template-strings';

const initializeDB = (database: string | undefined) =>
  mysql({
    config: {
      host: process.env.MYSQL_HOST,
      database,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
    },
  });

const updateDatabase = initializeDB(process.env.MYSQL_UPDATE_DATABASE);

const bbDatabase = initializeDB(process.env.MYSQL_BB_DATABASE);

const getQueryFn =
  (db: ServerlessMysql) =>
  async <T extends unknown>(
    query: SQLStatement,
  ): Promise<T[] | { error: unknown }> => {
    try {
      const results: T[] = await db.query(query);
      await db.end();
      return results;
    } catch (error) {
      return { error };
    }
  };

const getTransactionFn = (db: ServerlessMysql) => {
  return db.transaction;
};

const getEndFn = (db: ServerlessMysql) => {
  return db.end;
};

export const query = getQueryFn(updateDatabase);

export const userQuery = getQueryFn(bbDatabase);

export const transaction = getTransactionFn(updateDatabase);

export const endTransaction = getEndFn(updateDatabase);
