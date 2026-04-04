import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

let stompClient = null;
let messageCallback = null; // ✅ callback ref — reconnect pe bhi kaam kare

const getToken = () => localStorage.getItem("token") || "";

export const connectSocket = (onMessageReceived) => {
  // ✅ Callback hamesha update karo
  messageCallback = onMessageReceived;

  // Pehle se connected hai toh sirf callback update karo
  if (stompClient && stompClient.active) return;

  stompClient = new Client({
    webSocketFactory: () => new SockJS("http://localhost:8081/ws"),

    connectHeaders: {
      Authorization: `Bearer ${getToken()}`,
    },

    onConnect: () => {
      console.log("✅ WebSocket connected");

      stompClient.subscribe("/user/queue/messages", (msg) => {
        try {
          // ✅ Latest callback use karo — closure problem fix
          if (messageCallback) {
            messageCallback(JSON.parse(msg.body));
          }
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      });
    },

    onStompError: (frame) => {
      console.error("❌ STOMP error:", frame);
    },

    onDisconnect: () => {
      console.log("🔌 WebSocket disconnected");
    },

    reconnectDelay: 5000,
  });

  stompClient.activate();
};

export const sendMessage = (message) => {
  if (stompClient && stompClient.connected) {
    stompClient.publish({
      destination: "/app/chat",
      body: JSON.stringify(message),
    });
  } else {
    console.warn("WebSocket not connected — message not sent");
  }
};

export const disconnectSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
    messageCallback = null;
  }
};