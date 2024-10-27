import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Signup from './Signup';
import './style.css';

function Login({ userInfo, updateUser }) {
    let API_ROUTE = "http://localhost:3080/"
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

const handleSubmit = async(e) => {
    e.preventDefault();

    // axios.post('http://localhost:8080/login', { email, password })
    //     .then((res) => {
    //         if (res.data.message === "success") {
    //             setSuccessMessage("Login successful");
    //             // Navigate to the dashboard or another page as needed
    //             navigate('/dash');
    //         } else if (res.data.message === "incp") {
    //             setError("Password Incorrect");
    //         } else {
    //             setError("Email incorrect.");
    //         }
    //     })
    //     .catch((err) => {
    //         setError("An error occurred while logging in.");
    //         console.error(err);
    //     });


        if(!email || !password)
        {
            setError("Please enter all fields")
            return;
        }

        
        const response = await fetch(`${API_ROUTE}api/user/loginUser`, {
            method: 'POST',
            body: JSON.stringify({email : email,password : password}),
            headers: {
              'Content-Type': 'application/json'
            }
          })
          const json = await response.json()

          if(json.status === "error")
          {
            setError(json.message)
            return;
          }
          else{
            setError(null);
            setSuccessMessage("Login successful");
            sessionStorage.setItem("user_info", json.data.token);
            let id = sessionStorage.getItem("user_info");
            updateUser(id);
            navigate('/dash');
          }

}

const navStyle = {
    backgroundColor: '#c0e9ad',
}

    return (
        <div>
        <nav className="navbar navbar-expand-lg" style={navStyle}>
                <div className="container-fluid">
                    <Link to='/' className="navbar-brand">Weigh My Plate</Link>
                </div>
            </nav>
        <div className="d-flex justify-content-center align-items-center vh-100">
            
            <div className="bg-white p-3 rounded w-25">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email">
                            <strong>Email</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Email"
                            autoComplete="off"
                            name="email"
                            className="form-control rounded-0"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password">
                            <strong>Password</strong>
                        </label>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            name="password"
                            className="form-control rounded-0"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && <div className="alert alert-danger">{error}</div>}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}
                    <button type="submit" className="btn btn-success w-100 rounded-0">
                        Login
                    </button>
                </form>
                <p>Don't have an account? </p>
                <Link to="/register" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                  Register
                </Link>
            </div>
        </div>
        </div>
    );
}

export default Login;
