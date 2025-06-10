// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyA5icRnFMGbWxNRba_I2nYek5Wn55AoxR4",
    authDomain: "wms2025-bc1d1.firebaseapp.com",
    projectId: "wms2025-bc1d1",
    storageBucket: "wms2025-bc1d1.firebasestorage.app",
    messagingSenderId: "823862095197",
    appId: "1:823862095197:web:c0ca94c9748f0b171b0cb4",
    measurementId: "G-VHJ8BXN4VW"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 測試數據庫連接
async function testDatabaseConnection() {
    try {
        // 嘗試添加一個測試文檔
        const testDoc = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: '測試連接成功'
        };
        
        await db.collection('test').add(testDoc);
        console.log('數據庫連接測試成功！');
        
        // 讀取測試文檔
        const snapshot = await db.collection('test').get();
        console.log('已讀取文檔數量:', snapshot.size);
        
        // 顯示所有測試文檔
        snapshot.forEach(doc => {
            console.log('文檔ID:', doc.id, '數據:', doc.data());
        });
        
        return true;
    } catch (error) {
        console.error('數據庫連接測試失敗:', error);
        return false;
    }
}

// 在頁面加載時執行測試
document.addEventListener('DOMContentLoaded', async () => {
    console.log('開始測試數據庫連接...');
    const isConnected = await testDatabaseConnection();
    if (isConnected) {
        alert('數據庫連接測試成功！請查看控制台獲取詳細信息。');
    } else {
        alert('數據庫連接測試失敗！請查看控制台獲取錯誤信息。');
    }
});

// 集合名稱
const PRODUCTS = 'products';
const INBOUND = 'inbound';
const OUTBOUND = 'outbound';

// 初始化數據
async function initializeData() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        if (productsSnapshot.empty) {
            // 創建示例數據
            const sampleProducts = [
                {
                    id: 'P001',
                    name: '商品A',
                    specification: '規格A',
                    stock: 100,
                    minStock: 20 
                },
                {
                    id: 'P002',
                    name: '商品B',
                    specification: '規格B',
                    stock: 150,
                    minStock: 30
                }
            ];

            // 批量添加示例數據
            const batch = db.batch();
            sampleProducts.forEach(product => {
                const docRef = db.collection(PRODUCTS).doc(product.id);
                batch.set(docRef, product);
            });
            await batch.commit();
        }
    } catch (error) {
        console.error('初始化數據時出錯:', error);
    }
}

// 頁面導航
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');
            showPage(targetPage);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// 顯示指定頁面
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    
    updatePageData(pageId);
}

// 更新頁面數據
async function updatePageData(pageId) {
    try {
        switch (pageId) {
            case 'dashboard':
                await updateDashboard();
                break;
            case 'products':
                await updateProductsTable();
                break;
            case 'inventory':
                await updateInventoryTable();
                break;
            case 'inbound':
                await updateInboundTable();
                break;
            case 'outbound':
                await updateOutboundTable();
                break;
            case 'reports':
                await updateReports();
                break;
        }
    } catch (error) {
        console.error('更新頁面數據時出錯：', error);
    }
}

// 更新儀表板
async function updateDashboard() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const inboundSnapshot = await db.collection(INBOUND).get();
        const outboundSnapshot = await db.collection(OUTBOUND).get();
        
        const products = productsSnapshot.docs.map(doc => doc.data());
        const inbound = inboundSnapshot.docs.map(doc => doc.data());
        const outbound = outboundSnapshot.docs.map(doc => doc.data());
        
        // 更新總商品數
        document.getElementById('total-products').textContent = products.length;
        
        // 更新庫存警告數
        const lowStock = products.filter(p => p.stock <= p.minStock).length;
        document.getElementById('low-stock').textContent = lowStock;
        
        // 更新今日入庫數
        const today = new Date().toISOString().split('T')[0];
        const todayInbound = inbound.filter(i => i.date.startsWith(today)).length;
        document.getElementById('today-inbound').textContent = todayInbound;
        
        // 更新今日出庫數
        const todayOutbound = outbound.filter(o => o.date.startsWith(today)).length;
        document.getElementById('today-outbound').textContent = todayOutbound;
    } catch (error) {
        console.error('更新儀表板時出錯：', error);
    }
}

