/**
 * 初始化購物車：以 ID 為鍵，數量為值 (例如：{ "puer-01": 2 })
 */
let cart = JSON.parse(localStorage.getItem('my_cart')) || {};

function saveCart() {
    // localStorage 只能存字串，所以要用 JSON.stringify 轉換
    localStorage.setItem('my_cart', JSON.stringify(cart));
}

/**
 * 頁面載入：動態渲染商品卡片
 */
function renderProducts(categoryFilter = 'all') {
	const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // 1. 篩選資料
    const filtered = products.filter(p => {
        if (categoryFilter === 'all') return true;

        // 邏輯 A：直接匹配分類 (例如點選 "普洱茶" puer)
        if (p.category === categoryFilter) return true;

        // 邏輯 B：檢查是否為大類 (例如點選 "茶類" tea)
        // 從 NAV_MENU 找到對應的大類物件
        const parentCat = NAV_MENU.find(m => m.id === categoryFilter);
        // 如果該大類有 sub (子分類列表)，檢查商品是否屬於其中之一
        if (parentCat && parentCat.sub) {
            return parentCat.sub.some(s => s.id === p.category);
        }

        return false;
    });

    // 2. 呼叫渲染函數
    renderFilteredArray(filtered);
}

// 新增跳轉函數
function goToDetail(id) {
    // 將頁面導向 detail.html 並在網址帶上商品 ID
    window.location.href = `product_detail.html?id=${id}`;
}

/**
 * 功能：切換分類按鈕狀態並重新渲染
 */
function filterProducts(category) {
    // 檢查是否在首頁
    const isHomePage = document.getElementById("product-grid");
	
	if (!isHomePage) {
        // 不在首頁就跳轉
        window.location.href = `index.html?category=${category}`;
        return;
    }
	
	// 在首頁就直接篩選
    renderProducts(category);
    setActiveButton(category);
	
	// 關閉下拉面板
	const panel = document.querySelector('.mega-menu-panel');
    if (panel) {
        // 暫時透過 JS 強制隱藏，避免點擊後面板擋住商品
        panel.style.opacity = '0';
        panel.style.visibility = 'hidden';
        
        // 0.5秒後移除行內樣式，恢復 CSS 的 hover 邏輯
        setTimeout(() => {
            panel.style.opacity = '';
            panel.style.visibility = '';
        }, 500);
    }
}

// 切換全寬面板顯示/隱藏
function toggleExpandPanel() {
    const panel = document.getElementById('expand-panel');
    const icon = document.getElementById('menu-icon');
    if (!panel) return;

    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
        syncPanelContent(); 
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
}

// 同步所有分類按鈕到全寬面板中 (防止文字卡掉的網格佈局)
function syncPanelContent() {
    const content = document.getElementById('panel-grid-content');
    if (!content) return;

    content.innerHTML = CATEGORY_MAP.map(cat => `
        <button class="cat-item" onclick="filterProducts('${cat.id}')">
            ${cat.name}
        </button>
    `).join('');
	
	// 同步當前選中的狀態到面板
    const urlParams = new URLSearchParams(window.location.search);
    const currentCat = urlParams.get('category') || 'all';
	setActiveButton(currentCat);
}

/**
 * 功能：改變商品卡片上的輸入框數字
 */
function changeInputQty(id, change) {
	const input = document.getElementById(`qty-${id}`);
	let currentVal = parseInt(input.value);
	if (currentVal + change >= 1) { // 確保最少要買 1 個
		input.value = currentVal + change;
	}
}

/**
 * 功能：按「加入購物車」按鈕時觸發
 */	
