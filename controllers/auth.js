const {connect}  = require('getstream')
const bcrypt = require('bcrypt')
const StreamChat = require('stream-chat').StreamChat
const crypto = require('crypto')
require('dotenv').config()

const fs = require('fs')
const path = require('path')


const api_key = process.env.STREAM_API_KEY
const api_secret = process.env.STREAM_API_SECRET
const api_id = process.env.STREAM_API_ID

//log handling
let dateObject = new Date()
let date = dateObject.toLocaleDateString()
let time  = dateObject.toLocaleTimeString()

if(!fs.existsSync(path.join(__dirname, '/logs'))){
    fs.mkdir(path.join(__dirname, '/logs'), {}, error=>{
        if(error) throw error
    })
}

 

const signup = async (req, res) =>{
    try{
        // get  data from form
        const {fullname, username, phoneNumber, password, confirmPassword, avatarImage} = req.body  
        //create unique id for the user
        const userID = crypto.randomBytes(16).toString('hex')
        //connect to stream 
        const serverClient = connect(api_key, api_secret, api_id)
        // hash user password - salt strength 10
        const hashedPassword = await bcrypt.hash(password, 10)

        const token = serverClient.createUserToken(userID)
        // send data back to frontend
        res.status(200).json({token, fullname, username, userID, hashedPassword, phoneNumber})
            
        if(token) {
            let message = `Successful signup from user with id ${userID} on ${date} at ${time} \n`
                
            fs.appendFile(path.join(__dirname, '/logs', 'successful_signups.txt'), message, err=>{
                if(err) throw err
            })


        }      

    }catch(error){       
        res.status(500).json({message: error})
       
    }
    
}


const login = async (req, res) =>{
    try{
        // get data from form
        const {username, password} = req.body
        //connect to stream
        const serverClient = connect(api_key, api_secret, api_id)
        const client = StreamChat.getInstance(api_key, api_secret)
        //query for user with matching username from database
        const {users} = await client.queryUsers({name: username})
        
        if(!users.length) res.status(400).json({message: 'User not found'})
        // encrypt the password and compare it
        const success = await bcrypt.compare(password, users[0].hashedPassword)

        // create new token
        const token = serverClient.createUserToken(users[0].id)
        
        if(success) {
            let message = `Successful login from user with id ${users[0].id} on ${date} at ${time} \n`
          
            fs.appendFile(path.join(__dirname, '/logs', 'successful_logins.txt'), message, err=>{
                if(err) throw err
            })
            res.status(200).json({token, fullname:users[0].fullname, username, userID:users[0].id})

        }else{
            let message = `Incorrect Password Login Error occured on ${date} at ${time} from user with the id ` + users[0].id + '\n'
          
            fs.appendFile(path.join(__dirname, '/logs', 'login_errors.txt'), message, err=>{
                if(err) throw err
            })
            
            res.status(500).json({message: 'Incorrect password'})
            
            
        }

        

    }catch(error){     
        res.status(500) 

    }

}



module.exports = {signup, login}
