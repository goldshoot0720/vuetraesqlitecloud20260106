<template>
  <div class="sqlite-demo">
    <h1>SQLite Cloud Demo</h1>
    <p>Connected to: {{ connectionInfo }}</p>
    
    <div v-if="loading" class="loading">Loading data...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    
    <div v-else>
      <h2>Query Result</h2>
      <div v-if="data.length === 0">No data found or empty table.</div>
      <table v-else>
        <thead>
          <tr>
            <th v-for="key in Object.keys(data[0])" :key="key">{{ key }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in data" :key="index">
            <td v-for="key in Object.keys(row)" :key="key">{{ row[key] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import sqliteService from '../services/sqlite';

const data = ref([]);
const loading = ref(true);
const error = ref(null);
const connectionInfo = ref('');

onMounted(async () => {
  try {
    const db = await sqliteService.getDatabase();
    connectionInfo.value = sqliteService.dbName;
    
    // Example query: List all tables in the database
    // This is a safe default query since we don't know the exact schema of the user's DB
    const result = await db.sql`SELECT name FROM sqlite_master WHERE type='table'`;
    data.value = result;
  } catch (err) {
    console.error('SQLite Error:', err);
    error.value = 'Failed to fetch data: ' + err.message;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.sqlite-demo {
  padding: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f4f4f4;
}

.error {
  color: red;
  margin-top: 20px;
}

.loading {
  color: #666;
  margin-top: 20px;
}
</style>
