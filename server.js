const express = require('express');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 建立伺服器端的訊息倉庫
let chatHistory = {}; // 格式： { customerId: [ {msg}, {msg} ] }

app.use(session({
    secret: 'hippo-secret-key', // 你的加密金鑰
    resave: false,
    saveUninitialized: true
}));

// 登入檢查中間件
const auth = (req, res, next) => {
    if (req.session.isAdmin) {
        next(); // 如果有登入標記，繼續前往 admin.html
    } else {
        res.redirect('/login.html'); // 否則踢回登入頁面
    }
};

// --- [重點：幫老闆後台開路] ---
app.get('/admin', auth, (req, res) => {
    // 確保你的 admin.html 檔案是放在根目錄喔！
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 處理登入請求的 API
app.use(express.json()); // 讓伺服器可以解析 JSON 資料
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    // 這裡設定你的帳號密碼
    if (username === 'admin' && password === 'hippo123') {
        req.session.isAdmin = true;
        res.json({ success: true });
    } else {
        res.json({ success: false, message: '帳號或密碼錯誤' });
    }
});

// 讓後端可以讀取你原本的前端檔案 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

// 當有人連線進來時
io.on('connection', (socket) => {
    socket.join(socket.id);

    // 當老闆連線時，把歷史紀錄丟給他
    socket.on('admin join', () => {
        socket.emit('load history', chatHistory);
    });

    socket.on('chat message', (msg) => {
        
        const messageData = {
            text: msg,
            isAdmin: false,
            time: new Date().toLocaleTimeString()
        };

        // 發送給訪客自己 (右邊)
        socket.emit('chat message', messageData);

        // 存入歷史紀錄
        if (!chatHistory[socket.id]) chatHistory[socket.id] = [];
        chatHistory[socket.id].push(messageData);

        // 發送給老闆：包含是哪個客人的 ID
        io.emit('new customer message', {
            customerId: socket.id,
            ...messageData
            //text: msg,
            //time: new Date().toLocaleTimeString()
        });
    });

    socket.on('admin message', (data) => {
        const messageData = {
            text: data.text,
            isAdmin: true,
            time: new Date().toLocaleTimeString()
        };

        // 存入歷史紀錄
        if (chatHistory[data.targetId]) {
            chatHistory[data.targetId].push(messageData);
        }

        io.to(data.targetId).emit('chat message', messageData);
    });
});
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`古董店後端已啟動：http://localhost:${PORT}`);
	console.log(`老闆後台請進：http://localhost:${PORT}/admin`);
});

// 登出路由
app.get('/api/logout', (req, res) => {
    req.session.destroy(); // 清除登入狀態
    res.redirect('/login.html');
});