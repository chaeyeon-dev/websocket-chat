const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('✅ 클라이언트 접속됨');

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString());

    // ✅ 입장 등록
    if (data.type === "join") {
      ws.name = data.name;

      // 입장 메시지 브로드캐스트
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

    // ✅ 일반 채팅 메시지 브로드캐스트
    if (data.type === "chat") {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('❌ 클라이언트 연결 종료');

    if (!ws.name) return;

    // ✅ 퇴장 메시지
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

console.log('🚀 WebSocket 서버 실행 중 (ws://localhost:8080)');
