import { Outlet, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { requestBackend } from "../utils";


export default function AuthWrapper(){
    const navigate = useNavigate();
    const [tokenIsValid, setTokenIsValid] = useState(null);

    useEffect(()=>{
        const checkTokenValidity = async () => {
            // Attempt to get access token from local storage
            const token = localStorage.getItem("access_token");

            // If token is null set tokenIsValid to false
            if(!token){
                setTokenIsValid(false);
                return;
            }

            // If token not null, check if token is blacklisted from backend
            try{
                const {success, data} = await requestBackend("GET", "http://127.0.0.1:5000/verify-token", "access", null)
                // If token blacklisted, attempt to refresh it
                // Two situations: access_token modified, and doesn't exist or access_token blacklisted, so send refresh
                // Either way need to check if they have refresh token and if refresh fails, then route back.
                if(!success){
                    const {successRefresh, dataRefresh} = await requestBackend("GET", "https://127.0.0.1:5000/refresh", "refresh", null)
                    // If refresh succesful, receive access token and set it in localStorage
                    if(successRefresh){
                        localStorage.setItem("access_token", dataRefresh.access_token)

                        // Check if access token properly (edge case where access token not set properly)
                        const {success, data} = await requestBackend("GET", "http://127.0.0.1:5000/verify-token", "access", null)
                        if(!success){
                            setTokenIsValid(false);
                            return
                        }
                    }else{
                        setTokenIsValid(false);
                        return
                    }
                }
                setTokenIsValid(true);
                
            }catch(error){
                console.log("Error verifying token", error)
                setTokenIsValid(false);
                throw error;
            }
        }
        checkTokenValidity();
    },[])

    useEffect(() => {
        if (tokenIsValid === true) {
            navigate("/application/profile"); // Redirect to profile page if token is valid
        }
    }, [tokenIsValid, navigate]);
    
    if(tokenIsValid === null) {
        return <div className="fixed top-0 left-0 bg-background text-9xl">Loading...</div>; // Wait for the token validity check
    }
    
    return <>{!tokenIsValid && <Outlet/>}</>; // Only render the home page if the token is invalid
}