// 更新商品表格
async function updateProductsTable() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const tbody = document.querySelector('#products-table tbody');
        tbody.innerHTML = '';
        
        productsSnapshot.forEach(doc => {
            const product = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.specification}</td>
                <td>${product.stock}</td>
                <td>${product.minStock}</td>
                <td>
                    <button class="btn primary" onclick="editProduct('${product.id}')">編輯</button>
                    <button class="btn danger" onclick="deleteProduct('${product.id}')">刪除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('更新商品表格時出錯：', error);
    }
}

// 更新庫存表格
async function updateInventoryTable() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const tbody = document.querySelector('#inventory-table tbody');
        tbody.innerHTML = '';
        
        productsSnapshot.forEach(doc => {
            const product = doc.data();
            const status = product.stock <= product.minStock ? '庫存不足' : '正常';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.stock}</td>
                <td>${product.minStock}</td>
                <td>${status}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('更新庫存表格時出錯：', error);
    }
}

// 更新入庫表格
async function updateInboundTable() {
    try {
        const inboundSnapshot = await db.collection(INBOUND).get();
        const tbody = document.querySelector('#inbound-table tbody');
        tbody.innerHTML = '';
        
        inboundSnapshot.forEach(doc => {
            const record = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${record.productName}</td>
                <td>${record.quantity}</td>
                <td>${record.date}</td>
                <td>
                    <button class="btn danger" onclick="deleteInbound('${record.id}')">刪除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('更新入庫表格時出錯：', error);
    }
}

// 更新出庫表格
async function updateOutboundTable() {
    try {
        const outboundSnapshot = await db.collection(OUTBOUND).get();
        const tbody = document.querySelector('#outbound-table tbody');
        tbody.innerHTML = '';
        
        outboundSnapshot.forEach(doc => {
            const record = doc.data();
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.id}</td>
                <td>${record.productName}</td>
                <td>${record.quantity}</td>
                <td>${record.date}</td>
                <td>
                    <button class="btn danger" onclick="deleteOutbound('${record.id}')">刪除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('更新出庫表格時出錯：', error);
    }
}

// 更新報表
async function updateReports() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const inboundSnapshot = await db.collection(INBOUND).get();
        const outboundSnapshot = await db.collection(OUTBOUND).get();
        
        const products = productsSnapshot.docs.map(doc => doc.data());
        const inbound = inboundSnapshot.docs.map(doc => doc.data());
        const outbound = outboundSnapshot.docs.map(doc => doc.data());
        
        // 庫存概況圖表
        const inventoryCtx = document.getElementById('inventory-chart').getContext('2d');
        new Chart(inventoryCtx, {
            type: 'bar',
            data: {
                labels: products.map(p => p.name),
                datasets: [{
                    label: '當前庫存',
                    data: products.map(p => p.stock),
                    backgroundColor: '#9B8579'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // 出入庫趨勢圖表
        const trendCtx = document.getElementById('trend-chart').getContext('2d');
        const dates = [...new Set([...inbound, ...outbound].map(r => r.date))].sort();
        new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: '入庫',
                        data: dates.map(date => 
                            inbound.filter(r => r.date === date).reduce((sum, r) => sum + r.quantity, 0)
                        ),
                        borderColor: '#6B8F71'
                    },
                    {
                        label: '出庫',
                        data: dates.map(date => 
                            outbound.filter(r => r.date === date).reduce((sum, r) => sum + r.quantity, 0)
                        ),
                        borderColor: '#B56576'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('更新報表時出錯：', error);
    }
}

// 模態框操作
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = content;
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

// 商品操作
async function addProduct() {
    const content = `
        <h2>新增商品</h2>
        <form id="add-product-form">
            <div class="form-group">
                <label for="product-id">商品編號</label>
                <input type="text" id="product-id" required>
            </div>
            <div class="form-group">
                <label for="product-name">商品名稱</label>
                <input type="text" id="product-name" required>
            </div>
            <div class="form-group">
                <label for="product-spec">規格</label>
                <input type="text" id="product-spec" required>
            </div>
            <div class="form-group">
                <label for="product-quantity">初始庫存</label>
                <input type="number" id="product-quantity" required min="0">
            </div>
            <div class="form-group">
                <label for="product-min">最低庫存</label>
                <input type="number" id="product-min" required min="0">
            </div>
            <button type="submit" class="btn primary">保存</button>
        </form>
    `;
    showModal(content);
    
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const product = {
                id: document.getElementById('product-id').value,
                name: document.getElementById('product-name').value,
                specification: document.getElementById('product-spec').value,
                stock: parseInt(document.getElementById('product-quantity').value),
                minStock: parseInt(document.getElementById('product-min').value)
            };
            
            await db.collection(PRODUCTS).add(product);
            
            closeModal();
            updateProductsTable();
            updateDashboard();
        } catch (error) {
            console.error('添加商品時出錯：', error);
            alert('添加商品失敗，請重試');
        }
    });
}

async function editProduct(id) {
    try {
        const productDoc = await db.collection(PRODUCTS).where('id', '==', id).get();
        const product = productDoc.docs[0].data();
        
        const content = `
            <h2>編輯商品</h2>
            <form id="edit-product-form">
                <div class="form-group">
                    <label for="product-id">商品編號</label>
                    <input type="text" id="product-id" value="${product.id}" readonly>
                </div>
                <div class="form-group">
                    <label for="product-name">商品名稱</label>
                    <input type="text" id="product-name" value="${product.name}" required>
                </div>
                <div class="form-group">
                    <label for="product-spec">規格</label>
                    <input type="text" id="product-spec" value="${product.specification}" required>
                </div>
                <div class="form-group">
                    <label for="product-quantity">當前庫存</label>
                    <input type="number" id="product-quantity" value="${product.stock}" required min="0">
                </div>
                <div class="form-group">
                    <label for="product-min">最低庫存</label>
                    <input type="number" id="product-min" value="${product.minStock}" required min="0">
                </div>
                <button type="submit" class="btn primary">保存</button>
            </form>
        `;
        showModal(content);
        
        document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const updatedProduct = {
                    id: document.getElementById('product-id').value,
                    name: document.getElementById('product-name').value,
                    specification: document.getElementById('product-spec').value,
                    stock: parseInt(document.getElementById('product-quantity').value),
                    minStock: parseInt(document.getElementById('product-min').value)
                };
                
                await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update(updatedProduct);
                
                closeModal();
                updateProductsTable();
                updateInventoryTable();
                updateDashboard();
            } catch (error) {
                console.error('更新商品時出錯：', error);
                alert('更新商品失敗，請重試');
            }
        });
    } catch (error) {
        console.error('獲取商品信息時出錯：', error);
        alert('獲取商品信息失敗，請重試');
    }
}

