<script setup>
import { ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'

const isMenuOpen = ref(false)
const route = useRoute()

// Close menu when route changes
watch(() => route.path, () => {
  isMenuOpen.value = false
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}
</script>

<template>
  <div class="app-shell">
    <Sidebar :class="{ open: isMenuOpen }" @close="isMenuOpen = false" />
    <div class="menu-overlay" :class="{ show: isMenuOpen }" @click="isMenuOpen = false"></div>
    <div class="content">
      <header class="topbar">
        <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        歡迎使用鋒兄AI資訊系統
      </header>
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
.menu-toggle {
  display: none;
  background: none;
  border: none;
  color: #fff;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  margin-left: -8px;
  margin-right: 8px;
  line-height: 1;
}

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.menu-overlay.show {
  opacity: 1;
  pointer-events: auto;
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
    padding-bottom: 24px; /* Reset bottom padding */
  }
  .topbar {
    padding: 0 16px;
  }
  .main {
    padding: 16px;
  }
  .menu-toggle {
    display: block;
  }
}
</style>
