const express = require('express');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_DxKauS0pqjm2@ep-fragrant-resonance-an4npvov-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'

// 1. 設定 PostgreSQL 連線
const pool = new Pool({
	connectionString: connectionString,
	ssl: {
		rejectUnauthorized: false // 雲端資料庫通常需要開啟 SSL
	}
});

// 測試連線並顯示日誌
pool.connect((err, client, release) => {
    if (err) return console.error('❌ 資料庫連線失敗：', err.stack);
    console.log('✅ 成功連線至 Neon PostgreSQL');
    release();
});

/*
// 建立伺服器端的訊息倉庫
let chatHistory = {}; // 格式： { customerId: [ {msg}, {msg} ] }
*/

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
/*
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
*/

app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 從資料庫找尋該用戶
        const userRes = await pool.query(
            'SELECT * FROM users WHERE username = $1', 
            [username]
        );

        const user = userRes.rows[0];

        // 檢查用戶是否存在，且密碼是否正確
        // 注意：目前是明文比對，之後建議加上 bcrypt 加密
        if (user && user.password === password) {
            req.session.isAdmin = true;
            req.session.userId = user.id; // 順便把資料庫的 ID 存進 Session
            res.json({ success: true });
        } else {
            res.json({ success: false, message: '帳號或密碼錯誤' });
        }
    } catch (err) {
        console.error('登入查詢錯誤', err);
        res.status(500).json({ success: false, message: '伺服器錯誤' });
    }
});

// 讓後端可以讀取你原本的前端檔案 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

/*
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
*/

io.on('connection', (socket) => {
    
    // 當老闆登入時，從資料庫撈取所有歷史紀錄
    socket.on('admin join', async () => {
        try {
            const res = await pool.query('SELECT * FROM chat_messages ORDER BY created_at ASC');
            
            // 將扁平的資料轉回原本前端習慣的 { id: [msg, msg] } 格式
            const history = {};
            res.rows.forEach(row => {
                if (!history[row.customer_id]) history[row.customer_id] = [];
                history[row.customer_id].push({
                    text: row.text,
                    isAdmin: row.is_admin,
                    time: row.created_at.toLocaleTimeString()
                });
            });
            socket.emit('load history', history);
        } catch (err) {
            console.error('讀取歷史紀錄失敗', err);
        }
    });

    // 當訪客傳訊息時
    socket.on('chat message', async (msg) => {
        const messageData = {
            text: msg,
            isAdmin: false,
            time: new Date().toLocaleTimeString()
        };

        try {
            // 2. 存入 PostgreSQL
            await pool.query(
                'INSERT INTO chat_messages (customer_id, text, is_admin) VALUES ($1, $2, $3)',
                [socket.id, msg, false]
            );

            socket.emit('chat message', messageData);
            io.emit('new customer message', { customerId: socket.id, ...messageData });
        } catch (err) {
            console.error('儲存訊息失敗', err);
        }
    });

    // 當老闆回覆訊息時
    socket.on('admin message', async (data) => {
        const { targetId, text } = data;
        const messageData = {
            text: text,
            isAdmin: true,
            time: new Date().toLocaleTimeString()
        };

        try {
            // 3. 存入 PostgreSQL
            await pool.query(
                'INSERT INTO chat_messages (customer_id, text, is_admin) VALUES ($1, $2, $3)',
                [targetId, text, true]
            );

            io.to(targetId).emit('chat message', messageData);
        } catch (err) {
            console.error('老闆訊息儲存失敗', err);
        }
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