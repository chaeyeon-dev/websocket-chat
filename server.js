const WebSocket = require('ws');

// ⭐ Render/Railway 배포용 포트 설정
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

wss.on('connection', (ws) => {
  console.log('✅ 클라이언트 접속됨');

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    // ✅ 입장
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

    // ✅ 채팅
    if (data.type === "chat") {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  // ✅ 퇴장
  ws.on('close', () => {
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

console.log(`🚀 WebSocket 서버 실행 중 (port: ${PORT})`);
