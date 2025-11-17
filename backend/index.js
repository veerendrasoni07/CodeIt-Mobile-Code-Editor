const express = require('express')
const app = express()
const body_parser = require('body-parser');
const codeRouter = require('./routes/code');
const geminiRouter = require('./routes/gemini');
const port = 3000;
const cors = require('cors');
app.use(cors());
app.use(body_parser.json())
app.use(codeRouter);
app.use(geminiRouter);


app.listen(port,()=>{
    console.log("Server is connected");
})