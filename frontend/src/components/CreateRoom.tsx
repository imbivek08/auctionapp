import React, { useState } from "react";

interface CreateRoomProps {
  connection: WebSocket;
  onRoomCreated: (roomData: { roomID: string; password: string }) => void;
}

const CreateRoom: React.FC<CreateRoomProps> = ({
  connection,
  onRoomCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = () => {
    if (connection.readyState !== WebSocket.OPEN) {
      setError("Connection to the server is not open.");
      return;
    }

    setLoading(true);
    setError(null);

    const message = { type: "createRoom", password: "" };

    // Send the create room message to the server
    try {
      connection.send(JSON.stringify(message));
    } catch (err) {
      setLoading(false);
      setError("Failed to send message to the server.");
      console.error("WebSocket send error:", err);
      return;
    }

    // Handle server response
    connection.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        if (response.type === "roomCreated") {
          onRoomCreated({
            roomID: response.roomID,
            password: response.password,
          });
          setLoading(false);
        } else if (response.type === "error") {
          setError(response.message || "An error occurred.");
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to process server response.");
        setLoading(false);
        console.error("WebSocket response error:", err);
      }
    };
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Room</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <button
        className={`bg-green-500 text-white px-4 py-2 rounded ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={handleCreateRoom}
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
    </div>
  );
};

export default CreateRoom;
