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

// 啟用離線持久化
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.log('多個標籤頁打開時無法啟用離線持久化');
        } else if (err.code === 'unimplemented') {
            console.log('當前瀏覽器不支持離線持久化');
        }
    });

// 測試數據庫連接
async function testDatabaseConnection() {
    try {
        // 嘗試添加一個測試文檔
        const testDoc = {
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            message: '測試連接成功',
            environment: window.location.hostname === 'k14j14638.github.io' ? 'production' : 'development'
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

// 在頁面加載時執行初始化
document.addEventListener('DOMContentLoaded', async () => {
    console.log('開始測試數據庫連接...');
    const isConnected = await testDatabaseConnection();
    if (isConnected) {
        console.log('數據庫連接成功，開始初始化數據...');
        // 先清除所有數據
        await clearAllData();
        // 然後初始化示例數據
        await initializeSampleProducts();
        await initializeSampleInbound();
        await updateDashboard();
        await updateProductsTable();
        await updateInventoryTable();
        await updateInboundTable();
        alert('系統初始化完成！請查看控制台獲取詳細信息。');
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

// 初始化示例商品數據
async function initializeSampleProducts() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        if (productsSnapshot.empty) {
            const sampleProducts = [
                {
                    id: 'P001',
                    name: '筆記型電腦',
                    specification: '15.6吋, 16GB RAM, 512GB SSD',
                    stock: 50,
                    minStock: 10
                },
                {
                    id: 'P002',
                    name: '無線滑鼠',
                    specification: '藍牙5.0, 可充電',
                    stock: 100,
                    minStock: 20
                },
                {
                    id: 'P003',
                    name: '機械鍵盤',
                    specification: 'RGB背光, 青軸',
                    stock: 30,
                    minStock: 5
                },
                {
                    id: 'P004',
                    name: '顯示器',
                    specification: '27吋, 4K解析度',
                    stock: 25,
                    minStock: 5
                }
            ];

            // 批量添加示例數據
            const batch = db.batch();
            sampleProducts.forEach(product => {
                const docRef = db.collection(PRODUCTS).doc(product.id);
                batch.set(docRef, product);
            });
            await batch.commit();
            console.log('示例商品數據初始化成功！');
        }
    } catch (error) {
        console.error('初始化示例商品數據時出錯:', error);
    }
}

// 初始化示例入庫記錄
async function initializeSampleInbound() {
    try {
        const inboundSnapshot = await db.collection(INBOUND).get();
        if (inboundSnapshot.empty) {
            console.log('開始添加示例入庫記錄...');
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            
            const sampleInbound = [
                {
                    id: 'IN001',
                    productId: 'P001',
                    productName: '筆記型電腦',
                    quantity: 10,
                    date: today,
                    operator: '系統管理員'
                },
                {
                    id: 'IN002',
                    productId: 'P002',
                    productName: '無線滑鼠',
                    quantity: 20,
                    date: today,
                    operator: '系統管理員'
                },
                {
                    id: 'IN003',
                    productId: 'P003',
                    productName: '機械鍵盤',
                    quantity: 5,
                    date: yesterday,
                    operator: '系統管理員'
                }
            ];

            // 批量添加示例數據
            const batch = db.batch();
            sampleInbound.forEach(record => {
                const docRef = db.collection(INBOUND).doc(record.id);
                batch.set(docRef, record);
            });
            await batch.commit();
            console.log('示例入庫記錄初始化成功！');

            // 更新商品庫存
            for (const record of sampleInbound) {
                const productDoc = await db.collection(PRODUCTS).where('id', '==', record.productId).get();
                if (!productDoc.empty) {
                    const currentProduct = productDoc.docs[0].data();
                    await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update({
                        stock: currentProduct.stock + record.quantity
                    });
                }
            }
            console.log('商品庫存更新完成！');
        }
    } catch (error) {
        console.error('初始化示例入庫記錄時出錯:', error);
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
                <td>${product.specification}</td>
                <td>${product.stock}</td>
                <td>${product.minStock}</td>
                <td>${status}</td>
                <td>
                    <button class="btn primary" onclick="editInventory('${product.id}')">編輯</button>
                    <button class="btn danger" onclick="deleteInventory('${product.id}')">刪除</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('更新庫存表格時出錯:', error);
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
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h3>新增入庫</h3>
        <form id="add-inbound-form">
            <div class="form-group">
                <label for="inbound-product">商品</label>
                <select id="inbound-product" required>
                    <option value="">請選擇商品</option>
                </select>
            </div>
            <div class="form-group">
                <label for="inbound-quantity">數量</label>
                <input type="number" id="inbound-quantity" required min="1">
            </div>
            <div class="form-group">
                <label for="inbound-operator">操作者</label>
                <input type="text" id="inbound-operator" required>
            </div>
            <button type="submit" class="btn primary">保存</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    // 載入商品選項
    loadProductOptions('inbound-product');
    
    document.getElementById('add-inbound-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('inbound-product').value;
        const quantity = parseInt(document.getElementById('inbound-quantity').value);
        const operator = document.getElementById('inbound-operator').value;
        
        try {
            // 獲取商品信息
            const productDoc = await db.collection(PRODUCTS).where('id', '==', productId).get();
            const product = productDoc.docs[0].data();
            
            // 創建入庫記錄
            const inbound = {
                id: `IN${Date.now()}`,
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                date: new Date().toISOString().split('T')[0],
                operator: operator
            };
            
            // 添加到入庫集合
            await db.collection(INBOUND).doc(inbound.id).set(inbound);
            
            // 更新商品庫存
            await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update({
                stock: product.stock + quantity
            });
            
            closeModal();
            updateInboundTable();
            updateDashboard();
            alert('入庫成功！');
        } catch (error) {
            console.error('新增入庫時出錯:', error);
            alert('入庫失敗，請稍後再試');
        }
    });
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
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h3>新增出庫</h3>
        <form id="add-outbound-form">
            <div class="form-group">
                <label for="outbound-product">商品</label>
                <select id="outbound-product" required>
                    <option value="">請選擇商品</option>
                </select>
            </div>
            <div class="form-group">
                <label for="outbound-quantity">數量</label>
                <input type="number" id="outbound-quantity" required min="1">
            </div>
            <div class="form-group">
                <label for="outbound-operator">操作者</label>
                <input type="text" id="outbound-operator" required>
            </div>
            <button type="submit" class="btn primary">保存</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    // 載入商品選項
    loadProductOptions('outbound-product');
    
    document.getElementById('add-outbound-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const productId = document.getElementById('outbound-product').value;
        const quantity = parseInt(document.getElementById('outbound-quantity').value);
        const operator = document.getElementById('outbound-operator').value;
        
        try {
            // 獲取商品信息
            const productDoc = await db.collection(PRODUCTS).where('id', '==', productId).get();
            const product = productDoc.docs[0].data();
            
            // 檢查庫存
            if (product.stock < quantity) {
                alert('庫存不足！');
                return;
            }
            
            // 創建出庫記錄
            const outbound = {
                id: `OUT${Date.now()}`,
                productId: product.id,
                productName: product.name,
                quantity: quantity,
                date: new Date().toISOString().split('T')[0],
                operator: operator
            };
            
            // 添加到出庫集合
            await db.collection(OUTBOUND).doc(outbound.id).set(outbound);
            
            // 更新商品庫存
            await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update({
                stock: product.stock - quantity
            });
            
            closeModal();
            updateOutboundTable();
            updateDashboard();
            alert('出庫成功！');
        } catch (error) {
            console.error('新增出庫時出錯:', error);
            alert('出庫失敗，請稍後再試');
        }
    });
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

// 清除所有數據
async function clearAllData() {
    try {
        console.log('開始清除所有數據...');
        
        // 清除商品數據
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const batch = db.batch();
        productsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('商品數據已清除');
        
        // 清除入庫記錄
        const inboundSnapshot = await db.collection(INBOUND).get();
        const inboundBatch = db.batch();
        inboundSnapshot.docs.forEach(doc => {
            inboundBatch.delete(doc.ref);
        });
        await inboundBatch.commit();
        console.log('入庫記錄已清除');
        
        // 清除出庫記錄
        const outboundSnapshot = await db.collection(OUTBOUND).get();
        const outboundBatch = db.batch();
        outboundSnapshot.docs.forEach(doc => {
            outboundBatch.delete(doc.ref);
        });
        await outboundBatch.commit();
        console.log('出庫記錄已清除');
        
        return true;
    } catch (error) {
        console.error('清除數據時出錯:', error);
        return false;
    }
}

// 編輯庫存
async function editInventory(id) {
    try {
        const productDoc = await db.collection(PRODUCTS).where('id', '==', id).get();
        const product = productDoc.docs[0].data();
        
        const modalBody = document.getElementById('modal-body');
        modalBody.innerHTML = `
            <h3>編輯商品</h3>
            <form id="edit-inventory-form">
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
                    <label for="product-stock">當前庫存</label>
                    <input type="number" id="product-stock" value="${product.stock}" required min="0">
                </div>
                <div class="form-group">
                    <label for="product-min">最低庫存</label>
                    <input type="number" id="product-min" value="${product.minStock}" required min="0">
                </div>
                <button type="submit" class="btn primary">保存</button>
            </form>
        `;
        
        document.getElementById('modal').style.display = 'block';
        
        document.getElementById('edit-inventory-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const updatedProduct = {
                id: document.getElementById('product-id').value,
                name: document.getElementById('product-name').value,
                specification: document.getElementById('product-spec').value,
                stock: parseInt(document.getElementById('product-stock').value),
                minStock: parseInt(document.getElementById('product-min').value)
            };
            
            await db.collection(PRODUCTS).doc(productDoc.docs[0].id).update(updatedProduct);
            
            closeModal();
            updateInventoryTable();
            updateDashboard();
        });
    } catch (error) {
        console.error('編輯庫存時出錯:', error);
    }
}

// 刪除庫存
async function deleteInventory(id) {
    if (confirm('確定要刪除此商品嗎？')) {
        try {
            const productDoc = await db.collection(PRODUCTS).where('id', '==', id).get();
            await db.collection(PRODUCTS).doc(productDoc.docs[0].id).delete();
            
            updateInventoryTable();
            updateDashboard();
        } catch (error) {
            console.error('刪除庫存時出錯:', error);
        }
    }
}

// 新增商品
function addInventory() {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = `
        <h3>新增商品</h3>
        <form id="add-inventory-form">
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
                <label for="product-stock">初始庫存</label>
                <input type="number" id="product-stock" required min="0">
            </div>
            <div class="form-group">
                <label for="product-min">最低庫存</label>
                <input type="number" id="product-min" required min="0">
            </div>
            <button type="submit" class="btn primary">保存</button>
        </form>
    `;
    
    document.getElementById('modal').style.display = 'block';
    
    document.getElementById('add-inventory-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const product = {
            id: document.getElementById('product-id').value,
            name: document.getElementById('product-name').value,
            specification: document.getElementById('product-spec').value,
            stock: parseInt(document.getElementById('product-stock').value),
            minStock: parseInt(document.getElementById('product-min').value)
        };
        
        await db.collection(PRODUCTS).doc(product.id).set(product);
        
        closeModal();
        updateInventoryTable();
        updateDashboard();
    });
}

