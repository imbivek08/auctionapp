import React, { useState } from "react";

interface RoomProps {
  roomData: { roomID: string; password: string };
  connection: WebSocket;
}

const Room: React.FC<RoomProps> = ({ roomData, connection }) => {
  const [message, setMessage] = useState(""); // State to hold the message

  const handleLeaveRoom = () => {
    connection.close();
    window.location.reload();
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const messageData = {
        type: "broadcastMessage",
        roomID: roomData.roomID,
        message: message,
      };

      // Send the message as a JSON string over the WebSocket
      connection.send(JSON.stringify(messageData));
      setMessage(""); // Clear the input after sending
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Room {roomData.roomID}</h2>
      <p>
        <strong>Password:</strong> {roomData.password}
      </p>

      <div className="mt-6">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here"
          className="border rounded px-4 py-2 w-full mb-2"
        />
        <button
          onClick={handleSendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Send Message
        </button>
      </div>

      <button
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
        onClick={handleLeaveRoom}
      >
        Leave Room
      </button>
    </div>
  );
};

export default Room;
