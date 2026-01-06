<template>
  <section class="home">
    <div class="hero">
      <div class="logo">鋒</div>
      <h1 class="title">鋒兄AI資訊系統</h1>
      <p class="subtitle">智能管理您的影片和圖片收藏 · 支援智能分類和快速搜尋</p>
      <div class="copyright">鋒兄塗哥公關資訊© 版權所有 2025 ~ 2125</div>
      <div class="tech">
        <div class="card">
          <div class="card-title">⚡ 前端技術</div>
          <ul class="list">
            <li>Vue 3 (Vite)</li>
            <li>網頁存放於 Local</li>
            <li>響應式設計 + CSS</li>
          </ul>
        </div>
        <div class="card">
          <div class="card-title">🚀 後端技術</div>
          <ul class="list">
            <li>Back4app（Parse）</li>
            <li>資料存放於 Back4app</li>
            <li>RESTful API + Parse SDK</li>
          </ul>
        </div>
      </div>
    </div>
    <div class="dashboard">
      <div class="panel">
        <div class="panel-title">🧾 訂閱管理 <button class="mini-btn" @click="fetchDashboard">重新整理</button></div>
        <div class="stats">
          <div class="stat">
            <div class="label">項目數</div>
            <div class="value">{{ subscriptionTotal }}</div>
          </div>
          <div class="stat">
            <div class="label">7天提醒</div>
            <div class="value">{{ subscription7 }}</div>
            <div class="hint">最近：{{ subscription7Date }}</div>
          </div>
          <div class="stat">
            <div class="label">30天提醒</div>
            <div class="value">{{ subscription30 }}</div>
            <div class="hint">最近：{{ subscription30Date }}</div>
          </div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">🍎 食品管理 <button class="mini-btn" @click="fetchDashboard">重新整理</button></div>
        <div class="stats">
          <div class="stat">
            <div class="label">項目數</div>
            <div class="value">{{ foodTotal }}</div>
          </div>
          <div class="stat">
            <div class="label">3天提醒</div>
            <div class="value">{{ food3 }}</div>
            <div class="hint">最近：{{ food3Date }}</div>
          </div>
          <div class="stat">
            <div class="label">7天提醒</div>
            <div class="value">{{ food7 }}</div>
            <div class="hint">最近：{{ food7Date }}</div>
          </div>
        </div>
      </div>
    </div>
    <div class="section-title">☀️ 系統功能選單</div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import sqliteService from '../services/sqlite';

const subscriptionTotal = ref(0);
const subscription7 = ref(0);
const subscription30 = ref(0);
const subscription7Date = ref('-');
const subscription30Date = ref('-');
const foodTotal = ref(0);
const food3 = ref(0);
const food7 = ref(0);
const food3Date = ref('-');
const food7Date = ref('-');

const addDays = (base, days) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const formatDate = (d) => {
  if (!d) return '-';
  const x = new Date(d);
  return x.toLocaleDateString();
};

const fetchDashboard = async () => {
  try {
    const db = await sqliteService.getDatabase();
    const subTotal = await db.sql`SELECT COUNT(*) AS c FROM subscription`;
    subscriptionTotal.value = subTotal?.[0]?.c || 0;
    const sub7Cnt = await db.sql`SELECT COUNT(*) AS c FROM subscription WHERE date(nextdate) >= date('now') AND date(nextdate) <= date('now','+7 day')`;
    subscription7.value = sub7Cnt?.[0]?.c || 0;
    const sub7Min = await db.sql`SELECT nextdate FROM subscription WHERE date(nextdate) >= date('now') AND date(nextdate) <= date('now','+7 day') ORDER BY date(nextdate) ASC LIMIT 1`;
    subscription7Date.value = sub7Min?.[0]?.nextdate ? formatDate(sub7Min[0].nextdate) : '-';
    const sub30Cnt = await db.sql`SELECT COUNT(*) AS c FROM subscription WHERE date(nextdate) >= date('now') AND date(nextdate) <= date('now','+30 day')`;
    subscription30.value = sub30Cnt?.[0]?.c || 0;
    const sub30Min = await db.sql`SELECT nextdate FROM subscription WHERE date(nextdate) >= date('now') AND date(nextdate) <= date('now','+30 day') ORDER BY date(nextdate) ASC LIMIT 1`;
    subscription30Date.value = sub30Min?.[0]?.nextdate ? formatDate(sub30Min[0].nextdate) : '-';
    const foodTotalCnt = await db.sql`SELECT COUNT(*) AS c FROM food`;
    foodTotal.value = foodTotalCnt?.[0]?.c || 0;
    const food3Cnt = await db.sql`SELECT COUNT(*) AS c FROM food WHERE date(todate) >= date('now') AND date(todate) <= date('now','+3 day')`;
    food3.value = food3Cnt?.[0]?.c || 0;
    const food3Min = await db.sql`SELECT todate FROM food WHERE date(todate) >= date('now') AND date(todate) <= date('now','+3 day') ORDER BY date(todate) ASC LIMIT 1`;
    food3Date.value = food3Min?.[0]?.todate ? formatDate(food3Min[0].todate) : '-';
    const food7Cnt = await db.sql`SELECT COUNT(*) AS c FROM food WHERE date(todate) >= date('now') AND date(todate) <= date('now','+7 day')`;
    food7.value = food7Cnt?.[0]?.c || 0;
    const food7Min = await db.sql`SELECT todate FROM food WHERE date(todate) >= date('now') AND date(todate) <= date('now','+7 day') ORDER BY date(todate) ASC LIMIT 1`;
    food7Date.value = food7Min?.[0]?.todate ? formatDate(food7Min[0].todate) : '-';
  } catch (e) {
    console.error('Dashboard fetch error', e);
  }
};

onMounted(() => {
  fetchDashboard();
});
</script>

<style scoped>
.home {
  color: #fff;
}
.hero {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  max-width: 980px;
  margin: 0 auto;
}
.logo {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  background: #ff5a5f;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin-bottom: 12px;
}
.title {
  font-size: 32px;
  margin-bottom: 8px;
}
.subtitle {
  opacity: 0.95;
  margin-bottom: 8px;
}
.copyright {
  font-size: 14px;
  opacity: 0.85;
  margin-bottom: 20px;
}
.tech {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  text-align: left;
}
.card-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.list {
  padding-left: 18px;
}
.section-title {
  text-align: center;
  margin-top: 24px;
  font-weight: 600;
}
@media (max-width: 680px) {
  .tech {
    grid-template-columns: 1fr;
  }
}
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  max-width: 980px;
  margin: 18px auto 0;
}
.panel {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
}
.panel-title {
  font-weight: 600;
  margin-bottom: 8px;
}
.mini-btn {
  margin-left: 8px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: rgba(255,255,255,0.2);
  color: #fff;
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.stat {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 12px;
  text-align: center;
}
.stat .label {
  font-size: 13px;
  opacity: 0.9;
}
.stat .value {
  font-size: 22px;
  font-weight: 700;
}
.stat .hint {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.9;
}
@media (max-width: 680px) {
  .dashboard {
    grid-template-columns: 1fr;
  }
  .stats {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
