const mongoose=require('mongoose')

const Schema = mongoose.Schema

const bcrypt = require('bcrypt')


const UserSchema = new Schema({
    username:{
        type:String,
        required:[true,'Please provide a username'],
        unique:true
    },
    password:{
        type:String,
        required:[true,'Please provide password']
    }
})

//encripting the password before saving it to the database
UserSchema.pre('save', function(next){
    const user = this
    bcrypt.hash(user.password, 10, (error, hash) => {
    user.password = hash
    next()
    })
})
//exporting the model so that it can be used in the elsewhere in the application

const User = mongoose.model('User',UserSchema)
module.exports = User