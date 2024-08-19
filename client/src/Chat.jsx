import { useContext, useEffect, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { UserContext } from "./UserContext";

export default function Chat() {

    const [ws,setWs] = useState(null);
    const [onlinePeople , setOnlinePeople] = useState({ });
    const [selectedUserId , setSelectedUserId] = useState(null);
    const {username , id} = useContext(UserContext);
    const [newMessageText , setNewMessageText] = useState(''); 
    const [messages , setMessages] = useState([]);
    useEffect(()=>{
        const ws = new WebSocket('ws://localhost:4000');
        setWs(ws);
        ws.addEventListener('message',handleMessage);

        function showOnlinePeople(peopleArray){
          const people = { };
          peopleArray.forEach(({username , userId }) => {
            people[userId] = username;
          });
          setOnlinePeople(people);
        }
      

        function handleMessage(ev){
          const messageData = JSON.parse(ev.data);
          // console.log(messageData)
            if('online' in messageData){
              showOnlinePeople(messageData.online);
              // console.log('online')
            }else {
              setMessages(prev => [...prev,{isOur:false , text:messageData.text}]);
            }
        }
    },[]) 

    function sendMessage(ev){
      ev.preventDefault();
      console.log("sending");
      ws.send(JSON.stringify({
        message : {
          recipient : selectedUserId,
          text : newMessageText,
        } 
      }));
      setNewMessageText('');
      setMessages(prev => ([...prev,{text:newMessageText , isOur:true}]));

    }

    const onlinePeopleExclOurUser = {...onlinePeople};
    delete onlinePeopleExclOurUser[id];
  return (
    <div className="flex h-screen">
      <div className="bg-white w-1/3  pt-4">
      
      <Logo/>
        {Object.keys(onlinePeopleExclOurUser).map(userId =>(
          <div key={userId} onClick={()=> setSelectedUserId(userId)} className={"border-b border-gray-100  flex gap-2 items-center cursor-pointer "+ (userId === selectedUserId ? 'bg-blue-50' : '')}>
            {userId === selectedUserId && (
              <div className="w-1 h-12 bg-blue-500 rounded-md"></div>
            )}
            <div className="flex gap-2 py-2 pl-4 items-center">
            <Avatar username={onlinePeople[userId]} userId={userId}/>
            <span className="text-gray-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-blue-50 w-2/3 p-2">
        <div className="flex-grow">
            {!selectedUserId && (
              <div className="flex justify-center items-center h-full">
                <div className="text-gray-300">
                  &larr; Selected Person From The Sidebar
                </div>
              </div>
            )}
            {!!selectedUserId && (
              <div>
                {messages.map(message =>(
                  <div>
                    {message.text}
                  </div>
                )
                )}
              </div>
            )}
        </div>
        {selectedUserId && (
          <form  className="flex gap-2" onSubmit={sendMessage}>
          <input
            type="text"
            value={newMessageText}
            onChange={ev => setNewMessageText(ev.target.value)}
            placeholder="Type your message here "
            className="bg-white border p-2 flex-grow rounded-sm"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
              />
            </svg>
          </button>
        </form>
        )}
        
      </div>
    </div>
  );
}
