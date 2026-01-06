<script setup>
import { RouterView } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="app-shell">
    <Sidebar />
    <div class="content">
      <header class="topbar">歡迎使用鋒兄AI資訊系統</header>
      <main class="main">
        <RouterView />
      </main>
    </div>
  </div>
  <div class="bg"></div>
</template>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
}
.content {
  margin-left: 240px;
  width: calc(100% - 240px);
  display: flex;
  flex-direction: column;
}
.topbar {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  color: #fff;
}
.main {
  padding: 24px;
}
.bg {
  position: fixed;
  inset: 0;
  background: radial-gradient(1200px 600px at 60% 10%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, #5a64e0 0%, #7b66e8 40%, #865fe6 100%);
  z-index: -1;
}
@media (max-width: 900px) {
  .content {
    margin-left: 72px;
    width: calc(100% - 72px);
  }
}
@media (max-width: 600px) {
  .content {
    margin-left: 0;
    width: 100%;
    padding-bottom: 70px; /* Space for bottom nav */
  }
  .topbar {
    padding: 0 16px;
  }
  .main {
    padding: 16px;
  }
}
</style>
