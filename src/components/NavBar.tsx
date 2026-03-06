// import type { ButtonHTMLAttributes, ReactNode } from 'react'
import {Link} from "react-router-dom";
import tamiLogo from "../assets/tamilogoBW.svg";

export function NavBar() {
    return (
        <div id="navbar" className="tamiCard">
            <Link to="/">Main</Link>
            <Link to="/blog">Blog</Link>

            <img src={tamiLogo}/>
        </div>
    )
}