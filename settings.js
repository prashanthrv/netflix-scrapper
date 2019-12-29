module.exports = {
	region: 'in', //Country ID like [in - India], [us - United States of America], [fr - France] ...
	movieTabName: 'Movies', //Tab Name for Movie in Netflix's main page
	tvShowTabName: 'TV Shows', //Tab Names for TV Show in Netflix's main page
	username: '', //Netflix Username
	password: '', //Netflix Password
	profileLocation: '1', //The profile to be selected after login [1...5] 1 - selects first profile
	mongoURI: 'mongodb://<Host Name>:<Port>/<Database Name>', //Mongo DB URI
	pageScrollDelay: 4000, //The page scroll delay used to scroll through pages to get all the movies and tv show. Increase this if you have lower internet connection speed.
	pageTimeOut: 30000, //The page timeout used to wait inital page load. Default 30 seconds
}