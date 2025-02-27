import { useEffect, useRef, useState } from "react";
import { useUserStore } from "../store/useUserStore";
import { TypingUserStatus } from "./TypingUserStatus";
import { v4 as uuidv4 } from 'uuid';
import { Image, Send, Trash2 } from "lucide-react";

export function ChatInput(){
    const {users, roomId, socket, setTypingUsers, name} = useUserStore();
    const [image, setImage] = useState(null);
    const imageComponent = useRef(null);
    const inputData = useRef();

    useEffect(()=>{
      // SOCKET TYPING USERS
      if(!socket) return;

      let oldTimer;
      socket.on('typingUsers', (users) => {
        if (oldTimer) clearTimeout(oldTimer);
        setTypingUsers(users);
        oldTimer = setTimeout(() => {
          setTypingUsers([]);
        }, 1500);
      })

      return ()=>{
        if (oldTimer) clearTimeout(oldTimer);
        socket.off('typingUsers');
      }
    }, [setTypingUsers, socket])

    // MESSAGE SUBMIT HANDLER
    async function onSubmitHandler(e) {
      console.log("message submit");
      e.preventDefault();
      const clientMessage = inputData.current.value;
      // if there is no image and text then do not send the message
      if (clientMessage.trim() == "" && !image) return;
      let hasImage = false;
      let imageObject = {};
      if(image){
        console.log("message submit has an image attached");
        hasImage = true;
        const arrayBuffer = await image.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        imageObject = {
          data: uint8Array,    // Binary content
          name: image.name,     // File name
          type: image.type      // MIME type (e.g., image/png)
        }
      }
      // if server is connected then send the message to the server
      if (socket.connected) socket.emit('chatMessage', { 
        id: uuidv4(), msg: clientMessage, name: name, 
        senderId: socket.id, roomId: roomId, sentAt: new Date(),
        image: imageObject, hasImage: hasImage
      });
      inputData.current.value = "";
      setImage(null);
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
  
    // IMAGE UPLOAD HANDLER
    const imageUploadHandler = () => {
      if (imageComponent.current) {
        imageComponent.current.click();
      }
    }
    // IMAGE CHANGE HANDLER
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        console.log("selected file : " + file.name);
        setImage(file);
      }
    }
    // IMAGE REMOVE HANDLER
    const removeImageHandler = () => {
      setImage(null);
    }

    if(!socket) return <div className="">ERROR: SOCKET NOT FOUND!!</div>

    return <form className='flex-col w-9/10 max-w-5xl items-center '>
    {image ? <div className='flex'>
              <img className='h-auto w-3/20 min-w-28'
               src={URL.createObjectURL(image)} />
              <button className='p-1' onClick={removeImageHandler}><Trash2 className='p-0.5  border-1 rounded-md hover:bg-secondary' /></button>
             </div> : <></>}
    <TypingUserStatus users={users} />
    <div className='flex w-full h-12'>
      <input ref={inputData} type="text" onChange={chatMessageChangeHandler} onKeyDown={(e)=>{
        if(e.key==="Enter" && !e.shiftKey){
          e.preventDefault();
          onSubmitHandler(e);
        }
      }} onPaste={(e)=>{
        const item = e.clipboardData.items[0];
        if(item.type.startsWith("image/")){
          setImage(item.getAsFile());
        }
      }} placeholder="Type here" className="input input-lg input-secondary flex-1" />
      <button type="button" className="btn btn-secondary flex-0 h-full" onClick={(e)=>{
        e.preventDefault();
        onSubmitHandler(e);
      }}><Send /></button>
      <button type="button" className="btn btn-secondary flex-0 h-full" onClick={imageUploadHandler}><Image /></button>
      <input className="hidden" ref={imageComponent} type="file" id="imageInput" accept="image/*" onChange={handleImageChange} />
    </div>
  </form>
  }