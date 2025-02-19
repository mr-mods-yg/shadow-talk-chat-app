/* eslint-disable react/prop-types */
import { Send } from 'lucide-react'
import { socket } from '../socket.js'
import { useEffect, useRef, useState } from 'react'
import { toast } from "react-hot-toast";
import { v4 as uuidv4 } from 'uuid';
import { formatMessageTime } from '../lib/utils.js';

function ChatRoom() {
  const inputData = useRef();
  const parentMessageContainer = useRef();
  const messageContainer = useRef();
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  // SOCKET CONNECTION
  useEffect(() => {
    socket.connect();
    socket.on('connect', () => {
      toast.success("connected with server");
    })
    socket.on('chat-users', (users)=>{
      setUsers(users);
    })
    socket.on('chat-message',(msg)=>{
      // console.log("message recieved from server")
      setMessages(messages => [...messages, msg])
    })
    return () => {
      socket.off('connect');
      socket.off('chat-message');
      socket.off('chat-users');
      socket.disconnect();
    }
  }, [])

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
    if (socket.connected) socket.emit('chat-message', { id: uuidv4() , msg: clientMessage, senderId: socket.id, sentAt: new Date()});
    inputData.current.value = "";
  }
  
  // COMPONENT
  return (
    <>
      <div className='flex-0'>connected users : {users.length}</div>
      <div ref={parentMessageContainer} className='flex-1 w-9/10 max-w-5xl border border-secondary p-3 overflow-auto'>
        <div ref={messageContainer} className='w-full'>
          {messages.map((message)=>{
            if(message.senderId==socket.id) return <ChatEnd key={message.id} name={socket.id} msg={message.msg} time={message.sentAt? formatMessageTime(message.sentAt) : ""}/>
            return <ChatStart key={message.id} name={socket.id} msg={message.msg} time={message.sentAt? formatMessageTime(message.sentAt) : ""}/>
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
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
      </div>
    </div>
    <div className="chat-header">
      {name}
      <time className="text-xs opacity-50">{time}</time>
    </div>
    <div className="chat-bubble">{msg}</div>
    <div className="chat-footer opacity-50">Delivered</div>
  </div>
}

function ChatEnd({name, msg, time}) {
  return <div className="chat chat-end">
    <div className="chat-image avatar">
      <div className="w-10 rounded-full">
        <img
          alt="Tailwind CSS chat bubble component"
          src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
      </div>
    </div>
    <div className="chat-header">
      {name}
      <time className="text-xs opacity-50">{time}</time>
    </div>
    <div className="chat-bubble">{msg}</div>
    <div className="chat-footer opacity-50">Seen at 12:46</div>
  </div>
}
export default ChatRoom;
