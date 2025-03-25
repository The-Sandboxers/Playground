import { Outlet } from "react-router"
import AppNavbar from "../components/AppNavbar";

export default function App(){
    return(
        <div>
            <AppNavbar/>
            <Outlet/>
        </div>
    );
}