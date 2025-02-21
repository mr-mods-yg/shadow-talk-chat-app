import { create } from "zustand";
export const useUserStore = create((set)=>({
    id: null,
    name: "",
    roomId: null,
    typingUsers: [],
    setName: (name)=>set({name: name}),
    setId: (id)=>set({id: id}),
    setRoomId: (roomId)=>set({roomId}),
    setTypingUsers: (users)=>set({typingUsers: users})
}));