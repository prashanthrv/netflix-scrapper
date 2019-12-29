import puppeteer from 'puppeteer'
import CONF from './settings'
import mongoose from 'mongoose'
import {Promise} from "bluebird"

mongoose.connect(CONF.mongoURI, {useNewUrlParser: true,useUnifiedTopology: true })
const db = mongoose.connection

//Connect to the mongo db database
db.on('open', () => {
    console.log('Connected to mongodb!')
});

//Initialize the model
const NetFlix = require('./models/Netflix').default

//Base URL - DO NOT CHANGE
const baseUrl = "https://www.netflix.com";

const PAGE_SCROLL_DELAY = CONF.pageScrollDelay;

let genreCount = 0;

let movieCount = 0;

async function getList(browser, genre, page){
    let url = '';
    if(genre.url.indexOf('?')){
        url = baseUrl+genre.url+'&so=az';
    }
    else{
        url = baseUrl+genre.url+'?so=az';
    }
    await page.goto(url,{timeout:CONF.pageTimeOut});

    const delay = PAGE_SCROLL_DELAY;
    const wait = (ms) => new Promise(res => setTimeout(res, ms));
    const count = async () => {
        return page.evaluate(() => {
           return document.querySelectorAll('.rowContainer').length;
        });
    }
    const scrollDown = async () => {
        page.evaluate(()=>{
            document.querySelector('.rowContainer:last-child').scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'end' });
        });
    }

    let preCount = 0;
    let postCount = 0;
    do {
        preCount = await count();
        await scrollDown();
        await wait(delay);
        postCount = await count();
    } while (postCount > preCount);
    await wait(delay);

    const titleCards = await page.$$('.title-card-container');

    movieCount = movieCount + titleCards.length;
    
    //Getting all the titles from the page
    for(const card in titleCards){
        if(titleCards.hasOwnProperty(card)){
            const titleCard = titleCards[card];
            let netflixLink = await titleCard.$eval('a', node => node.getAttribute('href'));
            netflixLink = netflixLink.split('?')[0];
            const netflixTitle = await titleCard.$eval('a', node => node.getAttribute('aria-label'));
            const netflixImage = await titleCard.$eval('img', node => node.getAttribute('src'));
            let movie = NetFlix({
                title: netflixTitle,
                image: netflixImage,
                link: netflixLink,
                genre: genre.name,
                type: genre.type,
                region: CONF.region
            });
            //Storing the data to mongo db
            movie.save();
        }
    }
}

async function run() {
    const browser = await puppeteer.launch({
        headless: true //Set this to false, to enable screen mode and debug
    });
    const page = await browser.newPage();
    // dom element selectors
    const usernameSelector = '#id_userLoginId';
    const passwordSelector = '#id_password';
    const loginButtonSelector = 'button.login-button';

    await page.goto(baseUrl+'/'+CONF.region+'/login');

    await page.click(usernameSelector);
    await page.keyboard.type(CONF.username);

    await page.click(passwordSelector);
    await page.keyboard.type(CONF.password);

    await page.click(loginButtonSelector);

    await page.waitForSelector('li.profile');

    await page.click(`li.profile:nth-child(${CONF.profileLocation})`);

    const mainTabs = await page.$$('ul.tabbed-primary-navigation li.navigation-tab');

    let moviesUrl = ""
    let tvshowsUrl = ""

    for (const key in mainTabs) {
        if (mainTabs.hasOwnProperty(key)) {
            const element = mainTabs[key];
            const tabName = await element.$eval('a', node => node.innerText);
            if(tabName===CONF.movieTabName){
                moviesUrl = await element.$eval('a', node => node.getAttribute('href'));
            }
            if(tabName===CONF.tvShowTabName){
                tvshowsUrl = await element.$eval('a', node => node.getAttribute('href'));
            }
        }
    }

    await page.goto(baseUrl+moviesUrl);

    await page.click('.subgenres');

    await page.waitForSelector('li.sub-menu-item');
    
    const parsedGenres = await page.$$('li.sub-menu-item');

    let genres = [];

    //Get all the movies genres
    for (const key in parsedGenres){
        if(parsedGenres.hasOwnProperty(key)){
            const element = parsedGenres[key];
            const genre = await element.$eval('a', node => {return {name:node.innerText, url: node.getAttribute('href')}});
            genre.type='movies';
            genres.push(genre);
        }
    }

    await page.goto(baseUrl+tvshowsUrl);

    await page.click('.subgenres');

    await page.waitForSelector('li.sub-menu-item');
    
    const parsedTvGenres = await page.$$('li.sub-menu-item');

    //Get all the tv genres
    for (const key in parsedTvGenres){
        if(parsedTvGenres.hasOwnProperty(key)){
            const element = parsedTvGenres[key];
            const genre = await element.$eval('a', node => {return {name:node.innerText, url: node.getAttribute('href')}});
            genre.type='tvshows';
            genres.push(genre);
        }
    }

    Promise.map(genres,(genre)=>{
        return new Promise(async(resolve) => {
            await browser.newPage().then( page => getList(browser,genre,page).catch((err)=>{console.log(err)}));
            resolve();
        });
    },{concurrency:10}).then(()=>{browser.close()}); //Concurrency is set to 10. Lower this value if you have problem loading multiple pages simultaneously or if you have lower internet speeds.

}

run().catch((err)=>{console.log(err)});