// 初始化 Firebase
let db;
try {
    if (!window.firebase || !window.firebase.db) {
        throw new Error('Firebase not initialized');
    }
    db = window.firebase.db;
    console.log('Firebase 初始化成功');
} catch (error) {
    console.error('Firebase 初始化失敗:', error);
}

// 初始化測試數據
async function initializeTestData() {
    if (!db) {
        console.error('Firebase 未初始化');
        return;
    }

    try {
        const batch = writeBatch(db);
        
        // 添加測試產品
        const product1Ref = doc(collection(db, 'PRODUCTS'));
        const product2Ref = doc(collection(db, 'PRODUCTS'));
        
        await batch.set(product1Ref, {
            id: 'P001',
            name: '測試產品1',
            stock: 100,
            location: 'A-01',
            category: '電子'
        });
        
        await batch.set(product2Ref, {
            id: 'P002',
            name: '測試產品2',
            stock: 50,
            location: 'B-02',
            category: '文具'
        });
        
        // 添加測試入庫記錄
        const inboundRef = doc(collection(db, 'INBOUND'));
        await batch.set(inboundRef, {
            productId: 'P001',
            quantity: 50,
            date: new Date().toISOString()
        });
        
        // 添加測試出庫記錄
        const outboundRef = doc(collection(db, 'OUTBOUND'));
        await batch.set(outboundRef, {
            productId: 'P002',
            quantity: 20,
            date: new Date().toISOString()
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
    if (!db) {
        console.error('Firebase 未初始化');
        return;
    }

    try {
        const productsSnapshot = await getDocs(collection(db, 'PRODUCTS'));
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = '';
        
        productsSnapshot.forEach(doc => {
            const product = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.stock}</td>
                <td>${product.location}</td>
                <td>${product.category}</td>
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
    if (!db) {
        console.error('Firebase 未初始化');
        return;
    }

    try {
        const productsSnapshot = await getDocs(collection(db, 'PRODUCTS'));
        const inboundSnapshot = await getDocs(collection(db, 'INBOUND'));
        const outboundSnapshot = await getDocs(collection(db, 'OUTBOUND'));
        
        // 更新總產品數
        document.getElementById('total-products').textContent = productsSnapshot.size;
        
        // 更新低庫存數量
        const lowStockCount = productsSnapshot.docs.filter(doc => doc.data().stock < 10).length;
        document.getElementById('low-stock').textContent = lowStockCount;
        
        // 更新今日入庫數量
        const today = new Date().toISOString().split('T')[0];
        const todayInbound = inboundSnapshot.docs.filter(doc => 
            doc.data().date.startsWith(today)
        ).length;
        document.getElementById('today-inbound').textContent = todayInbound;
        
        // 更新今日出庫數量
        const todayOutbound = outboundSnapshot.docs.filter(doc => 
            doc.data().date.startsWith(today)
        ).length;
        document.getElementById('today-outbound').textContent = todayOutbound;
        
        console.log('儀表板更新成功');
    } catch (error) {
        console.error('更新儀表板失敗:', error);
    }
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

// 當 DOM 加載完成時初始化
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 初始化測試數據
        await initializeTestData();
        
        // 設置導航
        setupNavigation();
        
        // 顯示初始頁面
        const hash = window.location.hash || '#dashboard';
        showPage(hash.substring(1));
        
        console.log('頁面初始化完成');
    } catch (error) {
        console.error('頁面初始化失敗:', error);
    }
});

// 監聽 hash 變化
window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '#dashboard';
    showPage(hash.substring(1));
}); 