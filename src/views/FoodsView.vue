<template>
  <section class="page">
    <div class="header">
      <div class="badge">🍎</div>
      <h2>食品管理系統</h2>
      <div class="actions">
        <button class="btn" @click="fetchData">重新載入</button>
        <button class="btn primary" @click="openModal(null)">新增食品</button>
      </div>
    </div>
    <div class="toolbar">
      <input class="search" placeholder="搜尋食品名稱或商店..." />
      <button class="btn">🔍 搜尋</button>
    </div>
    <div class="cards">
      <div class="card" v-for="item in foods" :key="item.id">
        <div class="thumb food" :style="item.photo ? { backgroundImage: `url(${item.photo})` } : {}"></div>
        <div class="meta">
          <div class="name">{{ item.name || '未命名' }}</div>
          <div class="info">
            <span v-if="item.shop" class="shop-tag">🏠 {{ item.shop }}</span>
            <div class="details">
              <span>數量：{{ item.amount || 0 }}</span>
              <span>價格：${{ (item.price || 0).toLocaleString() }}</span>
            </div>
            <div class="expiry" :class="{ expired: isExpired(item.todate), warning: isExpiringSoon(item.todate) }">
              📅 {{ item.todate ? new Date(item.todate).toLocaleDateString() : '未設定' }}
              <span v-if="item.todate">({{ getDaysRemaining(item.todate) }})</span>
            </div>
          </div>
          <div class="ops">
            <button class="btn" @click="openModal(item)">編輯</button>
            <button class="btn danger" @click="deleteFood(item)">刪除</button>
          </div>
        </div>
      </div>
      <div v-if="foods.length === 0" class="no-data">
        暫無資料或載入中...
      </div>
    </div>

    <!-- 編輯/新增 Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingItem ? '編輯食品' : '新增食品' }}</h3>
        <div class="form-group">
          <label>名稱</label>
          <input v-model="formData.name" placeholder="請輸入食品名稱" />
        </div>
        <div class="form-group">
          <label>數量</label>
          <input type="number" v-model.number="formData.amount" placeholder="請輸入數量" />
        </div>
        <div class="form-group">
          <label>價格</label>
          <input type="number" v-model.number="formData.price" placeholder="請輸入價格" />
        </div>
        <div class="form-group">
          <label>商店</label>
          <input v-model="formData.shop" placeholder="購買商店" />
        </div>
        <div class="form-group">
          <label>到期日</label>
          <input type="date" v-model="formData.todate" />
        </div>
        <div class="form-group">
          <label>圖片連結</label>
          <input v-model="formData.photo" placeholder="https://..." />
        </div>
        <div class="modal-actions">
          <button class="btn" @click="closeModal">取消</button>
          <button class="btn primary" @click="saveFood">儲存</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import sqliteService from '../services/sqlite';

const foods = ref([]);
const showModal = ref(false);
const editingItem = ref(null);
const formData = reactive({
  name: '',
  amount: 0,
  price: 0,
  shop: '',
  todate: '',
  photo: ''
});

const openModal = (item = null) => {
  editingItem.value = item;
  if (item) {
    formData.name = item.name;
    formData.amount = item.amount;
    formData.price = item.price;
    formData.shop = item.shop;
    const date = item.todate;
    formData.todate = date ? new Date(date).toISOString().split('T')[0] : '';
    formData.photo = item.photo;
  } else {
    // Reset form
    formData.name = '';
    formData.amount = 0;
    formData.price = 0;
    formData.shop = '';
    formData.todate = '';
    formData.photo = '';
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingItem.value = null;
};

const saveFood = async () => {
  try {
    const db = await sqliteService.getDatabase();
    const todate = formData.todate ? new Date(formData.todate).toISOString().split('T')[0] : null;

    if (editingItem.value) {
      // Update
      await db.sql`UPDATE food SET 
        name = ${formData.name}, 
        amount = ${Number(formData.amount)}, 
        price = ${Number(formData.price)}, 
        shop = ${formData.shop}, 
        todate = ${todate}, 
        photo = ${formData.photo}
        WHERE id = ${editingItem.value.id}`;
    } else {
      // Insert
      await db.sql`INSERT INTO food (name, amount, price, shop, todate, photo) 
        VALUES (${formData.name}, ${Number(formData.amount)}, ${Number(formData.price)}, ${formData.shop}, ${todate}, ${formData.photo})`;
    }

    closeModal();
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error saving food:', error);
    alert('儲存失敗：' + error.message);
  }
};

const deleteFood = async (item) => {
  if (!confirm('確定要刪除此食品嗎？')) return;
  
  try {
    const db = await sqliteService.getDatabase();
    await db.sql`DELETE FROM food WHERE id = ${item.id}`;
    fetchData(); // Refresh list
  } catch (error) {
    console.error('Error deleting food:', error);
    alert('刪除失敗：' + error.message);
  }
};

const fetchData = async () => {
  try {
    const db = await sqliteService.getDatabase();
    // Use SQL to fetch data, ordered by todate
    const result = await db.sql`SELECT * FROM food ORDER BY todate ASC`;
    foods.value = result;
  } catch (error) {
    console.error('Error fetching foods:', error);
  }
};

const getDaysRemaining = (date) => {
  if (!date) return '';
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return '已過期';
  if (diffDays === 0) return '今天到期';
  return `剩 ${diffDays} 天`;
};

const isExpired = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

const isExpiringSoon = (date) => {
  if (!date) return false;
  const now = new Date();
  const target = new Date(date);
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 && diffDays <= 7;
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
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.card {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.thumb {
  height: 160px;
  background-size: cover;
  background-position: center;
  background-color: rgba(0,0,0,0.2);
}
.thumb.food {
  background-image: url('https://placehold.co/400x300?text=No+Image');
}
.meta {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.name {
  font-size: 1.1em;
  font-weight: bold;
  margin-bottom: 8px;
}
.info {
  flex: 1;
  font-size: 0.9em;
  color: rgba(255,255,255,0.8);
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.shop-tag {
  background: rgba(255,255,255,0.15);
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
  align-self: flex-start;
}
.details {
  display: flex;
  gap: 12px;
}
.expiry {
  margin-top: 4px;
}
.expiry.warning {
  color: #fbbf24;
  font-weight: bold;
}
.expiry.expired {
  color: #ef4444;
  font-weight: bold;
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
</style>
