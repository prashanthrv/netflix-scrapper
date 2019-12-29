import { Schema, model } from 'mongoose';

//Model to store netflix data
const netflixSchema = new Schema({
    title: String, // Netflix title of the movie or tv show
    image: String, //Netflix's title container image
    link: String, //Netflix's link to content
    genre: String, //Genre of the movie or tv show
    type: String, //movie or tvshow
    region: String, // Country (in,us,fr,...)
    addedTime : { 
        type : Date, 
        default: Date.now
    }
},{ collection: 'netflix_collection_init' }) //Collection name to store the netflix data
    
const NetflixModel = model('Netflix', netflixSchema)

export default NetflixModel