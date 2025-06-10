import { useUserStore } from "../store/useUserStore";
import {Clipboard} from "lucide-react";
import toast from "react-hot-toast";
export function RoomStatus() {
    const {roomId, users} = useUserStore();
    return <div className='flex-0  w-9/10 max-w-5xl'>
      <div className='flex flex-wrap justify-between'>
        <kbd className="kbd kbd-lg">Connected users : {Object.keys(users).length}</kbd>
        <kbd className="kbd kbd-lg flex gap-1 tooltip" data-tip="click to copy" onClick={()=>{
          navigator.clipboard.writeText(roomId);
          toast.success("Copied to clipboard",{duration: 2000});
        }}>Invite code : {roomId} <Clipboard size={22}/></kbd>
      </div>
    </div>
  }