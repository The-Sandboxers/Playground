import { Outlet } from "react-router"
import Navbar from '../components/HomeNavbar';

export default function App(){
    return(
        <div>
            App
            <Navbar/>
            {/* <Outlet/> */}
        </div>
    );
}