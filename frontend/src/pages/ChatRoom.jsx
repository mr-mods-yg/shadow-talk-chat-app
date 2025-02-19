/* eslint-disable react/prop-types */
import { Send } from 'lucide-react'
import { socket } from '../socket.js'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { formatMessageTime } from '../lib/utils.js';
import { useUserStore } from "../store/useUserStore.js";

function ChatRoom() {
  const inputData = useRef();
  const parentMessageContainer = useRef();
  const messageContainer = useRef();
  const {name, setId, roomId, setRoomId} = useUserStore();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const params = useParams();
  // SOCKET CONNECTION

  // useEffect(()=>{
  //   const roomId = params.get("roomid")
  // },[])

  useEffect(() => {
    if(name.trim()=="") return navigate('/');
    socket.connect();
    socket.on('connect', () => {
      console.log("server connected!")
      // toast.success("connected with server");
    })
    if(!params.roomId) {
      // ROOMS NOT FOUND IN PARAMS -> CREATE ROOM
      socket.emit('createRoom', name);
    }
    else{
      // ROOM FOUND IN PARAMS
      socket.emit('joinRoom', {roomId: params.roomId, name});
      setRoomId(params.roomId);
    }
    socket.on('error', (error)=>{
      if(error.errorCode=="ROOM_NOT_FOUND") navigate("/");
      else if(error.errorCode=="NAME_NOT_FOUND") navigate("/join");
      toast.error(error.message);
    })
    socket.on('roomInfo', (obj)=>{
      setId(socket.id);
      setUsers(obj.users);
      setRoomId(obj.roomId);
    })
    socket.on('chatMessage', (msgObj)=>{
      setMessages(messages => [...messages, msgObj])
    })
    return () => {
      socket.off('connect');
      socket.off('chatMessage');
      socket.off('roomInfo');
      socket.off('error');
      socket.disconnect();
    }
  }, [name, navigate, setId, setRoomId, setUsers, params.roomId])

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
  
  // COMPONENT
  return (
    <>
      <div className='flex-0  w-9/10 max-w-5xl'>
        <div className='flex justify-between'>
          <kbd className="kbd kbd-lg">connected users : {users.length}</kbd>
          <kbd className="kbd kbd-lg"> Invite code : {roomId}</kbd>
        </div>
      </div>
      
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
      
      <form className='flex w-9/10 max-w-5xl items-center ' onSubmit={onSubmitHandler}>
        {/* <textarea type="text" placeholder="Primary" className="textarea textarea-secondary w-full"></textarea> */}
        <input ref={inputData} type="text" placeholder="Type here" className="input input-lg input-secondary w-full" />
        <button className="btn btn-secondary h-full"><Send /></button>
      </form>
    </>
  )
}

function ChatStart({name, msg, time}) {
  return <div className="chat chat-start">
    <div className="chat-image avatar">
      <div className="w-10 rounded-full">
        <img
          alt="Tailwind CSS chat bubble component"
          src={"https://api.dicebear.com/9.x/initials/svg?seed="+name} />
      </div>
    </div>
    <div className="chat-header">
      {name}
      <time className="text-xs opacity-50">{time}</time>
    </div>
    <div className="chat-bubble">{msg}</div>
    {/* <div className="chat-footer opacity-50">Delivered</div> */}
  </div>
}

function ChatEnd({name, msg, time}) {
  return <div className="chat chat-end">
    <div className="chat-image avatar">
      <div className="w-10 rounded-full">
        <img
          alt="Tailwind CSS chat bubble component"
          src={"https://api.dicebear.com/9.x/initials/svg?seed="+name} />
      </div>
    </div>
    <div className="chat-header">
      {name}
      <time className="text-xs opacity-50">{time}</time>
    </div>
    <div className="chat-bubble">{msg}</div>
    {/* <div className="chat-footer opacity-50">Seen at 12:46</div> */}
  </div>
}
export default ChatRoom;
