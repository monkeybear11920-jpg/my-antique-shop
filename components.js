const components = {
    // 渲染頂部導覽列與分類選單
    renderNavbar() {
        const header = document.getElementById('common-header');
        if (!header) return;
		
		// 從 localStorage 檢查是否有登入資訊 (這是在登入成功後存進去的)
		const userData = JSON.parse(localStorage.getItem('user'));
		
		let authHtml = '';
        if (userData) {
            // 已登入狀態
            authHtml = `
                <div class="auth-group">
                    <span class="user-name"><i class="fa-solid fa-user"></i> ${userData.username}</span>
                    <button onclick="handleLogout()" class="auth-btn logout">登出</button>
                </div>
            `;
        } else {
            // 未登入狀態
            authHtml = `
                <div class="auth-group">
                    <button onclick="location.href='login.html'" class="auth-btn">登入</button>
                    <button onclick="location.href='register.html'" class="auth-btn register">註冊</button>
                </div>
            `;
        }
		
        header.innerHTML = `
        <nav>
            <div class="logo" onclick="location.href='index.html'" style="cursor:pointer;">
                <i class="fa-solid fa-hippo"></i> 古董專賣店
            </div>
			
			<div class="nav-right-group">
				<div class="search-container">
					<input type="text" id="search-input" placeholder="搜尋古董..." onkeyup="handleSearch(event)">
					<i class="fa-solid fa-magnifying-glass"></i>
				</div>
			</div>
			
			${authHtml}
			
            <div class="cart-status" onclick="showCheckout()">
                <i class="fa-solid fa-cart-shopping"></i> 購物車(<span id="cart-count">0</span>)
            </div>
        </nav>
        
        <div class="category-wrapper">
			<div class="nav-bar-container">
				<ul class="main-nav">
					${NAV_MENU.map(item => `
						<li class="nav-item">
							<a href="${item.link || 'javascript:void(0)'}" 
								onclick="filterProducts('${item.id}')">${item.name}</a>
						</li>
					`).join('')}
				</ul>
			</div>

			<div class="mega-menu-panel">
				<div class="mega-grid">
					${NAV_MENU.map(item => `
						<div class="mega-column">
							${item.sub ? `
								<ul class="mega-sub-list">
									${item.sub.map(subItem => `
										<li onclick="filterProducts('${subItem.id}')">${subItem.name}</li>
									`).join('')}
								</ul>
							` : ''}
						</div>
					`).join('')}
				</div>
			</div>
		</div>
		`;
    },

	renderChatBox() {
        if (document.getElementById('chat-app')) return;
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chat-app';
        chatContainer.innerHTML = `
            <div id="chat-button" onclick="toggleChat()"><i class="fa-solid fa-comments"></i></div>
            <div id="chat-window" class="chat-window">
                <div class="chat-header">
                    <span>古董鑑定諮詢</span>
                    <button onclick="toggleChat()">&times;</button>
                </div>
                <div id="chat-messages" class="chat-messages">
                    <div class="msg bot">您好！有什麼我可以幫您的嗎？</div>
                </div>
                <div class="chat-input-area">
                    <input type="text" id="chat-input" placeholder="請輸入訊息..." onkeyup="if(event.key==='Enter')sendMsg()">
                    <button onclick="sendMsg()"><i class="fa-solid fa-paper-plane"></i></button>
                </div>
            </div>
        `;
        document.body.appendChild(chatContainer);
    },
	
    // 渲染結帳彈窗
    renderCheckoutModal() {
        const modalContainer = document.getElementById('common-modal');
        if (!modalContainer) return;

        modalContainer.innerHTML = `
        <div id="checkout-modal" class="modal-overlay">
            <div class="modal-content">
                <span class="btn-close" onclick="closeModal()">&times;</span>
                <h2>您的購物清單</h2>
                <div id="receipt-list"></div>
                <h3 id="modal-total" style="text-align:right;">總計：NT$ 0</h3>
                <button class="btn-pay" onclick="alert('尚未開發，敬請期待！')">確認結帳</button>
            </div>
        </div>
        `;
    },
	renderFooter() {
        const footer = document.getElementById('common-footer');
        if (!footer) return;

        footer.innerHTML = `
            <footer class="footer-container">
                <div class="footer-content">
                    <div class="footer-section">
                        <h4>${SHOP_INFO.name}</h4>
                        <p><i class="fa-solid fa-location-dot"></i> ${SHOP_INFO.address}</p>
                        <p><i class="fa-solid fa-phone"></i> ${SHOP_INFO.tel}</p>
                    </div>
                    <div class="footer-section">
                        <h4>營業時間</h4>
                        <p>${SHOP_INFO.hours}</p>
                    </div>
                    <div class="footer-section">
                        <h4>聯絡我們</h4>
                        <p><i class="fa-solid fa-envelope"></i> ${SHOP_INFO.email}</p>
                    </div>
                </div>
                <div class="footer-bottom">
                    &copy; 2026 ${SHOP_INFO.name} 版權所有.
                </div>
            </footer>
        `;
    }
};

function handleLogout() {
    localStorage.removeItem('user');
    location.href = '/api/logout'; // 呼叫後端清除 session 並導向
}