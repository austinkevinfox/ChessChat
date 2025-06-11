"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const uuid_1 = require("uuid");
const wss = new ws_1.Server({ port: 8080 });
wss.on("connection", (ws) => {
    // Assign a unique ID to the client
    ws.id = (0, uuid_1.v4)();
    console.log(`Client connected: ${ws.id}`);
    // Send the client their ID
    ws.send(JSON.stringify({ type: "connection", id: ws.id }));
    ws.on("message", (message) => {
        try {
            const msg = JSON.parse(message.toString());
            console.log(`Received from ${ws.id}:`, msg.content);
            // Broadcast message with sender ID
            const broadcastMessage = JSON.stringify({
                type: "message",
                sender: ws.id,
                content: msg.content,
            });
            wss.clients.forEach((client) => {
                if (client.readyState === ws_1.WebSocket.OPEN) {
                    client.send(broadcastMessage);
                }
            });
        }
        catch (error) {
            console.error("Error parsing message:", error);
        }
    });
    ws.on("close", () => {
        console.log(`Client disconnected: ${ws.id}`);
    });
});
console.log("WebSocket server running on ws://localhost:8080");
