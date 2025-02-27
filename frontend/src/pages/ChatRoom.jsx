import { socket } from '../lib/socket.js'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useUserStore } from "../store/useUserStore.js";
import { ChatInput } from '../components/ChatInput.jsx';
import { RoomStatus } from '../components/RoomStatus.jsx';
import { useMessageStore } from '../store/useMessageStore.js';
import { ChatArea } from '../components/ChatArea.jsx';
import BlinkingWatcher from '../components/BlinkingWatcher.jsx';

function ChatRoom() {
  const { name, setId, setRoomId, setUsers, setSocket } = useUserStore();
  const { appendMessage, resetMessages } = useMessageStore();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    socket.connect();
    setSocket(socket);
    
    // LOADING STATE MANAGEMENT
    socket.on('connect', () => {
      setLoading(false);
    })
    
    // PARAM CHECK HANDLER
    if (!params.roomId) {
      // ROOMS NOT FOUND IN PARAMS -> CREATE ROOM
      if (name.trim() == "") {
        toast.error("please enter your name!");
        return navigate('/create')
      };
      socket.emit('createRoom', name);
    }
    else {
      // ROOM FOUND IN PARAMS -> JOIN ROOM
      if (name.trim() == "") {
        toast.error("please enter your name to join a room!");
        return navigate('/join')
      };
      socket.emit('joinRoom', { roomId: params.roomId, name });
    }

    // SOCKET ERROR HANDLER
    socket.on('error', (error) => {
      if (error.errorCode == "ROOM_NOT_FOUND") navigate("/");
      else if (error.errorCode == "NAME_NOT_FOUND") navigate("/join");
      toast.error(error.message);
    })

    // SOCKET INFO UPDATER
    socket.on('roomInfo', (obj) => {
      setId(socket.id);
      setUsers(obj.users);
      setRoomId(obj.roomId);
    })

    // SOCKER MSG RECIEVER
    socket.on('chatMessage', (msgObj) => {
      appendMessage(msgObj);
    })

    // COMPONENT UNMOUNTED -> SOCKET DISCONNECTION 
    return () => {
      socket.off('connect');
      socket.off('chatMessage');
      socket.off('roomInfo');
      socket.off('error');
      socket.disconnect();
      setSocket(null);
      resetMessages();
    }
  }, [name, navigate, setId, setRoomId, setUsers, params.roomId, setSocket, appendMessage, resetMessages])

  if (loading)
    return <BlinkingWatcher/>


  // MAIN CHAT ROOM COMPONENT
  return (
    <>
      {/* ROOM STATUS */}
      <RoomStatus />

      {/* CHAT AREA */}
      <ChatArea />

      {/* CHAT INPUT BOX AND TYPING INDICATOR */}
      <ChatInput />
    </>
  )
}

export default ChatRoom;
