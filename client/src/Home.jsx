import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState,useEffect } from 'react'
import axios from 'axios';

import './style.css'; // Replace with the correct path to your CSS file
import Spiner from './Spinner';
//import img from './dataset-cover(1).jpg';


function Home({ userInfo, updateUser }) {
    let API_ROUTE = "http://localhost:3080/";
    const navigate = useNavigate();

    useEffect(()=>{

        const redirecting = () =>{
            const user = sessionStorage.getItem("user_info")
            if(user)
            {
                navigate("/dash")
            }
        }
        redirecting();
    },[])

    const [selectedFile, setSelectedFile] =     useState(null);
    const [result, setResult] = useState(null);
    const [spinner, setSpinner] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        // console.log("here")
        const file = event.target.files[0];
        // console.log("HIII ",file)
        setSelectedFile(file);
        setError(null);
    };

    const handleSubmit = async(event) => {
        if (selectedFile) {

            // const data = new FormData()
            // data.append('file', selectedFile, selectedFile.name)
            // await axios
            // .post(`${API_ROUTE}api/history/uploadAndGetResult`, data, {
            //     onUploadProgress: ProgressEvent => {
            //         setSelectedFile({
            //         loaded: (ProgressEvent.loaded / ProgressEvent.total*100),
            //     })
            //     },
            // })
            // .then(res => {
            //     console.log(res);
            //     console.log(res.statusText)
            // })
            // console.log("File selectred : ",selectedFile.name);
            // console.log("Selected file data:", selectedFile,selectedFile.name);
            setResult(null);
            setError(null);
            setSpinner(true);

            const formData = new FormData();
            formData.append('file', selectedFile);


            const response = await fetch(`${API_ROUTE}api/history/uploadAndGetResult`, {
                method: 'POST',
                body: formData
                // headers: {
                //     'Content-Type': 'multipart/form-data',
                // }
              })
              const json = await response.json()
    
              if(json.status === "error")
              {
                setError(json.message) 
                setSpinner(false);
                return;
              }
              else{
                setError(null);
                setResult(json.data);
                setSpinner(false);
                console.log(json.data);
                console.log("RESULT",result);
              }
      
            
          } else {
            // alert("Please select an image before submitting.");
            setError("Please select an image before submitting.");
          }
    };
    
    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const navStyle = {
        backgroundColor: '#c0e9ad',
    }

    const cStyle = {
        backgroundColor: '#F0E68C',
    }

    return (
        <div>
            <nav className="navbar navbar-expand-lg" style={navStyle}>
                <div className="container-fluid">
                    <Link to='/' className="navbar-brand">Weigh My Plate</Link>
                    <form className="form-inline">
                        <Link to='/login' className="btn btn-outline-success my-2 my-sm-0" type="submit">Login</Link>
                        <Link to='/register' className="btn btn-outline-success my-2 my-sm-0" type="submit">Register</Link>
                    </form>
                </div>
            </nav>
            <br></br>
            <div className="container-fluid " >
                <div className="row">
                    <div className="col">

                    </div>
                    <div className="col-8 ">
                        <div className="row">
                            <div className="col">

                            </div>
                            {/* <div className="col">
                                <form>
                                    <div className="form-group">
                                        <label htmlFor="exampleFormControlFile1"> Input image  </label>
                                        <input type="file" className="form-control-file" id="exampleFormControlFile1" accept=".jpg, .jpeg, .png" onChange={(e) => imageUpload(e.target.value)}/>
                                    </div>
                                </form> 
                            </div> */}

                            <div className='col-8 uploadSection' style={cStyle}>
                                <br></br>
                                <h3>Upload Your Image</h3>
                                <br></br>
                                <div className="upload-btn-wrapper">
                                    <input type="file" name="file" id="file" accept=".jpg, .jpeg, .png" onChange={handleFileSelect} />
                                </div>
                                <br></br>
                                {selectedFile && <p className="text-danger">Selected file : {selectedFile.name}</p>}
                                <br></br>
                                <button className="btn btn-outline-success" onClick={handleSubmit}>Submit</button>
                                <br></br>
                                <br></br>
                                {error && <p className="text-danger">{error}</p>}
                                <br></br>
                            </div>

                            

                            <div className="col">

                            </div>
                        </div>

                    </div>
                    <div className="col">

                    </div>
                </div>
                <br></br>
                <br></br>

                <div className="row">
                    <div className="col">

                    </div>
                    <div className="col-8">
                        {spinner && <Spiner/>}
                        {result && <div className="my-card">
                            <div className="my-image-section">
                                <img src={`${API_ROUTE}${result.resoponseToSend && result.resoponseToSend.image && result.resoponseToSend.image.substring(1)}`} alt={`Image`} className="imageRound" />
                            </div>
                            <div className="data-section">
                                
                                <h2>Date : {result.resoponseToSend.date.substring(0,10)}</h2>
                                <h2>Total Calorie : {Math.round(result.resoponseToSend.total_cal*100)/100}</h2>
                                {result.resoponseToSend.food.map((line, i) => (
                                    <p key={i}>{line.food_name} : {Math.round(line.cal*100)/100}</p>
                                ))}
                            </div>
                        </div>}
                    </div>
                    <div className="col">

                    </div>
                </div>

            </div>
        </div>
    );
}

export default Home;
