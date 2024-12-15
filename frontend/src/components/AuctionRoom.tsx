import PlayerCard from "./PlayerCard";
import TeamCard from "./TeamCard";

const AuctionRoom = () => {
  return (
    <div className="bg-[#0F172A] min-h-screen min-w-full">
      <div className="flex gap-8">
        <div className="flex flex-col gap-4">
          <div>
            <TeamCard />
          </div>
          <div>
            <TeamCard />
          </div>
        </div>
        <div>
          <PlayerCard />
        </div>
        <div>
          <div>
            <TeamCard />
          </div>
          <div>
            <TeamCard />
          </div>
        </div>
      </div>

      <div className="flex gap-10">
        <TeamCard />
        <TeamCard />
        <TeamCard />
        <TeamCard />
      </div>
    </div>
  );
};

export default AuctionRoom;
