import { useUserStore } from "../store/useUserStore";

export function RoomStatus() {
    const {roomId, users} = useUserStore();
    return <div className='flex-0  w-9/10 max-w-5xl'>
      <div className='flex flex-wrap justify-between'>
        <kbd className="kbd kbd-lg">Connected users : {Object.keys(users).length}</kbd>
        <kbd className="kbd kbd-lg">Invite code : {roomId}</kbd>
      </div>
    </div>
  }