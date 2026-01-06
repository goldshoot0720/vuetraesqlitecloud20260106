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
        <div class="tool-grid">
          <div class="tool-group">
            <div class="group-title">初始化</div>
            <div class="group-desc">建立 subscription、food 資料表</div>
            <div class="group-actions">
              <button class="btn primary" @click="initSqliteTables">初始化資料表</button>
            </div>
          </div>
          <div class="tool-group">
            <div class="group-title">CSV 下載</div>
            <div class="group-desc">匯出目前資料為 CSV</div>
            <div class="group-actions">
              <button class="btn" @click="downloadFoodCsv">下載 sqlitecloudfood.csv</button>
              <button class="btn" @click="downloadSubscriptionCsv">下載 sqlitecloudsubscription.csv</button>
            </div>
          </div>
          <div class="tool-group">
            <div class="group-title">CSV 上傳</div>
            <div class="group-desc">將 CSV 匯入資料庫</div>
            <div class="group-actions">
              <button class="btn" @click="triggerFoodUpload">上傳 sqlitecloudfood.csv</button>
              <button class="btn" @click="triggerSubscriptionUpload">上傳 sqlitecloudsubscription.csv</button>
            </div>
          </div>
        </div>
        <input ref="foodFile" type="file" accept=".csv" style="display:none" @change="onFoodCsvSelected" />
        <input ref="subscriptionFile" type="file" accept=".csv" style="display:none" @change="onSubscriptionCsvSelected" />
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
const foodFile = ref(null);
const subscriptionFile = ref(null);

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
    // Ensure database exists
    await sqliteService.createDatabase();
    
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

const toCsvValue = (val) => {
  if (val === null || val === undefined) return '';
  const s = String(val);
  const needQuotes = s.includes(',') || s.includes('\n') || s.includes('"');
  const escaped = s.replace(/"/g, '""');
  return needQuotes ? `"${escaped}"` : escaped;
};

const exportCsv = (rows, headers, filename) => {
  const headerLine = headers.join(',');
  const dataLines = rows.map(row => headers.map(h => toCsvValue(row[h])).join(','));
  const csv = [headerLine, ...dataLines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadFoodCsv = async () => {
  try {
    const db = await sqliteService.getDatabase();
    const rows = await db.sql`SELECT id, name, amount, price, shop, todate, photo FROM food ORDER BY todate ASC`;
    const headers = ['id','name','amount','price','shop','todate','photo'];
    exportCsv(rows, headers, 'sqlitecloudfood.csv');
  } catch (error) {
    console.error('下載 food CSV 失敗：', error);
    alert('下載 food CSV 失敗：' + error.message);
  }
};

const downloadSubscriptionCsv = async () => {
  try {
    const db = await sqliteService.getDatabase();
    const rows = await db.sql`SELECT id, name, price, nextdate, site, note FROM subscription ORDER BY nextdate ASC`;
    const headers = ['id','name','price','nextdate','site','note'];
    exportCsv(rows, headers, 'sqlitecloudsubscription.csv');
  } catch (error) {
    console.error('下載 subscription CSV 失敗：', error);
    alert('下載 subscription CSV 失敗：' + error.message);
  }
};

const parseCsvText = (text) => {
  const rows = [];
  let i = 0;
  let field = '';
  let record = [];
  let inQuotes = false;
  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        } else {
          inQuotes = false;
          i += 1;
          continue;
        }
      } else {
        field += c;
        i += 1;
        continue;
      }
    } else {
      if (c === '"') {
        inQuotes = true;
        i += 1;
        continue;
      }
      if (c === ',') {
        record.push(field);
        field = '';
        i += 1;
        continue;
      }
      if (c === '\n') {
        record.push(field);
        rows.push(record);
        record = [];
        field = '';
        i += 1;
        continue;
      }
      if (c === '\r') {
        i += 1;
        continue;
      }
      field += c;
      i += 1;
    }
  }
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    rows.push(record);
  }
  return rows;
};

const toNumberOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === '') return null;
  const n = Number(s);
  if (Number.isNaN(n)) return null;
  return n;
};

const toTextOrNull = (v) => {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' ? null : s;
};

const triggerFoodUpload = () => {
  if (foodFile.value) foodFile.value.value = '';
  foodFile.value?.click();
};

const triggerSubscriptionUpload = () => {
  if (subscriptionFile.value) subscriptionFile.value.value = '';
  subscriptionFile.value?.click();
};

const onFoodCsvSelected = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    await sqliteService.createDatabase();
    const db = await sqliteService.getDatabase();
    const text = await file.text();
    const grid = parseCsvText(text).filter(r => r.length && r.some(x => String(x).trim() !== ''));
    if (grid.length === 0) {
      alert('CSV 為空');
      return;
    }
    const headers = grid[0].map(x => String(x).trim());
    const expected = ['id','name','amount','price','shop','todate','photo'];
    const hasAll = expected.every(h => headers.includes(h));
    if (!hasAll) {
      alert('CSV 欄位不符合：需要 ' + expected.join(','));
      return;
    }
    const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
    let inserted = 0;
    for (let r = 1; r < grid.length; r++) {
      const row = grid[r];
      const name = toTextOrNull(row[idx['name']]);
      const amount = toNumberOrNull(row[idx['amount']]);
      const price = toNumberOrNull(row[idx['price']]);
      const shop = toTextOrNull(row[idx['shop']]);
      const todate = toTextOrNull(row[idx['todate']]);
      const photo = toTextOrNull(row[idx['photo']]);
      await db.sql`INSERT INTO food (name, amount, price, shop, todate, photo) VALUES (${name}, ${amount}, ${price}, ${shop}, ${todate}, ${photo})`;
      inserted += 1;
    }
    alert('food 匯入完成：' + inserted + ' 筆');
  } catch (error) {
    console.error('上傳 food CSV 失敗：', error);
    alert('上傳 food CSV 失敗：' + error.message);
  }
};

const onSubscriptionCsvSelected = async (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  try {
    await sqliteService.createDatabase();
    const db = await sqliteService.getDatabase();
    const text = await file.text();
    const grid = parseCsvText(text).filter(r => r.length && r.some(x => String(x).trim() !== ''));
    if (grid.length === 0) {
      alert('CSV 為空');
      return;
    }
    const headers = grid[0].map(x => String(x).trim());
    const expected = ['id','name','price','nextdate','site','note'];
    const hasAll = expected.every(h => headers.includes(h));
    if (!hasAll) {
      alert('CSV 欄位不符合：需要 ' + expected.join(','));
      return;
    }
    const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
    let inserted = 0;
    for (let r = 1; r < grid.length; r++) {
      const row = grid[r];
      const name = toTextOrNull(row[idx['name']]);
      const price = toNumberOrNull(row[idx['price']]);
      const nextdate = toTextOrNull(row[idx['nextdate']]);
      const site = toTextOrNull(row[idx['site']]);
      const note = toTextOrNull(row[idx['note']]);
      await db.sql`INSERT INTO subscription (name, price, nextdate, site, note) VALUES (${name}, ${price}, ${nextdate}, ${site}, ${note})`;
      inserted += 1;
    }
    alert('subscription 匯入完成：' + inserted + ' 筆');
  } catch (error) {
    console.error('上傳 subscription CSV 失敗：', error);
    alert('上傳 subscription CSV 失敗：' + error.message);
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

<style scoped>
.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
  margin-top: 8px;
}
.tool-group {
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 16px;
}
.group-title {
  font-weight: 600;
  color: #111827;
}
.group-desc {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
  margin-bottom: 10px;
}
.group-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
