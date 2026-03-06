import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from "react-router-dom"
import {registerSW} from 'virtual:pwa-register'

import './index.css'
import App from './App.tsx'

import {Home} from './pages/Home.tsx'
import {BlogIndex} from "./pages/BlogIndex.tsx";
import {BlogPost} from "./pages/BlogPost.tsx";

registerSW({
    immediate: true,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App/>}>
                    <Route index element={<Home/>}/>
                    <Route path="blog" element={<BlogIndex/>}/>
                    <Route path="blog/:slug" element={<BlogPost/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)