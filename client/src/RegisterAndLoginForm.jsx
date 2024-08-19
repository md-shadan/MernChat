import { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function RegisterAndLoinForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("register");
  

  async function handleSubmit(ev) {
    ev.preventDefault();
    const url = isLoginOrRegister === 'register' ? 'register' : 'login'
    try {
      const { data } = await axios.post(url, { username, password });
      setLoggedInUsername(username);
      setId(data.id);
      console.log(username);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <div className="bg-blue-50 h-screen flex items-center mb-12">
      <form className="w-64 mx-auto" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(ev) => setUsername(ev.target.value)}
          type="text"
          placeholder="User Name"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          type="password"
          placeholder="Password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button
          className="bg-blue-500 text-white block w-full rounded-sm p-2"
          type="submit"
        >
          {isLoginOrRegister === 'register' ? 'Register' : 'Login'}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === 'register' && (
            <div>
              Already a member?
              <button onClick={()=> setIsLoginOrRegister('login')}>
                Login here
              </button>
            </div>
          )}

          {isLoginOrRegister === 'login' && (
            <div>
              Don't have account?
              <button onClick={()=>setIsLoginOrRegister('register')}>
                Register here
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}


