const userDB = {
    users: require('../model/users.json'),
    setUser: function(data){
        this.users = data
    }
}

const fsPromises =require('fs').promises;
const path = require('path')


const handleLogOut = async (req,res)=>{
    //on client, also delete the accessToken

    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204) // no content
    const refreshToken = cookies.jwt;
    //is refresh token in db?
    const foundUser=userDB.users.find(person=>person.refreshToken === refreshToken)
    if (!foundUser)
        {
            res.clearCookie('jwt',{httpOnly:true})
            return res.sendStatus(204)

        }; 
    //delete refresh token from db
    const otherUsers = userDB.users.filter(person => person.refreshToken != foundUser.refreshToken)
    const currentUser = {...foundUser,refreshToken:""}
    userDB.setUser([...otherUsers,currentUser])
    await fsPromises.writeFile(
        path.join(__dirname,'../','model','users.json'),JSON.stringify(userDB.users)
    )
    res.clearCookie('jwt',{httpOnly:true, maxAge: 24 * 60 * 60* 1000}); // in Production add 'secure:true' - only serves on https
    // res.sendStatus(204)
    res.status(204).json('logout successfully')
        
}
module.exports= {handleLogOut}

//extract  cookie from req
//ensure token has jwt property
//find user with that refresh token  

//difference between res.status and res.sendStatus is that res.status sets the status and allows you 
//send a custom message with the e.g res.status(200).json({}) whereas res.sendStatus sets the status code and also sends the standard http status message.
