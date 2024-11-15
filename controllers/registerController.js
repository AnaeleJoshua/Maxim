const userDB = {
    users: require('../model/users.json'),
    setUser: function(data){
        this.users = data
    }
}

const fsPromises= require('fs').promises
const path = require('path')
const bcrypt = require('bcryptjs');

const handleNewUser = async (req,res)=>{
    const {user,pwd} = req.body
    if(!user || !pwd) return res.status(400).json({
        'message': 'username and passwordare required'
    })
    //check for duplictes
    const duplicate = userDB.users.find(person => person.username === user) 
    if(duplicate) return res.sendStatus(409) //conflict
     try{
            //encrypt password
            const hashedPassword = await bcrypt.hash(pwd,10)

            //store new user
            const newUser ={
                "username":user, "password":hashedPassword}
                userDB.setUser([...userDB.users,newUser])
           await fsPromises.writeFile(path.join(__dirname,"..","model","users.json"),JSON.stringify(userDB.users))
           console.log(userDB.users)
           res.status(201).json({
            'sucess':`New user ${user} created`
           })
    }catch(error){
        res.status(500).json({'message':error.message})
    }
}

module.exports = {handleNewUser}