// 初始化 Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQxQ",
    authDomain: "wms2025-xxxxx.firebaseapp.com",
    projectId: "wms2025-xxxxx",
    storageBucket: "wms2025-xxxxx.appspot.com",
    messagingSenderId: "xxxxxxxxxxxx",
    appId: "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxx"
};

// 初始化 Firebase
try {
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    console.log('Firebase 初始化成功');

    // 初始化測試數據
    async function initializeTestData() {
        try {
            // 添加測試商品
            const products = [
                {
                    id: 'P001',
                    name: '測試商品1',
                    stock: 100,
                    minStock: 20,
                    location: 'A區-01',
                    category: '電子零件'
                },
                {
                    id: 'P002',
                    name: '測試商品2',
                    stock: 50,
                    minStock: 10,
                    location: 'B區-02',
                    category: '機械零件'
                }
            ];

            // 添加測試入庫記錄
            const inbound = [
                {
                    id: 'IN001',
                    productId: 'P001',
                    quantity: 50,
                    date: new Date().toISOString().split('T')[0]
                }
            ];

            // 添加測試出庫記錄
            const outbound = [
                {
                    id: 'OUT001',
                    productId: 'P002',
                    quantity: 20,
                    date: new Date().toISOString().split('T')[0]
                }
            ];

            // 批量寫入數據
            const batch = db.batch();

            // 寫入商品數據
            products.forEach(product => {
                const docRef = db.collection('products').doc(product.id);
                batch.set(docRef, product);
            });

            // 寫入入庫記錄
            inbound.forEach(record => {
                const docRef = db.collection('inbound').doc(record.id);
                batch.set(docRef, record);
            });

            // 寫入出庫記錄
            outbound.forEach(record => {
                const docRef = db.collection('outbound').doc(record.id);
                batch.set(docRef, record);
            });

            await batch.commit();
            console.log('測試數據初始化成功');

            // 更新顯示
            await updateInventoryDisplay();
            await updateDashboard();
        } catch (error) {
            console.error('初始化測試數據失敗:', error);
        }
    }

    // 更新庫存顯示
    async function updateInventoryDisplay() {
        try {
            const productsSnapshot = await db.collection('products').get();
            const tbody = document.querySelector('#inventory-table tbody');
            tbody.innerHTML = '';

            productsSnapshot.forEach(doc => {
                const product = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>${product.stock}</td>
                    <td>${product.minStock}</td>
                    <td>${product.stock <= product.minStock ? '庫存不足' : '正常'}</td>
                    <td>
                        <button class="btn" onclick="editProduct('${product.id}')">編輯</button>
                        <button class="btn" onclick="deleteProduct('${product.id}')">刪除</button>
                    </td>
                `;
                tbody.appendChild(row);
            });
            console.log('庫存顯示更新成功');
        } catch (error) {
            console.error('更新庫存顯示失敗:', error);
        }
    }

    // 更新儀表板
    async function updateDashboard() {
        try {
            const productsSnapshot = await db.collection('products').get();
            const inboundSnapshot = await db.collection('inbound').get();
            const outboundSnapshot = await db.collection('outbound').get();

            // 更新總商品數
            document.getElementById('total-products').textContent = productsSnapshot.size;

            // 更新庫存警告數
            let lowStockCount = 0;
            productsSnapshot.forEach(doc => {
                const product = doc.data();
                if (product.stock <= product.minStock) {
                    lowStockCount++;
                }
            });
            document.getElementById('low-stock').textContent = lowStockCount;

            // 更新今日入庫數
            const today = new Date().toISOString().split('T')[0];
            let todayInbound = 0;
            inboundSnapshot.forEach(doc => {
                const record = doc.data();
                if (record.date === today) {
                    todayInbound += record.quantity;
                }
            });
            document.getElementById('today-inbound').textContent = todayInbound;

            // 更新今日出庫數
            let todayOutbound = 0;
            outboundSnapshot.forEach(doc => {
                const record = doc.data();
                if (record.date === today) {
                    todayOutbound += record.quantity;
                }
            });
            document.getElementById('today-outbound').textContent = todayOutbound;

            console.log('儀表板更新成功');
        } catch (error) {
            console.error('更新儀表板失敗:', error);
        }
    }

    // 初始化頁面時執行
    document.addEventListener('DOMContentLoaded', async () => {
        await initializeTestData();
        initializePage();
    });

} catch (error) {
    console.error('Firebase 初始化失敗:', error);
}

// 頁面導航
function showPage(pageId) {
    console.log('顯示頁面:', pageId);
    
    // 隱藏所有頁面
    document.querySelectorAll('section.page').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // 顯示目標頁面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        console.log('找到目標頁面:', targetPage);
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
    } else {
        console.error('找不到頁面:', pageId);
    }
    
    // 更新導航狀態
    document.querySelectorAll('nav a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + pageId) {
            link.classList.add('active');
        }
    });
}

// 處理導航點擊
function handleNavigation(e) {
    e.preventDefault();
    const href = e.target.getAttribute('href');
    const pageId = href.startsWith('#') ? href.substring(1) : href;
    console.log('導航到頁面:', pageId);
    showPage(pageId);
    window.location.hash = pageId;
}

// 初始化頁面
function initializePage() {
    // 設置導航點擊事件
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // 顯示初始頁面
    const hash = window.location.hash;
    const initialPage = hash ? hash.substring(1) : 'dashboard';
    console.log('初始頁面:', initialPage);
    showPage(initialPage);
}

// 監聽 hash 變化
window.addEventListener('hashchange', () => {
    const pageId = window.location.hash.substring(1);
    console.log('Hash 變化，切換到頁面:', pageId);
    showPage(pageId);
}); 