const { request, response } = require('express');
const express = require('express');
const fetch = require("node-fetch");
const app = express();
require('dotenv').config();

// Host / Local Port
const port = process.env.PORT || 3002
app.listen(port, () => console.log(`Starting server at ${port}`));



app.use(express.static('public'));
// app.use(express.json({ limit: '1mb' }));

app.get('/rates', async (request, response) => {
    const api_key = process.env.API_KEY;
    const ratesUrl = `https://openexchangerates.org/api/latest.json?app_id=${api_key}`;
    const ratesResponse = await fetch(ratesUrl); 
    const rates = await ratesResponse.json();

    response.json(rates);
})




