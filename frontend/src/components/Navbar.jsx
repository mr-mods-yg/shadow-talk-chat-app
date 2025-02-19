import { Link } from "react-router-dom";
import { THEMES } from "../constants/themes.js";
import { useThemeStore } from "../store/useThemeStore.js";

export function Navbar() {
    const {theme, setTheme} = useThemeStore();
    function onSelectHandler(e){
      if(!THEMES.includes(e.target.value)) return; // THEME NOT FOUND
      setTheme(e.target.value)
    }
    return <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <Link to={'/'} className="btn btn-ghost text-xl">ShadowTalk</Link>
      </div>
      <div className="flex-none">
        <select className='select' onChange={onSelectHandler} defaultValue={theme}>
          {THEMES.map((themeVal)=><option key={themeVal} value={themeVal}>{themeVal}</option>)}
        </select>
      </div>
    </div>
}