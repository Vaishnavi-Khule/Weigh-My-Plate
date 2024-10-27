import React from 'react';
import { useState,useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';
import Linegraph from './Linegraph';
import PieChart from './PieChart';

function History() {
    let API_ROUTE = "http://localhost:3080/";
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [lineGraph,setLineGraph] = useState(false);


    useEffect(()=>{
        const user = sessionStorage.getItem("user_info")
        
        const getHistory = async() => {
            
                if(!user)
                {
                    console.log("hahah");
                    navigate("/")
                }

                const response = await fetch(`${API_ROUTE}api/history/getAllHistoryByUserId`, {
                    method: 'GET',
                    // body: JSON.stringify({email : email,password : password}),
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${user}`
                    }
                  })
                  const json = await response.json()
                  console.log("JSON",json)
        
                  if(json.status === "error")
                  {
                    setError(json.message)
                    return;
                  }
                  else{
                    setError(null);
                    setResult(json.data);
                    console.log("data")
                    console.log(result);
                  }
        }
        getHistory();

    },[])

    // let dateFormat = (date) =>
    // {
    //     let dateObject = new Date(date);
    //     const year = dateObject.getFullYear();
    //     const month = (dateObject.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based, so add 1
    //     const day = dateObject.getDate().toString().padStart(2, '0');
        
    //     const formattedDate = `${year}-${month}-${day}`;
    //     // console.log(formattedDate);
    //     return formattedDate;
    // };

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    const navStyle = {
        backgroundColor: '#c0e9ad',
    }
   
    const showHideLineGraph = () => {
        if(lineGraph == true)
            setLineGraph(false);
        else
            setLineGraph(true);
    };

    const lineGraphData = result
  ? result.historyData.map(item => ({
      date: item.date.substring(0,10), 
      totalCal: Math.round(item.total_cal * 100) / 100,
    }))
  : [];

    return (
        <div>
            <nav className="navbar navbar-expand-lg" style={navStyle}>
                <div className="container-fluid">
                    <Link to='/' className="navbar-brand">Weigh My Plate</Link>
                    <form className="form-inline">
                        {/* <Link to='/' className="btn btn-outline-success my-2 my-sm-0" type="submit">Logout</Link> */}
                        {/* <Link to='/history' className="btn btn-outline-success my-2 my-sm-0" type="submit">History</Link> */}
                    </form>
                </div>
            </nav>
            <br></br>
            <div className="showHidebtn">
                <button  onClick={() => showHideLineGraph()} >Graph : {lineGraph ? "Hide" : 'Show'}</button>
                
            </div>
            <br></br>
            {lineGraph && <Linegraph data={lineGraphData}/>}
            <br></br>
            {result && <div className="card-list">
                {result.historyData.map((item, index) => (
                <div className="my-card" key={index}>
                    <div className="my-image-section">
                        <img src={`${API_ROUTE}${item.image_path && item.image_path.substring(1)}` } alt={`Image ${index}`} className="imageRound"/>
                    </div>
                    <div className="data-section">
                        
                        <h2>Date : {item.date.substring(0,10)}</h2>
                        <h2>Total Calorie : {Math.round(item.total_cal*100)/100}</h2>
                        {/* {item.food.map((line, i) => (
                            <p key={i}>{line.food_name} : {Math.round(line.cal*100)/100}</p>
                        ))} */}
                        <PieChart item={item}/>
                    </div>
                </div>
                ))}
            </div>}
        </div>
    );
}

export default History;



