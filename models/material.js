//creating the model
const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const MaterialSchema = new Schema({
serialNumber:{
    type:String,
    required:[true,'Please provide a serial number'],
    unique:true
},
warranty: {
    type:Number,
    required:[true,'Please provide a warranty '],
},
datePosted:{
    type:Date,
    required:[true,'Please provide the delivery date']
}
});

//exporting the model
const material = mongoose.model('material',MaterialSchema);
module.exports = material