// 匯出 Excel 功能
async function exportToExcel() {
    try {
        // 獲取所有出入庫記錄
        const inboundSnapshot = await db.collection(INBOUND).get();
        const outboundSnapshot = await db.collection(OUTBOUND).get();
        
        // 合併並格式化數據
        const records = [];
        
        // 處理入庫記錄
        inboundSnapshot.forEach(doc => {
            const data = doc.data();
            records.push({
                日期: data.date,
                類型: '入庫',
                商品編號: data.productId,
                商品名稱: data.productName,
                數量: data.quantity,
                操作者: data.operator
            });
        });
        
        // 處理出庫記錄
        outboundSnapshot.forEach(doc => {
            const data = doc.data();
            records.push({
                日期: data.date,
                類型: '出庫',
                商品編號: data.productId,
                商品名稱: data.productName,
                數量: data.quantity,
                操作者: data.operator
            });
        });
        
        // 按日期排序（新到舊）
        records.sort((a, b) => new Date(b.日期) - new Date(a.日期));
        
        // 創建工作簿
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(records);
        
        // 設置列寬
        const colWidths = [
            { wch: 20 }, // 日期
            { wch: 10 }, // 類型
            { wch: 15 }, // 商品編號
            { wch: 20 }, // 商品名稱
            { wch: 10 }, // 數量
            { wch: 15 }  // 操作者
        ];
        ws['!cols'] = colWidths;
        
        // 添加工作表到工作簿
        XLSX.utils.book_append_sheet(wb, ws, "出入庫紀錄");
        
        // 生成文件名（使用當前日期）
        const fileName = `出入庫紀錄_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        // 導出文件
        XLSX.writeFile(wb, fileName);
        
    } catch (error) {
        console.error('匯出 Excel 時出錯:', error);
        alert('匯出失敗，請稍後再試');
    }
}

// 更新報表頁面
async function updateReportsPage() {
    try {
        // 獲取所有出入庫記錄
        const inboundSnapshot = await db.collection(INBOUND).get();
        const outboundSnapshot = await db.collection(OUTBOUND).get();
        
        // 合併記錄
        const records = [];
        
        inboundSnapshot.forEach(doc => {
            const data = doc.data();
            records.push({
                日期: data.date,
                類型: '入庫',
                商品編號: data.productId,
                商品名稱: data.productName,
                數量: data.quantity,
                操作者: data.operator
            });
        });
        
        outboundSnapshot.forEach(doc => {
            const data = doc.data();
            records.push({
                日期: data.date,
                類型: '出庫',
                商品編號: data.productId,
                商品名稱: data.productName,
                數量: data.quantity,
                操作者: data.operator
            });
        });
        
        // 按日期排序（新到舊）
        records.sort((a, b) => new Date(b.日期) - new Date(a.日期));
        
        // 更新表格
        const tbody = document.querySelector('#records-table tbody');
        tbody.innerHTML = '';
        
        records.forEach(record => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${record.日期}</td>
                <td>${record.類型}</td>
                <td>${record.商品編號}</td>
                <td>${record.商品名稱}</td>
                <td>${record.數量}</td>
                <td>${record.操作者}</td>
            `;
            tbody.appendChild(tr);
        });
        
        // 更新圖表
        updateInventoryChart();
        updateTrendChart();
        
    } catch (error) {
        console.error('更新報表頁面時出錯:', error);
    }
}

