import { BrowserRouter, Routes, Route } from "react-router-dom";
import ChatRoom from "./pages/ChatRoom.jsx";
import Home from './pages/Home.jsx';
import { Navbar } from "./components/Navbar.jsx";
import { useThemeStore } from "./store/useThemeStore.js";
import CreateRoom from "./pages/CreateRoom.jsx";
import JoinRoom from "./pages/JoinRoom.jsx";

function App() {
    const {theme} = useThemeStore();
    return (
        <div className='flex flex-col items-center h-screen' data-theme={theme}>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/chat/:roomId?" element={<ChatRoom />} />
                    <Route path="/create" element={<CreateRoom />} />
                    <Route path="/join" element={<JoinRoom />} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}

export default App
