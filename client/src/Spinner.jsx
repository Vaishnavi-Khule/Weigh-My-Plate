

import { useState } from "react";

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './style.css';
import loading from './assets/Infinity.png'


function Spiner() {
    
    

    return (
        <div className="spinnerStyle">
            <img src={loading} alt = "loading"/>
        </div>
    );
}

export default Spiner;
