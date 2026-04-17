const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- [重點：幫老闆後台開路] ---
app.get('/admin', (req, res) => {
    // 確保你的 admin.html 檔案是放在根目錄喔！
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// 讓後端可以讀取你原本的前端檔案 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

// 當有人連線進來時
io.on('connection', (socket) => {
    console.log('新連線:', socket.id);

    // 監聽客人訊息
    socket.on('chat message', (msg) => {
        // 廣播給所有人，並標記 isAdmin 為 false
        io.emit('chat message', {
            text: msg,
            isAdmin: false,
            time: new Date().toLocaleTimeString()
        });
    });

    // 監聽老闆訊息
    socket.on('admin message', (msg) => {
        // 廣播給所有人，並標記 isAdmin 為 true
        io.emit('chat message', {
            text: msg,
            isAdmin: true,
            time: new Date().toLocaleTimeString()
        });
    });
});
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`古董店後端已啟動：http://localhost:${PORT}`);
	console.log(`老闆後台請進：http://localhost:${PORT}/admin`);
});