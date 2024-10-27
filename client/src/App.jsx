import { useState,useEffect } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Signup from './Signup'
import Login from './Login'
import Dash from './Dashboard'
import Home from './Home'
import History from './History'
function App() {

  const [ user, setLoginUser] = useState()
  
  const updateUser = (newUser) => {
    setLoginUser(newUser);
  };

  useEffect(() => {
    var userInfo = sessionStorage.getItem("user_info");
    updateUser(userInfo);
}, [])
  

  return (
  <BrowserRouter>
  <Routes>
    <Route exact path="/" element={user ? <Dash userInfo={user} updateUser={updateUser}/> : <Home userInfo={user} updateUser={updateUser}/>} />
    {/* <Route path='/' element={<Home />}> </Route> */}
    <Route exact path="/register" element={user ? <Dash userInfo={user} updateUser={updateUser}/> :<Signup/>} />
    {/* <Route path='/register' element={<Signup />}>  </Route> */}
    <Route exact path="/login" element={user ? <Dash userInfo={user} updateUser={updateUser}/> :<Login userInfo={user} updateUser={updateUser}/>} />
     {/* <Route path='/login' element={<Login />}>  </Route> */}
    <Route exact path="/dash" element={user ? <Dash userInfo={user} updateUser={updateUser}/> : <Home userInfo={user} updateUser={updateUser}/>} />
    {/* <Route path='/dash' element={<Dash />}></Route> */}
    <Route exact path="/history" element={user ? <History userInfo={user} updateUser={updateUser}/> : <Home userInfo={user} updateUser={updateUser}/>} />


  </Routes>

  </BrowserRouter>
  )
}

export default App