function addToCartWithQty(id) {
	// 1. 抓取該商品對應的輸入框
	const qtyInput = document.getElementById(`qty-${id}`);
    
	// 2. 取得數值並轉成整數 (使用 parseInt 確保它是數字)
	const quantity = parseInt(qtyInput.value);

	// 3. 檢查數值是否合法
	if (quantity > 0) {
		if (cart[id] === undefined || isNaN(cart[id])) {
            cart[id] = 0;
        }
		cart[id] += quantity;
		saveCart();
		updateSummary();
        
		// 加入後把輸入框重設為 1
		qtyInput.value = 1;
        
		// 提示使用者已加入
		alert(`已加入 ${quantity} 件商品到購物車`);
	} else {
		alert("請輸入有效的數量");
	}
}

/**
 * 功能：更新導覽列的購物車總數量
 */	 
function updateSummary() {
    const totalItems = Object.values(cart).reduce((sum, count) => sum + count, 0);
    const countElement = document.getElementById("cart-count");
    if (countElement) countElement.innerText = totalItems;
}

/**
 * 功能：在結帳視窗內調整數量
 */
function updateQuantity(id, change) {
    if (cart[id] + change >= 0) {
        cart[id] += change;
		saveCart();
        updateSummary();
        showCheckout();
    }
}

/**
 * 功能：從購物車直接移除某項商品
 */
function removeFromCart(id) {
	if (confirm("確定要從購物車中移除這項商品嗎？")) {
		// 1. 將數量歸零
		cart[id] = 0;
		saveCart();
		// 2. 更新導覽列的總數
		updateSummary();
        
		// 3. 重新渲染結帳視窗內容
		showCheckout();
	}
}

/**
 * 功能：顯示結帳彈窗
 */
function showCheckout() {
    let html = "";
    let total = 0;
    products.forEach(p => {
		const count = cart[p.id];
		if (count > 0) {
			total += p.price * count;
			html += `
				<div class="cart-item">
					<div>
						<strong>${p.name}</strong><br>
						<small>NT$ ${p.price.toLocaleString()} x ${count}</small>
					</div>
					<div class="quantity-control">
						<button class="qty-btn" onclick="updateQuantity('${p.id}', -1)">-</button>
						<span>${cart[p.id]}</span>
						<button class="qty-btn" onclick="updateQuantity('${p.id}', 1)">+</button>
                        
						<button class="btn-remove" onclick="removeFromCart('${p.id}')">
							<i class="fa-solid fa-trash-can"></i> 
						</button>
					</div>
				</div>`;
		}
    });
	// 更新 DOM
	const receiptList = document.getElementById("receipt-list");
    if (receiptList) {
        receiptList.innerHTML = html || '<p style="text-align:center; color:#999; padding:20px;">您的購物車目前是空的</p>';
    }
    
    const totalElement = document.getElementById("modal-total");
    if (totalElement) {
        totalElement.innerText = `總計：NT$ ${total.toLocaleString()}`;
    }
    
	// 顯示 Modal
    const modal = document.getElementById("checkout-modal");
    if (modal) {
        modal.classList.add("active");
    }
}

/**
 * 功能：關閉結帳彈窗
 */
function closeModal() { 
	document.getElementById("checkout-modal").classList.remove("active"); 
}

/**
 * 功能：商品搜尋
 */
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    const isHomePage = document.getElementById("product-grid") !== null;

    // 如果按下 Enter 或是在首頁輸入，就執行搜尋
    if (isHomePage) {
        // 直接過濾首頁商品
        renderProductsByKeyword(query);
    } else if (event.key === 'Enter') {
        // 如果在分頁按 Enter，跳回首頁並帶參數
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
    }
}

