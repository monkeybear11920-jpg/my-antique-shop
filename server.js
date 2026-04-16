const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 讓後端可以讀取你原本的前端檔案 (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '/')));

// 當有人連線進來時
io.on('connection', (socket) => {
    console.log('一位客人進入了聊天室');

    // 監聽前端傳來的訊息
    socket.on('chat message', (msg) => {
        console.log('收到訊息: ' + msg);
        // 將訊息廣播給所有人（包括你自己）
        io.emit('chat message', {
            text: msg,
            time: new Date().toLocaleTimeString()
        });
    });

    socket.on('disconnect', () => {
        console.log('客人離開了');
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`古董店後端已啟動：http://localhost:${PORT}`);
});