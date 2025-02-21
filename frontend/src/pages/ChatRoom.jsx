/* eslint-disable react/prop-types */
import { Send } from 'lucide-react'
import { socket } from '../lib/socket.js'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { formatMessageTime } from '../lib/utils.js';
import { useUserStore } from "../store/useUserStore.js";
import { ChatStart } from '../components/ChatStart.jsx';
import { ChatEnd } from '../components/ChatEnd.jsx';

function ChatRoom() {
  const inputData = useRef();
  const parentMessageContainer = useRef();
  const messageContainer = useRef();
  const {name, setId, roomId, setRoomId, setTypingUsers} = useUserStore();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState({});
  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    if(name.trim()=="") return navigate('/');
    socket.connect();
    socket.on('connect', () => {
      console.log("server connected!")
    })
    if(!params.roomId) {
      // ROOMS NOT FOUND IN PARAMS -> CREATE ROOM
      socket.emit('createRoom', name);
    }
    else{
      // ROOM FOUND IN PARAMS -> JOIN ROOM
      socket.emit('joinRoom', {roomId: params.roomId, name});
      setRoomId(params.roomId);
    }

    // SOCKET ERROR HANDLER
    socket.on('error', (error)=>{
      if(error.errorCode=="ROOM_NOT_FOUND") navigate("/");
      else if(error.errorCode=="NAME_NOT_FOUND") navigate("/join");
      toast.error(error.message);
    })

    // SOCKET INFO UPDATER
    socket.on('roomInfo', (obj)=>{
      setId(socket.id);
      setUsers(obj.users);
      setRoomId(obj.roomId);
    })

    // SOCKER MSG RECIEVER
    socket.on('chatMessage', (msgObj)=>{
      setMessages(messages => [...messages, msgObj])
    })
    let oldTimer;
    socket.on('typingUsers', (users)=>{
      if(oldTimer) clearTimeout(oldTimer);
      setTypingUsers(users);
      oldTimer = setTimeout(()=>{
        setTypingUsers([]);
      }, 1500);
    })

    // COMPONENT UNMOUNTED -> SOCKET DISCONNECTION 
    return () => {
      socket.off('connect');
      socket.off('chatMessage');
      socket.off('roomInfo');
      socket.off('typingUsers');
      socket.off('error');
      socket.disconnect();
    }
  }, [name, navigate, setId, setRoomId, setUsers, params.roomId, setTypingUsers])

  // SMOOTH SCROLLING
  useEffect(() => {
    if (parentMessageContainer.current) {
      parentMessageContainer.current.scrollTo({
        top: parentMessageContainer.current.scrollHeight,
        behavior: "smooth", 
      });
    }
  }, [messages]); // Runs when messages update

  // MESSAGE SUBMIT HANDLER
  function onSubmitHandler(e) {
    e.preventDefault();
    const clientMessage = inputData.current.value;
    if (clientMessage.trim() == "") return;
    // if server is connected then send the message to the server
    if (socket.connected) socket.emit('chatMessage', { id: uuidv4() , msg: clientMessage, name,  senderId: socket.id, roomId:roomId, sentAt: new Date()});
    inputData.current.value = "";
  }
  
  // CHAT MESSAGE CHANGE HANDLER
  let cooldownTimer;
  function chatMessageChangeHandler() {
    if (!socket.connected || cooldownTimer) return;

    socket.emit('userTyping', { senderId: socket.id, roomId });

    cooldownTimer = setTimeout(() => {
      cooldownTimer = null;
    }, 700);
  }

  // MAIN CHAT ROOM COMPONENT
  return (
    <>
      {/* ROOM STATUS */}
      <div className='flex-0  w-9/10 max-w-5xl'>
        <div className='flex justify-between'>
          <kbd className="kbd kbd-lg">connected users : {Object.keys(users).length}</kbd>
          <kbd className="kbd kbd-lg"> Invite code : {roomId}</kbd>
        </div>
      </div>

      {/* CHAT AREA */}
      <div ref={parentMessageContainer} className='flex-1 w-9/10 max-w-5xl border border-secondary p-3 overflow-auto'>
        <div ref={messageContainer} className='w-full'>
          {messages.length==0? <div className='justify-center text-7xl text-center'>
            <p className='text-3xl text-red-400 mb-4'>Tip #1: want to go back? click the logo on the Navbar</p>
            <p className='text-3xl text-green-400'>Tip #2: you can tryout various themes using the dropdown menu</p><br />
            <p>(o_o)</p>
            <p className='text-4xl'>waiting for someone?</p><br />
            <p className='text-4xl'></p>
          </div>:<></>}
          {messages.map((message)=>{
            if(message.senderId==socket.id) return <ChatEnd key={message.id} name={message.name} msg={message.msg} time={message.sentAt? formatMessageTime(message.sentAt) : ""}/>
            return <ChatStart key={message.id} name={message.name} msg={message.msg} time={message.sentAt? formatMessageTime(message.sentAt) : ""}/>
          })}
          {/* <ChatStart name={"Ujjwal"} msg={"Bad day i guess"} time={"12:44"}/>
          <ChatEnd name={"Bunty"} msg={"So true, can't agree more"} time={"12:44"}/> */}
        </div>
      </div>

      {/* CHAT INPUT BOX AND TYPING INDICATOR */}
      <form className='flex-col w-9/10 max-w-5xl items-center ' onSubmit={onSubmitHandler}>
        {/* <textarea type="text" placeholder="Primary" className="textarea textarea-secondary w-full"></textarea> */}
        <TypingUser users={users}/>
        <div className='flex w-full h-12'>
          <input ref={inputData} type="text" onChange={chatMessageChangeHandler} placeholder="Type here" className="input input-lg input-secondary flex-1" />
          <button className="btn btn-secondary flex-0 h-full"><Send /></button>
        </div>
      </form>
    </>
  )
}

// TYPING INDICATOR COMPONENT
function TypingUser({users}){
  const {typingUsers} = useUserStore();
  const currentTypingUsers = typingUsers.map((id)=>users[id].name);
  const currentTypingUsersLength = currentTypingUsers.length;

  if(currentTypingUsersLength==1){
    return <div>
      {currentTypingUsers} is typing...
    </div>
  }
  else if(currentTypingUsersLength==2){
    return <div>
      {currentTypingUsers[0]} and {currentTypingUsers[1]} are typing...
    </div>
  }
  else if(currentTypingUsersLength==3){
    const startingThreeUsers = currentTypingUsers.slice(0,2);
    return <div>
      {startingThreeUsers[0]}, {startingThreeUsers[1]}, {startingThreeUsers[2]} are typing...
    </div>
  }
  else if(currentTypingUsersLength>3){
    return <div>
    Several people are typing...
  </div>
  }
  else{
    return <></>
  }
}

export default ChatRoom;