// 根據關鍵字過濾商品的函數
function renderProductsByKeyword(keyword) {
    const grid = document.getElementById("product-grid");
    if (!grid) return;

    grid.innerHTML = "";

    // 過濾邏輯：名稱或描述包含關鍵字
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(keyword) || 
        p.desc.toLowerCase().includes(keyword)
    );

    if (filtered.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; padding: 50px; text-align: center; color: #999;">
                            <p>找不到與「${keyword}」相關的古董</p>
                          </div>`;
    } else {
        // 呼叫原本 renderProducts 邏輯的簡化版或直接手寫
        // 這裡為了保持 main.js 乾淨，建議稍微重構 renderProducts
        renderFilteredArray(filtered);
    }
}

// 輔助渲染函數
function renderFilteredArray(array) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";
    array.forEach(p => {
        const displayImg = p.images ? p.images[0] : p.img;
        grid.innerHTML += `
            <div class="product-card">
                <img src="${displayImg}" alt="${p.name}" onclick="goToDetail('${p.id}')" style="cursor: pointer;">
                <div class="product-info">
                    <h3 onclick="goToDetail('${p.id}')" style="cursor: pointer;">${p.name}</h3>
                    <p class="price">NT$ ${p.price.toLocaleString()}</p>
                    <div class="quantity-selector">
                        <span class="qty-label">數量：</span>
                        <input type="number" id="qty-${p.id}" value="1" min="1" max="99">
                    </div>
                    <button class="btn-add" onclick="addToCartWithQty('${p.id}')">加入購物車</button>
                </div>
            </div>`;
    });
}

/**
 * 啟動流程：確保資料載入、商品渲染、選單計算
 */
document.addEventListener('DOMContentLoaded', () => {
	if (typeof components !== 'undefined') {
        components.renderNavbar();
        components.renderCheckoutModal();
		components.renderChatBox();
		components.renderFooter();
    }

    updateSummary();
	
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const categoryParam = urlParams.get('category') || 'all';

    if (document.getElementById("product-grid")) {
        if (searchParam) {
            // 如果網址有 search 參數，優先搜尋
            document.getElementById('search-input').value = searchParam;
            renderProductsByKeyword(searchParam);
        } else {
            renderProducts(categoryParam);
            setActiveButton(categoryParam);
        }
    }
	
    syncPanelContent();
});

// 輔助函數：統一設定按鈕 active 狀態
function setActiveButton(category) {
	// 高亮頂部導覽文字
    document.querySelectorAll('.nav-item a').forEach(a => {
        const clickAttr = a.getAttribute('onclick') || "";
        if (clickAttr.includes(`'${category}'`)) {
            a.style.color = 'var(--primary-color)';
            a.style.borderBottom = '2px solid var(--primary-color)';
        } else {
            a.style.color = '';
            a.style.borderBottom = '';
        }
    });

    // 高亮面板內的清單項目 (Mark 效果)
    document.querySelectorAll('.mega-sub-list li').forEach(li => {
        const clickAttr = li.getAttribute('onclick') || "";
        li.classList.toggle('active-mark', clickAttr.includes(`'${category}'`));
    });
}

// --- 聊天室功能 ---
function toggleChat() {
    const win = document.getElementById('chat-window');
    if (win) win.classList.toggle('active');
}

function sendMsg() {
    const input = document.getElementById('chat-input');
    const msgArea = document.getElementById('chat-messages');
    if (!input || !input.value.trim()) return;

    // 使用者訊息
    msgArea.innerHTML += `<div class="msg user">${input.value}</div>`;
    const userText = input.value;
    input.value = '';
    msgArea.scrollTop = msgArea.scrollHeight;

    // 模擬機器人回覆
    setTimeout(() => {
        let reply = "收到您的訊息，鑑定師將盡快回覆您！";
        if (userText.includes("價格")) reply = "古董價格依品相而定，歡迎上傳照片。";
        msgArea.innerHTML += `<div class="msg bot">${reply}</div>`;
        msgArea.scrollTop = msgArea.scrollHeight;
    }, 800);
}

// 讓你在 Console 模擬店家說話，使用F12然後輸入adminReply("訊息內容")
window.adminReply = function(text) {
    const msgArea = document.getElementById('chat-messages');
    msgArea.innerHTML += `
        <div class="msg bot" style="background:#d4edda; align-self:flex-start;">
            <strong>[店家回覆]：</strong>${text}
        </div>`;
    msgArea.scrollTop = msgArea.scrollHeight;
}