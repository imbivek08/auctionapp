import React, { useEffect, useState } from "react";

type Message = string;

const Auction: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const wsUrl = "ws://localhost:3000/ws";
  const [ws, setWs] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log("WebSocket connection established");
    };

    websocket.onmessage = (event: MessageEvent) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };

    websocket.onclose = (event: CloseEvent) => {
      console.log("WebSocket connection closed:", event.reason);
    };

    websocket.onerror = (error: Event) => {
      console.error("WebSocket error:", error);
    };

    setWs(websocket);

    // Cleanup on component unmount
    return () => {
      websocket.close();
    };
  }, [wsUrl]);

  const sendMessage = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(input);
      setInput("");
    } else {
      console.warn("WebSocket connection is not open.");
    }
  };

  return (
    <div>
      <h1>Live Auction</h1>
      <div>
        <h2>Bidding Messages</h2>
        <div
          style={{
            border: "1px solid black",
            padding: "10px",
            height: "200px",
            overflowY: "scroll",
          }}
        >
          {messages.map((msg, index) => (
            <div key={index}>{msg}</div>
          ))}
        </div>
      </div>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your bid"
          style={{ marginRight: "10px" }}
        />
        <button onClick={sendMessage}>Place Bid</button>
      </div>
    </div>
  );
};

export default Auction;
