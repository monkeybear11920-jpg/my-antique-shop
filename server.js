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
    console.log('連線成功:', socket.id);

    // 1. 訪客一連線，自動加入以自己 ID 命名的房間
    socket.join(socket.id);

    // 2. 訪客傳訊息
    socket.on('chat message', (msg) => {
        // 發送給該房間（訪客自己）以及老闆
        // 我們把發送者的 ID 帶上，老闆端才知道是誰在說話
        io.to(socket.id).emit('chat message', {
            text: msg,
            senderId: socket.id,
            isAdmin: false,
            time: new Date().toLocaleTimeString()
        });
        
        // 額外通知老闆：有人發新訊息了（用於老闆端生成分頁標籤）
        io.emit('new customer', { id: socket.id, msg: msg });
    });

    // 3. 老闆回覆訊息
    socket.on('admin message', (data) => {
        // data 應包含 { targetId: "客人的ID", text: "內容" }
        io.to(data.targetId).emit('chat message', {
            text: data.text,
            senderId: 'admin',
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