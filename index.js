//*********************************************importing the models in this project*******************************************************************
const express = require('express')
const path = require('path')
const ejs = require('ejs')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const bcrypt = require('bcrypt')
const expressSession = require('express-session')
const flash = require('connect-flash')

// *********************************************costum middlwears*************************************************************************************
//validation middlwear (this one will be used with the blogpost creation form)
const validateMiddleWare = (req,res,next)=>{
    if(req.files==null || req.body.title==null || req.body.body==null){         // this checks if the form is not empty and if it is the middleware redirects the userto the create page
       return res.redirect('/posts/new')
    }
    next()
} 
// validation middleware for the search form
const searchValidate = async(req,res,next)=>{
    if(req.body.title == null){
        return res.redirect('/')
    }
    const blogposts = await blogPost.find({})
    var found = 0
    for(var i = 0; i < blogposts.length; i++){
        console.log(found)
        if (req.body.title===blogposts[i].title){
            console.log(found)
            found = 1
        }
        
    }
    if(found == 0){
        console.log(found)
        return res.redirect('/')
    }
    next()
}
//authontification middle ware
const authMiddleware=(req,res,next)=>{
    User.findById(req.session.userId,(error,user)=>{
        if(error || !user){
            return res.redirect('/')   
        }
        next()
    })
}

//authontification middle ware that grants access to a specific user
const authMiddlewareSpec=(req,res,next)=>{
    User.findById(req.session.userId,(error,user)=>{
        if(error || !user || user.username!='ho'){
            return res.redirect('/')   
        }
        next()
    })
}

//a middlewear to prevent the user from accessing the login and new user page if he is alreadylogged in 

const redirectIfAuthenticatedMiddleware=(req,res,next)=>{
    if(req.session.userId){
        return res.redirect('/')  //if the user is logged in then redirect him to the home page
    }
    next()

}



//*******************************************importing the blogpost model************************************************************
const { exit } = require('process')
const User = require('./models/User.js')
const material = require('./models/material.js')

//*******************************************creating a new instance of express****************************************************** 
const app = new express();

//*******************************************connect to the local database*****************************************************
mongoose.connect('mongodb+srv://hatim:hatim@cluster0.y5caqwv.mongodb.net/test', {useNewUrlParser: true})

//*******************************************seting the view engine to ejs***********************************************
app.set('view engine','ejs')

//*******************************************using the static files stored in public********************************************************

app.use(express.static('public'))

//********************************************using the body parser variable***************************************************************************

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))
app.use(fileUpload())

//*******************************************using the session element************************************************************************
app.use(expressSession({
    secret: 'keyboard cat'
}))

//******************************************using the flush object in order to clear the error msgs ****************************************
app.use(flash())
    
//**********************************conditionally displaying links*********************************************
//making session variablle global so that it can be accessed elsewhere in the application and then assigning it the loggedIn variable
global.loggedIn = null;
app.use("*", (req, res, next) => {
loggedIn = req.session.userId;
next()
});

//********************************************starting a server on port 4000*********************************************************************

let port = process.env.PORT;
if (port == null || port == "") {
port = 4000;
}
app.listen(port, ()=>{
console.log('App listening...')
})


//********************************************applaying costum middlewares**************************************************************
// the create form
app.use('/posts/store',validateMiddleWare)
//the search form
app.use('/search',searchValidate)

//********************************************hundling the get requests coming from the browser***********************************************************************

app.get('/',async (req,res)=>{
    res.render('index')
})


app.get('/auth/register',authMiddlewareSpec,(req,res)=>{
    if(req.session.userId){
        res.render('register',{
            errors:req.session.validationErrors1
        })
    }else{
        res.redirect('/auth/login')
    }
    
})

app.get('/auth/login',redirectIfAuthenticatedMiddleware,(req,res)=>{
    res.render('login')
})

app.get('/auth/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})

app.get('/new/material',(req,res)=>{
    res.render('createM',{
        errors:req.session.validationErrors
    })
})

app.get('/here/material',(req,res)=>{
    const mat =[{_id:null,serialNumber:'',warranty:'',dateposted:''}]
    res.render('materialSupp',{
        mat
    })
})


//*************************************************************hundling the post request coming from the browser************************************************************************


//hundling the register user reques

app.post('/users/register',(req,res)=>{
    User.create(req.body,(error,user)=>{
        if(error){
            const validationErrors =Object.keys(error.errors).map(key => error.errors[key].message)
            req.session.validationErrors1 = validationErrors
            return res.redirect('/auth/register')
        }
        res.redirect('/')
    })
})

//hundling the login request

app.post('/users/login',(req, res) =>{
    const { username, password } = req.body;
    User.findOne({username:username}, (error,user) => {
    if (user){
    bcrypt.compare(password, user.password, (error, same) =>{
    if(same){ // if passwords match
    // store user session, will talk about it later
    req.session.userId = user._id
    res.redirect('/')
    }
    else{
    res.redirect('/auth/login')
    }
    })
    }
    else{
    res.redirect('/auth/login')
    }
    })
})

//hundling the request to add a new material

app.post('/add/material',(req,res)=>{
    material.create(req.body,(error,material)=>{
        if(error){
            const validationErrors = Object.keys(error.errors).map(key => error.errors[key].message)
            req.session.validationErrors=validationErrors
            return res.redirect('/new/material')
        }
        res.redirect('/')
    })

})

//hundling the post request to search for specific material

app.post('/material/search',async (req,res)=>{
    const mat= await material.find({serialNumber:req.body.serialNumber}) 
    console.log(mat)
    res.render('materialSupp',{
        mat
    })
})
    