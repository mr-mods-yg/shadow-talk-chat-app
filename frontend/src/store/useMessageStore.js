import { create } from "zustand";
export const useMessageStore = create((set)=>({
    messages: [],
    setMessages: (messages)=>set({messages:messages}),
    resetMessages: ()=>set({messages:[]}),
    appendMessage: (newMsg)=>set((state)=>({
        messages: [...state.messages, newMsg]
    }))
}));