require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./router/userRouter')
const foodRouter = require('./router/foodRouter')
const historyRouter = require('./router/historyRouter')
const cors = require('cors');

// sudo systemctl start mongod

const app = express();

app.use(cors());

// To pass all incoming data of body to request parameter
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(`${__dirname}/uploads`));

// routes
app.use('/api/user',userRouter);
app.use('/api/food',foodRouter);
app.use('/api/history',historyRouter);

const port = process.env.PORT | 3080;

mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Connected to db");
        //Listen on port
        app.listen(port,()=>{
            console.log("Listening on "+port);
        });
    })
    .catch((error) => {
        console.log("Error connecting to db.",error)
    })
