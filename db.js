const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://azuredark647:adiparijat2009%40gmail.com@cluster0.mras6kj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
})

    .then(() => {
        console.log("connected to MongoDB");
    })

    .catch((err) => {
        console.log("Error connecting to MongoDB", err);
    })
module.exports = mongoose;