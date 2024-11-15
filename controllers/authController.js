const fs = require('fs').promises

const userDB = {
    // users: require('../model/users.json'), //model\users.json
    setUser: function(data){
        this.users = data
    },
    users: async ()=>{
        try{
            const rawData = await fs.readFile(path.join(__dirname,'../','model','users.json'),'utf-8')
        
            return  JSON.parse(rawData)
        }catch(err){
            console.error('error reading the file',err)
        }
    }
}
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fsPromises =require('fs').promises;
const path = require('path')
const bcrypt = require('bcryptjs')

const handleLogin = async (req,res)=>{
    const {user,pwd} = req.body
    if(!user || !pwd) return res.status(400).json({
        'message': 'username and passwordare required'
    })
    // console.log(fs.access(path.join(__dirname,'../','model','users.json')))
    console.log(await userDB.users())
    let foundUser= await userDB.users()
    foundUser = foundUser.find(person=>person.username === user)
    if (!foundUser)return res.sendStatus(401);
    //evaluate password
    const match = await bcrypt.compare(pwd,foundUser.password);
    console.log(match)
    if(match){
        //create a jwts
        const accessToken = jwt.sign(
            {"username":foundUser.username},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'30s'}
        )
        const refreshToken = jwt.sign(
            {"username":foundUser.username},process.env.REFRESH_TOKEN_SECRET,{expiresIn:'1d'}
        )
        //saving refreshToken with current user
        const otherUsers = userDB.users.filter(person=>person !== foundUser.username)
        const currentUser = {...foundUser,refreshToken}
        userDB.setUser([...otherUsers,currentUser])
        await fsPromises.writeFile(
            path.join(__dirname,'../','model','users.json'),JSON.stringify(userDB.users)
        )
        res.cookie('jwt',refreshToken,{httpOnly:true,maxAge: 24 * 60 * 60* 1000}) //sets refreshtoken to memory 
        res.status(200).json({accessToken})
    }else{
        res.sendStatus(401)
    }
}
module.exports= {handleLogin}