import { create } from "zustand";
export const useUserStore = create((set)=>({
    id: null,
    setId: (id)=>set({id: id}),

    name: "",
    setName: (name)=>set({name: name}),

    roomId: null,
    setRoomId: (roomId)=>set({roomId}),

    typingUsers: [],
    setTypingUsers: (users)=>set({typingUsers: users}),

    users: {},
    setUsers: (users)=>set({users: users}),

    socket: null,
    setSocket: (socket)=>set({socket:socket})
}));