const express =  require('express')
const cors = require('cors')
const { urlencoded } = require('express')

const authRoutes = require("./routes/auth.js")

const app = express()
const PORT = process.env.PORT || 5000

require('dotenv').config()

//allow cross origin requests
app.use(cors())
//parse json payloads from frontend to backend
app.use(express.json())
app.use(express.urlencoded({extended: false}));

app.get('/', (_req, res) => {
    res.send('Hello world')

})

app.use('/auth', authRoutes)

app.listen(PORT, () => console.log(`Server running on PORT  ${PORT}`))