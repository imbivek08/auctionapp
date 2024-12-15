import "./App.css";
import Auction from "./components/Auction";
import AuctionRoom from "./components/AuctionRoom";
import LandingPage from "./components/Greeting";
//import Greeting from "./components/Greeting";
import { Route, Routes } from "react-router-dom";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/room" element={<AuctionRoom />} />
        <Route path="/demo" element={<Auction />} />
      </Routes>
    </>
  );
}

export default App;