async function deleteProduct(id) {
    if (confirm('確定要刪除此商品嗎？')) {
        try {
            const productDoc = await db.collection(PRODUCTS).where('id', '==', id).get();
            await db.collection(PRODUCTS).doc(productDoc.docs[0].id).delete();
            
            updateProductsTable();
            updateInventoryTable();
            updateDashboard();
        } catch (error) {
            console.error('刪除商品時出錯：', error);
            alert('刪除商品失敗，請重試');
        }
    }
}

// 入庫操作
async function addInbound() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const products = productsSnapshot.docs.map(doc => doc.data());
        const productOptions = products.map(p => 
            `<option value="${p.id}">${p.name}</option>`
        ).join('');
        
        const content = `
            <h2>新增入庫</h2>
            <form id="add-inbound-form">
                <div class="form-group">
                    <label for="inbound-product">商品</label>
                    <select id="inbound-product" required>
                        ${productOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="inbound-quantity">數量</label>
                    <input type="number" id="inbound-quantity" required min="1">
                </div>
                <button type="submit" class="btn primary">保存</button>
            </form>
        `;
        showModal(content);
        
        document.getElementById('add-inbound-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const productId = document.getElementById('inbound-product').value;
                const quantity = parseInt(document.getElementById('inbound-quantity').value);
                const product = products.find(p => p.id === productId);
                
                const inbound = {
                    id: Date.now().toString(),
                    productId: productId,
                    productName: product.name,
                    quantity: quantity,
                    date: new Date().toISOString().split('T')[0]
                };
                
                await db.collection(INBOUND).add(inbound);
                
                // 更新商品庫存
                const productDoc = await db.collection(PRODUCTS).where('id', '==', productId).get();
                const currentProduct = productDoc.docs[0].data();
                await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update({
                    stock: currentProduct.stock + quantity
                });
                
                closeModal();
                updateInboundTable();
                updateProductsTable();
                updateInventoryTable();
                updateDashboard();
            } catch (error) {
                console.error('添加入庫記錄時出錯：', error);
                alert('添加入庫記錄失敗，請重試');
            }
        });
    } catch (error) {
        console.error('獲取商品列表時出錯：', error);
        alert('獲取商品列表失敗，請重試');
    }
}

