import React, { useState } from "react";
import Home from "./Home";
import Room from "./Room";
import CreateRoom from "./CreateRoom";
import JoinRoom from "./JoinRoom";

interface RoomData {
  roomID: string;
  password: string;
}

const Greeting: React.FC = () => {
  const [connection, setConnection] = useState<WebSocket | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);

  const connectWebSocket = (): WebSocket => {
    const ws = new WebSocket("ws://localhost:3000/ws");
    ws.onopen = () => console.log("Connected to WebSocket server");
    ws.onclose = () => console.log("Disconnected from WebSocket server");
    ws.onerror = (error) => console.error("WebSocket error", error);
    return ws;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      {!connection ? (
        <Home onConnect={() => setConnection(connectWebSocket())} />
      ) : roomData ? (
        <Room roomData={roomData} connection={connection} />
      ) : (
        <>
          <CreateRoom connection={connection} onRoomCreated={setRoomData} />
          <JoinRoom connection={connection} onJoinRoom={setRoomData} />
        </>
      )}
    </div>
  );
};

export default Greeting;
