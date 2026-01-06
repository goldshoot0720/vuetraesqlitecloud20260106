<template>
  <section class="page">
    <div class="header">
      <div class="badge">🧾</div>
      <h2>訂閱管理系統</h2>
      <div class="actions">
        <button class="btn" @click="fetchData">重新載入</button>
        <button class="btn primary" @click="openModal(null)">新增訂閱</button>
      </div>
    </div>
    <div class="toolbar">
      <input class="search" placeholder="搜尋訂閱名稱或網站..." />
      <button class="btn">🔍 搜尋</button>
    </div>
    <div class="list">
      <div class="item" v-for="item in subscriptions" :key="item.id">
        <div class="main-info">
          <div class="name">{{ item.name || '未命名' }}</div>
          <div class="site-link" v-if="item.site">
            <a :href="item.site" target="_blank" rel="noopener">🌐 前往網站</a>
          </div>
        </div>
        <div class="meta">
          <div class="price">價格：${{ item.price || 0 }}</div>
          <div class="date">下期：{{ item.nextdate ? new Date(item.nextdate).toLocaleDateString() : '未設定' }}</div>
          <div class="note" v-if="item.note">備註：{{ item.note }}</div>
        </div>
        <div class="ops">
          <button class="btn" @click="openModal(item)">編輯</button>
          <button class="btn danger" @click="deleteSubscription(item)">刪除</button>
        </div>
      </div>
      <div v-if="subscriptions.length === 0" class="no-data">
        暫無資料或載入中...
      </div>
    </div>

    <!-- 編輯/新增 Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingItem ? '編輯訂閱' : '新增訂閱' }}</h3>
        <div class="form-group">
          <label>名稱</label>
          <input v-model="formData.name" placeholder="請輸入訂閱名稱" />
        </div>
        <div class="form-group">
          <label>價格</label>
          <input type="number" v-model.number="formData.price" placeholder="請輸入價格" />
        </div>
        <div class="form-group">
          <label>下期扣款日</label>
          <input type="date" v-model="formData.nextdate" />
        </div>
        <div class="form-group">
          <label>網站連結</label>
          <input v-model="formData.site" placeholder="https://..." />
        </div>
        <div class="form-group">
          <label>備註</label>
          <input v-model="formData.note" placeholder="備註事項" />
        </div>
        <div class="modal-actions">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn primary" @click="saveSubscription">儲存</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import sqliteService from '../services/sqlite';

const subscriptions = ref([]);
const showModal = ref(false);
const editingItem = ref(null);
const formData = reactive({
  name: '',
  price: 0,
  nextdate: '',
  site: '',
  note: ''
});

const openModal = (item = null) => {
  editingItem.value = item;
  if (item) {
    formData.name = item.name;
    formData.price = item.price;
    // Format date for input[type="date"]
    const date = item.nextdate;
    formData.nextdate = date ? new Date(date).toISOString().split('T')[0] : '';
    formData.site = item.site;
    formData.note = item.note;
  } else {
    // Reset form
    formData.name = '';
    formData.price = 0;
    formData.nextdate = '';
    formData.site = '';
    formData.note = '';
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const saveSubscription = async () => {
  try {
    const db = await sqliteService.getDatabase();
    const nextdate = formData.nextdate ? new Date(formData.nextdate).toISOString().split('T')[0] : null;

    if (editingItem.value) {
      // Update
      await db.sql`UPDATE subscription SET 
        name = ${formData.name}, 
        price = ${Number(formData.price)}, 
        nextdate = ${nextdate}, 
        site = ${formData.site}, 
        note = ${formData.note}
        WHERE id = ${editingItem.value.id}`;
    } else {
      // Insert
      await db.sql`INSERT INTO subscription (name, price, nextdate, site, note) 
        VALUES (${formData.name}, ${Number(formData.price)}, ${nextdate}, ${formData.site}, ${formData.note})`;
    }

    closeModal();
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error saving subscription:', error);
    alert('儲存失敗：' + error.message);
  }
};

const deleteSubscription = async (item) => {
  if (!confirm('確定要刪除此訂閱嗎？')) return;
  
  try {
    const db = await sqliteService.getDatabase();
    await db.sql`DELETE FROM subscription WHERE id = ${item.id}`;
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error deleting subscription:', error);
    alert('刪除失敗：' + error.message);
  }
};

const fetchData = async () => {
  try {
    const db = await sqliteService.getDatabase();
    // Use SQL to fetch data, ordered by nextdate
    const result = await db.sql`SELECT * FROM subscription ORDER BY nextdate ASC`;
    subscriptions.value = result;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    // Silent fail or user notification depending on preference
    // If table doesn't exist, it might throw, which is handled by init suggestion in settings
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.page {
  color: #fff;
}
.header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.badge {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: rgba(255,255,255,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
.actions .btn {
  background: rgba(255,255,255,0.2);
  border: none;
  color: #fff;
  padding: 8px 12px;
  border-radius: 8px;
  margin-left: 8px;
}
.actions .primary {
  background: #ff5a5f;
}
.toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
.search {
  flex: 1;
  background: rgba(255,255,255,0.1);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  color: #fff;
}
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.item {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
}
.main-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.name {
  font-size: 1.1em;
  font-weight: bold;
}
.site-link a {
  color: #63b3ed;
  text-decoration: none;
  font-size: 0.9em;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.9em;
  color: rgba(255,255,255,0.7);
  margin-bottom: 12px;
}
.ops {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.ops .btn {
  padding: 4px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  background: rgba(255,255,255,0.2);
  color: #fff;
}
.ops .danger {
  background: rgba(239, 68, 68, 0.4);
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: #1f2937;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
}
.modal h3 {
  margin: 0 0 20px 0;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  margin-bottom: 8px;
  color: rgba(255,255,255,0.8);
}
.form-group input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(0,0,0,0.2);
  color: #fff;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}
.modal-actions .btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
.modal-actions .primary {
  background: #ff5a5f;
  color: white;
}

@media (max-width: 600px) {
  .header {
    grid-template-columns: 1fr;
    justify-items: center;
    text-align: center;
    gap: 8px;
  }
  .header h2 {
    font-size: 1.5rem;
  }
  .actions {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .actions .btn {
    flex: 1;
  }
  .toolbar {
    flex-direction: column;
  }
  .item {
    padding: 12px;
  }
  .main-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  .meta {
    flex-direction: column;
    gap: 4px;
  }
  .ops {
    margin-top: 8px;
    justify-content: stretch;
  }
  .ops .btn {
    flex: 1;
  }
}
</style>