// 載入商品選項
async function loadProductOptions(selectId) {
    try {
        const select = document.getElementById(selectId);
        const productsSnapshot = await db.collection(PRODUCTS).get();
        
        productsSnapshot.forEach(doc => {
            const product = doc.data();
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = `${product.name} (${product.id})`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('載入商品選項時出錯:', error);
    }
}

// 更新庫存圖表
async function updateInventoryChart() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const ctx = document.getElementById('inventory-chart').getContext('2d');
        
        const labels = [];
        const stockData = [];
        const minStockData = [];
        
        productsSnapshot.forEach(doc => {
            const product = doc.data();
            labels.push(product.name);
            stockData.push(product.stock);
            minStockData.push(product.minStock);
        });
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: '當前庫存',
                        data: stockData,
                        backgroundColor: 'rgba(155, 133, 121, 0.5)',
                        borderColor: 'rgba(155, 133, 121, 1)',
                        borderWidth: 1
                    },
                    {
                        label: '最低庫存',
                        data: minStockData,
                        backgroundColor: 'rgba(107, 143, 113, 0.5)',
                        borderColor: 'rgba(107, 143, 113, 1)',
                        borderWidth: 1
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
        console.error('更新庫存圖表時出錯:', error);
    }
}

// 更新趨勢圖表
async function updateTrendChart() {
    try {
        const inboundSnapshot = await db.collection(INBOUND).get();
        const outboundSnapshot = await db.collection(OUTBOUND).get();
        
        const dates = new Set();
        const inboundData = {};
        const outboundData = {};
        
        // 收集所有日期
        inboundSnapshot.forEach(doc => {
            const data = doc.data();
            dates.add(data.date);
            inboundData[data.date] = (inboundData[data.date] || 0) + data.quantity;
        });
        
        outboundSnapshot.forEach(doc => {
            const data = doc.data();
            dates.add(data.date);
            outboundData[data.date] = (outboundData[data.date] || 0) + data.quantity;
        });
        
        // 轉換為數組並排序
        const sortedDates = Array.from(dates).sort();
        
        const ctx = document.getElementById('trend-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: sortedDates,
                datasets: [
                    {
                        label: '入庫數量',
                        data: sortedDates.map(date => inboundData[date] || 0),
                        borderColor: 'rgba(155, 133, 121, 1)',
                        backgroundColor: 'rgba(155, 133, 121, 0.1)',
                        fill: true
                    },
                    {
                        label: '出庫數量',
                        data: sortedDates.map(date => outboundData[date] || 0),
                        borderColor: 'rgba(107, 143, 113, 1)',
                        backgroundColor: 'rgba(107, 143, 113, 0.1)',
                        fill: true
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
        console.error('更新趨勢圖表時出錯:', error);
    }
}

// 更新自動完成選項
async function updateAutocompleteOptions() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const productIds = new Set();
        const productNames = new Set();
        const locations = new Set();
        const categories = new Set();

        // 收集商品相關選項
        productsSnapshot.forEach(doc => {
            const data = doc.data();
            productIds.add(data.id);
            productNames.add(data.name);
            locations.add(data.location);
            categories.add(data.category);
        });

        // 更新 datalist 選項
        updateDatalist('existingProductIds', Array.from(productIds));
        updateDatalist('existingProductNames', Array.from(productNames));
        updateDatalist('existingLocations', Array.from(locations));
        updateDatalist('existingCategories', Array.from(categories));

        // 更新商品選擇下拉選單
        updateProductSelects();
    } catch (error) {
        console.error('更新自動完成選項時發生錯誤:', error);
    }
}

// 更新 datalist 選項
function updateDatalist(id, options) {
    const datalist = document.getElementById(id);
    if (datalist) {
        datalist.innerHTML = options.map(option => 
            `<option value="${option}">`
        ).join('');
    }
}

// 更新商品選擇下拉選單
async function updateProductSelects() {
    try {
        const productsSnapshot = await db.collection(PRODUCTS).get();
        const products = [];
        productsSnapshot.forEach(doc => {
            const data = doc.data();
            products.push({
                id: data.id,
                name: data.name
            });
        });

        // 更新入庫和出庫表單的商品選擇
        const inboundSelect = document.getElementById('inboundProductId');
        const outboundSelect = document.getElementById('outboundProductId');

        if (inboundSelect) {
            inboundSelect.innerHTML = products.map(product => 
                `<option value="${product.id}">${product.id} - ${product.name}</option>`
            ).join('');
        }

        if (outboundSelect) {
            outboundSelect.innerHTML = products.map(product => 
                `<option value="${product.id}">${product.id} - ${product.name}</option>`
            ).join('');
        }
    } catch (error) {
        console.error('更新商品選擇時發生錯誤:', error);
    }
}

// 在適當的時機調用更新函數
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 測試資料庫連接
        const testDoc = doc(db, 'test', 'test');
        await setDoc(testDoc, { test: true });
        await deleteDoc(testDoc);
        console.log('資料庫連接測試成功');

        // 清除現有數據
        await clearAllData();
        console.log('已清除所有數據');

        // 初始化示例數據
        await initializeSampleProducts();
        await initializeSampleInbound();
        await initializeSampleOutbound();
        console.log('示例數據初始化完成');

        // 更新自動完成選項
        await updateAutocompleteOptions();

        // 更新頁面顯示
        updateInventoryTable();
        updateInboundTable();
        updateOutboundTable();
        updateDashboard();
        updateReportCharts();

        // 設置按鈕事件監聽器
        setupButtonListeners();
    } catch (error) {
        console.error('初始化時發生錯誤:', error);
        alert('初始化失敗，請檢查控制台獲取詳細信息');
    }
});

