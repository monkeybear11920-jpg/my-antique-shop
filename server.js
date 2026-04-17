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
    socket.join(socket.id);

    socket.on('chat message', (msg) => {
        // 發送給訪客自己 (右邊)
        socket.emit('chat message', {
            text: msg,
            isAdmin: false,
            time: new Date().toLocaleTimeString()
        });

        // 發送給老闆：包含是哪個客人的 ID
        io.emit('new customer message', {
            customerId: socket.id,
            text: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('admin message', (data) => {
        // data: { targetId, text }
        io.to(data.targetId).emit('chat message', {
            text: data.text,
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