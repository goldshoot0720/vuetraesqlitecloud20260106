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
      if (dbPath && !dbPath.endsWith('.db')) {
        dbPath += '.db';
      }
      
      this.connectionStr = `sqlitecloud://${host}/${dbPath}?apikey=${apiKey}`;
      this.db = new Database(this.connectionStr);
    } else {
      console.warn('SQLite Cloud credentials not found.');
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
