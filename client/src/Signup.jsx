

import { useState } from "react";

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';


function Signup() {
    let API_ROUTE = "http://localhost:3080/"
    const [name, setName] = useState();
    const [password, setPassword] = useState();
    const [email, setEmail] = useState(); 
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();


        if(!name || !password || !email)
        {
            setError("Please enter all fields")
            return;
        }
        

        const response = await fetch(`${API_ROUTE}api/user/registerUser`, {
            method: 'POST',
            body: JSON.stringify({name : name,password : password,email : email}),
            headers: {
                'Content-Type': 'application/json'
            }
            })
            const json = await response.json();
            console.log(json);
            if(json.status === "error")
            {
                setError(json.message)
            }
            else{
                setError(null);
                navigate('/login');
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
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name">
                            <strong>Name</strong>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter Name"
                            autoComplete="off"
                            name="name"
                            className="form-control rounded-0"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
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
               

                    {error && <p className="text-danger">{error}</p>}
                    
                    <button type="submit" className="btn btn-success w-100 rounded-0">
                        Register
                    </button>
                </form>
                <p>Already Have an Account</p>
                <Link to="/login" className="btn btn-default border w-100 bg-light rounded-0 text-decoration-none">
                    Login
                </Link>
            </div>
        </div>
        </div>
    );
}

export default Signup;
