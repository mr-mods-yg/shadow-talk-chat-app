import { useEffect, useRef } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { ChatEnd } from "./ChatEnd";
import { ChatStart } from "./ChatStart";
import { formatMessageTime } from "../lib/utils";
import { useUserStore } from "../store/useUserStore";

export function ChatArea() {
  const { messages } = useMessageStore();
  const { socket } = useUserStore();
  const messageContainer = useRef();
  const parentMessageContainer = useRef();

  // SMOOTH SCROLLING
  useEffect(() => {
    if (parentMessageContainer.current) {
      parentMessageContainer.current.scrollTo({
        top: parentMessageContainer.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]); // Runs when messages update


  if (!socket) return <div>ERROR: SOCKET NOT FOUND!!!</div>

  return <div ref={parentMessageContainer} className='flex-1 w-9/10 max-w-5xl border border-secondary p-3 overflow-auto'>
    <div ref={messageContainer} className='w-full'>
      {messages.length == 0 ? <div className='justify-center text-7xl text-center'>
        <p className='text-3xl text-red-400 mb-4'>Tip #1: want to go back? click the logo on the Navbar</p>
        <p className='text-3xl text-green-400'>Tip #2: you can tryout various themes using the dropdown menu</p><br />
        <p>(o_o)</p>
        <p className='text-4xl'>waiting for someone?</p><br />
        <p className='text-4xl'></p>
      </div> : <></>}
      {messages.map((message) => {
        let imageURL = "";
        if(message.hasImage){
          const blob = new Blob([message.image.data], { type: message.image.type });
          imageURL = URL.createObjectURL(blob);
        }
        if (message.senderId == socket.id) return <ChatEnd key={message.id} name={message.name} msg={message.msg}
          time={message.sentAt ? formatMessageTime(message.sentAt): ""} 
          imageSrc={imageURL} imageName={message.image.name}
          />
        return <ChatStart key={message.id} name={message.name} msg={message.msg} 
          time={message.sentAt ? formatMessageTime(message.sentAt) : ""}
          imageSrc={imageURL} imageName={message.image.name}
          />
      })}
      {/* <ChatStart name={"Ujjwal"} msg={"Bad day i guess"} time={"12:44"}/>
      <ChatEnd name={"Bunty"} msg={"So true, can't agree more"} time={"12:44"}/> */}
    </div>
  </div>
}