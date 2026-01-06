<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <div class="brand">
        <div class="brand-badge">鋒</div>
        <div class="brand-name">鋒兄AI系統</div>
      </div>
      <button class="close-btn" @click="$emit('close')">×</button>
    </div>
    <nav class="menu">
      <RouterLink to="/" class="item"><span class="icon">🏠</span><span class="text">首頁</span></RouterLink>
      <RouterLink to="/images" class="item"><span class="icon">🖼️</span><span class="text">圖片庫</span></RouterLink>
      <RouterLink to="/videos" class="item"><span class="icon">🎬</span><span class="text">影片庫</span></RouterLink>
      <RouterLink to="/lyrics" class="item"><span class="icon">🎵</span><span class="text">鋒兄音樂歌詞</span></RouterLink>
      <RouterLink to="/subscriptions" class="item"><span class="icon">📋</span><span class="text">訂閱管理</span></RouterLink>
      <RouterLink to="/foods" class="item"><span class="icon">🍎</span><span class="text">食品管理</span></RouterLink>
      <RouterLink to="/settings" class="item"><span class="icon">⚙️</span><span class="text">系統設定</span></RouterLink>
    </nav>
  </aside>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 240px;
  background: linear-gradient(180deg, #5f5bd7 0%, #7758e1 60%, #8a5fe6 100%);
  color: #fff;
  padding: 24px 16px;
}
.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
}
.brand-badge {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: #ff5a5f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.brand-name {
  font-size: 16px;
  font-weight: 600;
}
.menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #fff;
}
.item.router-link-active {
  background: rgba(255, 255, 255, 0.22);
}
.icon {
  width: 22px;
  text-align: center;
}
.text.mobile {
  display: none;
}
@media (max-width: 900px) {
  .sidebar {
    width: 72px;
    padding: 24px 8px;
  }
  .brand-name {
    display: none;
  }
  .sidebar-header {
    justify-content: center;
    margin-bottom: 24px;
  }
  .brand {
    justify-content: center;
    margin-bottom: 0;
  }
  .text {
    display: none;
  }
  .item {
    justify-content: center;
    padding: 10px 0;
  }
  .icon {
    font-size: 20px;
  }
}

@media (max-width: 600px) {
  .sidebar {
    width: 250px;
    height: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    padding: 24px 16px;
    display: block;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1000;
  }
  .sidebar.open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0,0,0,0.4);
  }
  .brand {
    display: flex;
  }
  .menu {
    flex-direction: column;
    width: 100%;
    justify-content: flex-start;
    gap: 6px;
    height: auto;
  }
  .item {
    flex-direction: row;
    padding: 10px 12px;
    gap: 10px;
    flex: none;
    border-radius: 10px;
    justify-content: flex-start;
  }
  .icon {
    width: 22px;
    font-size: inherit;
    margin-bottom: 0;
  }
  .text {
    display: inline;
    font-size: 16px;
  }
}
</style>
