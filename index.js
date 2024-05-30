const connectToMongo = require('./db');
const express = require('express');
const { sendMail } = require('./utils/sendmail');
var cors = require('cors');
require("dotenv").config();
connectToMongo();
const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())


app.use('/api/auth', require('./crud/auth'));
app.use('/api/query', require('./crud/query'));
app.use('/api/profiles', require('./crud/dashboard'))


app.listen(port, () => {
  console.log(`server listening at http://localhost:${port}`)
})


//********************now listen message and to do */




/************************************************Some Important Points*************************************************/
/* to make requests from one website to another website in the browser,
 which is normally prohibited by another browser policy*/
//  express.json() to print json in the console.