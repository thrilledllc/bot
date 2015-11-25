var dotenv = require('dotenv').load();

var config = {
  bot: {
    name: process.env.BOT_NAME ?  process.env.BOT_NAME : "bot",
  },
  slack: {
    token: process.env.SLACK_TOKEN
  },
  forecast: {
    apiKey: process.env.FORECAST_IO_API_KEY,
    timeout: 1000
  },
  google: {
    apiKey: process.env.GOOGLE_API_KEY,
    cseId: process.env.GOOGLE_CSE_ID
  }
}

module.exports = config;
