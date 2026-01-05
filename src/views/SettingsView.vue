<template>
  <section class="page">
    <div class="header">
      <div class="badge">⚙️</div>
      <h2>系統設定</h2>
    </div>

    <div class="content">
      <div class="card">
        <h3>SQLite Cloud 連線設定</h3>
        <p class="desc">請輸入您的 SQLite Cloud 連線資訊。</p>
        
        <div class="form-group">
          <label>Connection Host (e.g. host:port)</label>
          <div class="input-wrapper">
            <input type="text" v-model="host" placeholder="cmk0dgzqhk.g2.sqlite.cloud:8860" />
            <button class="copy-btn" @click="copyToClipboard(host)">複製</button>
          </div>
        </div>

        <div class="form-group">
          <label>Database Name</label>
          <div class="input-wrapper">
            <input type="text" v-model="dbName" placeholder="sqlitegoldshoot0720" />
            <button class="copy-btn" @click="copyToClipboard(dbName)">複製</button>
          </div>
        </div>

        <div class="form-group">
          <label>API Key</label>
          <div class="input-wrapper">
            <input type="text" v-model="apiKey" placeholder="API Key" />
            <button class="copy-btn" @click="copyToClipboard(apiKey)">複製</button>
          </div>
        </div>

        <div class="actions">
          <button class="btn primary" @click="saveSettings">儲存設定</button>
        </div>
      </div>

      <div class="card" style="margin-top: 20px;">
        <h3>資料結構管理 (SQLite)</h3>
        <p class="desc">管理 SQLite Cloud 資料庫結構。</p>
        
        <div class="actions" style="justify-content: flex-start; gap: 12px;">
          <button class="btn" @click="initSqliteTables">初始化 SQLite Tables</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import sqliteService from '../services/sqlite';

const host = ref('');
const dbName = ref('');
const apiKey = ref('');

onMounted(() => {
  host.value = localStorage.getItem('sqlite_host') || 'cmk0dgzqhk.g2.sqlite.cloud:8860';
  dbName.value = localStorage.getItem('sqlite_db_name') || 'sqlitegoldshoot0720';
  apiKey.value = localStorage.getItem('sqlite_api_key') || 'tFponRnK20mvO37gEImnuRCuVLDFvydAbbopxaVkXPg';
});

const saveSettings = () => {
  localStorage.setItem('sqlite_host', host.value);
  localStorage.setItem('sqlite_db_name', dbName.value);
  localStorage.setItem('sqlite_api_key', apiKey.value);
  alert('設定已儲存，頁面將重新載入以生效。');
  window.location.reload();
};

const initSqliteTables = async () => {
  if (!confirm('確定要初始化 SQLite 資料表嗎？這將建立 subscription 和 food 資料表 (如果不存在)。')) return;
  try {
    const db = await sqliteService.getDatabase();
    
    // Create Subscription Table
    await db.sql`CREATE TABLE IF NOT EXISTS subscription (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      price REAL,
      nextdate TEXT,
      site TEXT,
      note TEXT
    );`;
    
    // Create Food Table
    await db.sql`CREATE TABLE IF NOT EXISTS food (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      amount INTEGER,
      price REAL,
      shop TEXT,
      todate TEXT,
      photo TEXT
    );`;
    
    alert('subscription 和 food 資料表初始化成功！');
  } catch (error) {
    console.error('Initialization error:', error);
    alert('初始化失敗：' + error.message);
  }
};

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    alert('已複製到剪貼簿');
  }).catch(err => {
    console.error('複製失敗:', err);
  });
};
</script>

<style scoped>
.page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}

.badge {
  width: 40px;
  height: 40px;
  background: #e0e7ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

h2 {
  margin: 0;
  color: #1a1a1a;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h3 {
  margin: 0 0 8px 0;
  color: #374151;
}

.desc {
  margin: 0 0 24px 0;
  color: #6b7280;
  font-size: 14px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.copy-btn {
  padding: 8px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-btn:hover {
  background: #e5e7eb;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn.primary {
  background: #6366f1;
  color: white;
}

.btn.primary:hover {
  background: #4f46e5;
}
</style>