async function deleteInbound(id) {
    if (confirm('確定要刪除此入庫記錄嗎？')) {
        try {
            const inboundDoc = await db.collection(INBOUND).where('id', '==', id).get();
            const record = inboundDoc.docs[0].data();
            
            // 更新商品庫存
            const productDoc = await db.collection(PRODUCTS).where('id', '==', record.productId).get();
            const currentProduct = productDoc.docs[0].data();
            await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update({
                stock: currentProduct.stock - record.quantity
            });
            
            // 刪除入庫記錄
            await db.collection(INBOUND).doc(inboundDoc.docs[0].id).delete();
            
            updateInboundTable();
            updateProductsTable();
            updateInventoryTable();
            updateDashboard();
        } catch (error) {
            console.error('刪除入庫記錄時出錯：', error);
            alert('刪除入庫記錄失敗，請重試');
        }
    }
}

// 出庫操作
async function addOutbound() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const products = productsSnapshot.docs.map(doc => doc.data());
        const productOptions = products.map(p => 
            `<option value="${p.id}">${p.name}</option>`
        ).join('');
        
        const content = `
            <h2>新增出庫</h2>
            <form id="add-outbound-form">
                <div class="form-group">
                    <label for="outbound-product">商品</label>
                    <select id="outbound-product" required>
                        ${productOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label for="outbound-quantity">數量</label>
                    <input type="number" id="outbound-quantity" required min="1">
                </div>
                <button type="submit" class="btn primary">保存</button>
            </form>
        `;
        showModal(content);
        
        document.getElementById('add-outbound-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            try {
                const productId = document.getElementById('outbound-product').value;
                const quantity = parseInt(document.getElementById('outbound-quantity').value);
                const product = products.find(p => p.id === productId);
                
                if (product.stock < quantity) {
                    alert('庫存不足！');
                    return;
                }
                
                const outbound = {
                    id: Date.now().toString(),
                    productId: productId,
                    productName: product.name,
                    quantity: quantity,
                    date: new Date().toISOString().split('T')[0]
                };
                
                await db.collection(OUTBOUND).add(outbound);
                
                // 更新商品庫存
                const productDoc = await db.collection(PRODUCTS).where('id', '==', productId).get();
                const currentProduct = productDoc.docs[0].data();
                await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update({
                    stock: currentProduct.stock - quantity
                });
                
                closeModal();
                updateOutboundTable();
                updateProductsTable();
                updateInventoryTable();
                updateDashboard();
            } catch (error) {
                console.error('添加出庫記錄時出錯：', error);
                alert('添加出庫記錄失敗，請重試');
            }
        });
    } catch (error) {
        console.error('獲取商品列表時出錯：', error);
        alert('獲取商品列表失敗，請重試');
    }
}

async function deleteOutbound(id) {
    if (confirm('確定要刪除此出庫記錄嗎？')) {
        try {
            const outboundDoc = await db.collection(OUTBOUND).where('id', '==', id).get();
            const record = outboundDoc.docs[0].data();
            
            // 更新商品庫存
            const productDoc = await db.collection(PRODUCTS).where('id', '==', record.productId).get();
            const currentProduct = productDoc.docs[0].data();
            await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update({
                stock: currentProduct.stock + record.quantity
            });
            
            // 刪除出庫記錄
            await db.collection(OUTBOUND).doc(outboundDoc.docs[0].id).delete();
            
            updateOutboundTable();
            updateProductsTable();
            updateInventoryTable();
            updateDashboard();
        } catch (error) {
            console.error('刪除出庫記錄時出錯：', error);
            alert('刪除出庫記錄失敗，請重試');
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    setupNavigation();
    
    // 設置按鈕事件
    document.getElementById('add-product-btn').addEventListener('click', addProduct);
    document.getElementById('add-inbound-btn').addEventListener('click', addInbound);
    document.getElementById('add-outbound-btn').addEventListener('click', addOutbound);
    
    // 設置模態框關閉按鈕
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // 初始化儀表板
    updateDashboard();
}); 