const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mangadb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

.then(()=>{
    console.log("connected to MongoDB");
})

.catch((err)=>{
    console.log("Error connecting to MongoDB", err);
})
module.exports = mongoose;