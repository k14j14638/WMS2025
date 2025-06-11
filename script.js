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
} catch (error) {
    console.error('Firebase 初始化失敗:', error);
}

// 頁面導航
function showPage(pageId) {
    console.log('顯示頁面:', pageId); // 添加日誌
    
    // 隱藏所有頁面
    document.querySelectorAll('section.page').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // 顯示目標頁面
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        console.log('找到目標頁面:', targetPage); // 添加日誌
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
    } else {
        console.error('找不到頁面:', pageId); // 添加日誌
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
    console.log('導航到頁面:', pageId); // 添加日誌
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
    console.log('初始頁面:', initialPage); // 添加日誌
    showPage(initialPage);
}

// 當 DOM 加載完成時初始化
document.addEventListener('DOMContentLoaded', initializePage);

// 監聽 hash 變化
window.addEventListener('hashchange', () => {
    const pageId = window.location.hash.substring(1);
    console.log('Hash 變化，切換到頁面:', pageId); // 添加日誌
    showPage(pageId);
}); 