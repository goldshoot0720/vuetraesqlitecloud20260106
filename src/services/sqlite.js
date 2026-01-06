import { Database } from '@sqlitecloud/drivers';

class SQLiteService {
  constructor() {
    this.db = null;
    this.connectionStr = null;
    this.dbName = null;
  }

  init() {
    const host = localStorage.getItem('sqlite_host') || 'cmk0dgzqhk.g2.sqlite.cloud:8860';
    const apiKey = localStorage.getItem('sqlite_api_key') || 'tFponRnK20mvO37gEImnuRCuVLDFvydAbbopxaVkXPg';
    this.dbName = localStorage.getItem('sqlite_db_name') || 'sqlitegoldshoot0720';

    if (host && apiKey) {
      // Construct the connection string with database name if available
      // User requested format: sqlitecloud://host/dbname.db?apikey=key
      let dbPath = this.dbName;
      if (dbPath && !dbPath.endsWith('.db') && !dbPath.endsWith('.sqlite')) {
        dbPath += '.sqlite';
      }
      
      this.connectionStr = `sqlitecloud://${host}/${dbPath}?apikey=${apiKey}`;
      this.db = new Database(this.connectionStr);
    } else {
      console.warn('SQLite Cloud credentials not found.');
    }
  }

  async createDatabase() {
    const host = localStorage.getItem('sqlite_host') || 'cmk0dgzqhk.g2.sqlite.cloud:8860';
    const apiKey = localStorage.getItem('sqlite_api_key') || 'tFponRnK20mvO37gEImnuRCuVLDFvydAbbopxaVkXPg';
    let dbName = localStorage.getItem('sqlite_db_name') || 'sqlitegoldshoot0720';

    if (!host || !apiKey || !dbName) return;

    if (dbName && !dbName.endsWith('.db') && !dbName.endsWith('.sqlite')) {
      dbName += '.sqlite';
    }

    // Connect without database to perform CREATE DATABASE
    const adminConnStr = `sqlitecloud://${host}?apikey=${apiKey}`;
    const adminDb = new Database(adminConnStr);

    try {
      // Try to create database (CREATE DATABASE IF NOT EXISTS is not supported by all drivers/versions)
      // So we use CREATE DATABASE and ignore "already exists" error
      await adminDb.sql(`CREATE DATABASE ${dbName}`);
    } catch (error) {
      // errorCode for "Database already exists" might vary, but usually we can ignore creation errors
      // if the goal is just to ensure it exists.
      console.warn('Create database warning (might already exist):', error);
    }
  }

  async getDatabase() {
    if (!this.db) {
      this.init();
    }
    // Database is selected via connection string, so we might not need explicit USE
    // unless the connection string didn't work or we need to switch.
    return this.db;
  }
}

const sqliteService = new SQLiteService();
export default sqliteService;
