import { useContext } from "react";
import { UserContext } from "./UserContext";
import RegisterAndLoinForm from "./RegisterAndLoginForm";
import Chat from "./Chat.jsx";

export default function Routters() {
    const {username , id} = useContext(UserContext);
    if(username){
        console.log(username)
        return <Chat/>
    } 

    return(
        
        <RegisterAndLoinForm/>
    );

}