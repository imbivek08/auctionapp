import React from "react";

interface HomeProps {
  onConnect: () => void;
}

const Home: React.FC<HomeProps> = ({ onConnect }) => {
  return (
    <div className="p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Auction App</h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={onConnect}
      >
        Connect to WebSocket Server
      </button>
    </div>
  );
};

export default Home;
