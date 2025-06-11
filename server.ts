import { v4 as uuidv4 } from "uuid";
import { Server, WebSocket } from "ws";

interface Client extends WebSocket {
    id: string;
}

const wss = new Server({ port: 8080 });

wss.on("connection", (ws: Client) => {
    // Assign a unique ID to the client
    ws.id = uuidv4();

    // Send the client their ID
    ws.send(JSON.stringify({ type: "connection", id: ws.id }));

    ws.on("message", (message: Buffer | string) => {
        try {
            const msg = JSON.parse(message.toString());

            if (msg.type === "message") {
                const broadcastMessage = JSON.stringify({
                    type: "message",
                    sender: ws.id,
                    content: msg.content,
                });
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(broadcastMessage);
                    }
                });
            }
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    });

    ws.on("close", () => {
        console.log(`Client disconnected: ${ws.id}`);
    });
});

console.log("WebSocket server running on ws://localhost:8080");
