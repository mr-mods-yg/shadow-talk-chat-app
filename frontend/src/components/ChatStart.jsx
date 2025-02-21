// eslint-disable-next-line react/prop-types
export function ChatStart({name, msg, time}) {
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