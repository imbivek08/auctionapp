import React, { useState } from "react";

interface JoinRoomProps {
  connection: WebSocket;
  onJoinRoom: (roomData: { roomID: string; password: string }) => void;
}

const JoinRoom: React.FC<JoinRoomProps> = ({ connection, onJoinRoom }) => {
  const [roomID, setRoomID] = useState("");
  const [password, setPassword] = useState("");

  const handleJoinRoom = () => {
    const message = { type: "joinRoom", roomID, password };
    connection.send(JSON.stringify(message));

    connection.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (response.type === "joinedRoom") {
        onJoinRoom({ roomID, password });
      } else if (response.type === "error") {
        alert(response.message);
      }
    };
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Join Room</h2>
      <input
        type="text"
        placeholder="Room ID"
        value={roomID}
        onChange={(e) => setRoomID(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleJoinRoom}
      >
        Join Room
      </button>
    </div>
  );
};

export default JoinRoom;
