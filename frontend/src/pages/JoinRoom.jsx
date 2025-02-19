import { Send } from "lucide-react"
import { useUserStore } from "../store/useUserStore"
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

function JoinRoom() {
    let navigate = useNavigate();
    const {name, setName, roomId, setRoomId} = useUserStore();
    const onSubmitHandler = (e)=>{
        e.preventDefault();
        if(name.trim()=="") return toast.error("Please provide a name!");
        if(roomId.trim()=="") return toast.error("Please provide a roomId!");
        // create the room
        navigate("/chat/"+roomId);
    }
    return (
        <div className="relative flex flex-col items-center justify-center h-screen w-screen">
            {/* Background Image */}
            {/* <div 
        className="absolute inset-0 w-5/10 h-full bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/nathan-dumlao.jpg')" }}
      ></div> */}
            {/* removed background image because it was looking not very good across light themes */}

            {/* Content Section */}
            <div className="relative text-center mb-8">
                <div className="flex flex-col items-center gap-2 group">
                    <div className="size-18 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Send className="size-9 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mt-2">Talk in Shadows, Stay in Control.</h1>
                    <p className="text-base-content/60">{"Every phantom has a name... what's yours?"}</p>
                </div>
            </div>

            {/* Buttons */}
            <form className="flex flex-col" onSubmit={onSubmitHandler}>
                <label className="form-control w-full">
                    <input type="text" onChange={(e)=>{
                        setName(e.target.value);
                    }} placeholder="Enter your name" className="input input-lg input-bordered w-full max-w-xs" />
                </label>
                <label className="form-control w-full mt-5">
                    <input type="text" onChange={(e)=>{
                        setRoomId(e.target.value);
                    }} placeholder="Enter room code" className="input input-lg input-bordered w-full max-w-xs" />
                </label>
                <button className="btn btn-lg w-full mt-5">Join Shadow</button>
            </form>
            
        </div>
    )
}

export default JoinRoom
