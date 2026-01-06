const http = require("http");
const WebSocket = require("ws");

// ⭐ Render 배포용 포트 (중요)
const PORT = process.env.PORT || 10000;

// ✅ HTTP 서버 (브라우저 접속용)
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("WebSocket 서버가 실행 중입니다.");
});

// ✅ WebSocket 서버를 HTTP 서버에 연결
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("✅ 클라이언트 접속됨");

  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());

    // 입장
    if (data.type === "join") {
      ws.name = data.name;

      const joinMsg = JSON.stringify({
        type: "system",
        text: `${data.name} 님이 입장했습니다`
      });

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(joinMsg);
        }
      });
      return;
    }

    // 채팅
    if (data.type === "chat") {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  // 퇴장
  ws.on("close", () => {
    if (!ws.name) return;

    const leaveMsg = JSON.stringify({
      type: "system",
      text: `${ws.name} 님이 나갔습니다`
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(leaveMsg);
      }
    });
  });
});

// ⭐ 서버 시작
server.listen(PORT, () => {
  console.log(`🚀 WebSocket 서버 실행 중 (port: ${PORT})`);
});
