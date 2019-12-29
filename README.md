## Netflix Scrapper

Logs into Netflix and scrapes all the Movies and Tv Shows. This basically works by pulling the genre links from the main page and looping those pages and scrolling through the page, until it reaches the end. Then it stores the title's element in a structured data.

> Since the data is fetched from all the genres, there will be same movies/tv shows under different Genres. So it is better to filter out these based on link/title if you like.

| Name | Type | Description |
|--|--|--|
| title | String | Title of the movie or tv show
| image | String | Link to Netflix's title image card
| link  | String | Link to Netflix's title to watch the content
| genre | String | Genre from which the title is fetched
| region| String | The region from which the title is fetched

**Pre-Requisites**
 - Node v12.0.0
 - Babel JS v7.7
 - puppeteer v1.20.0
 - mongoose v5.8.3
 - bluebird v3.7.2

**Configuration**

Open settings.js and configure your netflix's username and password and also configure your Mongo db URI.

**Install dependencies**

    npm install
**Run the script**

    node start.js