// 在相關操作後更新自動完成選項
async function addProduct(event) {
    event.preventDefault();
    try {
        const formData = new FormData(event.target);
        const productData = {
            id: formData.get('productId'),
            name: formData.get('productName'),
            stock: parseInt(formData.get('productStock')),
            location: formData.get('productLocation'),
            category: formData.get('productCategory')
        };

        await addDoc(PRODUCTS, productData);
        closeModal('addProductModal');
        event.target.reset();
        updateInventoryTable();
        updateDashboard();
        updateReportCharts();
        await updateAutocompleteOptions(); // 更新自動完成選項
    } catch (error) {
        console.error('新增商品時發生錯誤:', error);
        alert('新增商品失敗');
    }
}

async function addInbound(event) {
    event.preventDefault();
    try {
        const formData = new FormData(event.target);
        const inboundData = {
            productId: formData.get('productId'),
            quantity: parseInt(formData.get('quantity')),
            date: formData.get('date')
        };

        await addDoc(INBOUND, inboundData);
        await updateProductStock(inboundData.productId, inboundData.quantity);
        closeModal('addInboundModal');
        event.target.reset();
        updateInboundTable();
        updateInventoryTable();
        updateDashboard();
        updateReportCharts();
        await updateAutocompleteOptions();
    } catch (error) {
        console.error('新增入庫時發生錯誤:', error);
        alert('新增入庫失敗');
    }
}

