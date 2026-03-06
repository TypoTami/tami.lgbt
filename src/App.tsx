import './App.css'
import {Outlet} from 'react-router-dom'
import {NavBar} from './components/NavBar'
import {PwaInstallPrompt} from "./components/PwaInstallPrompt.tsx";

function App() {

    return (
        <>
            <NavBar/>
            <PwaInstallPrompt/>
            <Outlet/>
        </>
    )
}

export default App
