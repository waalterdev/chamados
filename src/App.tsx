import { useState } from 'react';
import { useUser } from './contexts/UserContext'

function App() {

  const [message, setMessage] = useState("");

  const { user, logout, register, login, changeRole } = useUser();
  
  async function handleReg() {
    const a = await login("admin", "admin");
    setMessage(JSON.stringify(a));
  }

  return (
    <>
    {user ? <span>usuário logado: {user.username}</span> : <></>}
    <br />
    <button onClick={handleReg}>App</button>
    <br />
    <span>{message}</span>
    <br />
    {user ? 
      <button onClick={logout}>logout</button> : <></>
    }
    </>
  )
}

export default App