async function addOutbound(event) {
    event.preventDefault();
    try {
        const formData = new FormData(event.target);
        const outboundData = {
            productId: formData.get('productId'),
            quantity: parseInt(formData.get('quantity')),
            date: formData.get('date')
        };

        await addDoc(OUTBOUND, outboundData);
        await updateProductStock(outboundData.productId, -outboundData.quantity);
        closeModal('addOutboundModal');
        event.target.reset();
        updateOutboundTable();
        updateInventoryTable();
        updateDashboard();
        updateReportCharts();
        await updateAutocompleteOptions();
    } catch (error) {
        console.error('新增出庫時發生錯誤:', error);
        alert('新增出庫失敗');
    }
}

// 設置事件監聽器
document.addEventListener('DOMContentLoaded', () => {
    // 測試數據庫連接
    testDatabaseConnection();
    
    // 設置導航
    setupNavigation();
    
    // 設置模態框關閉按鈕
    document.querySelector('.close').addEventListener('click', closeModal);
    
    // 新增商品按鈕
    const addInventoryBtn = document.getElementById('add-inventory-btn');
    if (addInventoryBtn) {
        addInventoryBtn.addEventListener('click', addInventory);
    }
    
    // 新增入庫按鈕
    const addInboundBtn = document.getElementById('add-inbound-btn');
    if (addInboundBtn) {
        addInboundBtn.addEventListener('click', addInbound);
    }
    
    // 新增出庫按鈕
    const addOutboundBtn = document.getElementById('add-outbound-btn');
    if (addOutboundBtn) {
        addOutboundBtn.addEventListener('click', addOutbound);
    }
    
    // 匯出 Excel 按鈕
    const exportExcelBtn = document.getElementById('export-excel-btn');
    if (exportExcelBtn) {
        exportExcelBtn.addEventListener('click', exportToExcel);
    }
    
    // 初始化儀表板
    updateDashboard();
}); 