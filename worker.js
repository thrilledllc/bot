'use strict';
var fs = require('fs'),
  path = require('path'),
  Bot = require('./bot'),
  Slack = require('slack-client'),
  scriptsDir = __dirname + "/scripts/",
  scripts = [],
  scriptsLoaded = [],
  queue = [],
  config = require(__dirname+"/config");

fs.readdirSync(scriptsDir).filter(function (file) {
    return file.match(/^[^_].*\.js$/);
  }).map(function (file) {
    return path.basename(file, ".js");
  }).forEach(function (filename) {
    scripts.push(require(scriptsDir + filename));
    scriptsLoaded.push(filename);
  });

var autoReconnect = true,
    autoMark = true,
    slackClient = new Slack(config['slack']['token'], autoReconnect, autoMark),
    slackWrapper = new Bot.Wrapper(config['bot']['name'], slackClient),
    to = '';

  slackClient.on('open', function() {
      var channels = [],
          groups = [],
          unreads = slackClient.getUnreadCount(),
          key;

      for (key in slackClient.channels) {
        if (slackClient.channels[key].is_member) {
          channels.push('#' + slackClient.channels[key].name);
        }
      }

      for (key in slackClient.groups) {
        if (slackClient.groups[key].is_open && !slackClient.groups[key].is_archived) {
          groups.push(slackClient.groups[key].name);
        }
      }

      console.log('Welcome to Slack. You are @%s of %s', slackClient.self.name, slackClient.team.name);
      console.log('You are in: %s', channels.join(', '));
      console.log('As well as: %s', groups.join(', '));
      console.log('You have %s unread ' + (unreads === 1 ? 'message' : 'messages'), unreads);
    });

  slackClient.on('message', function(message) {
    if (message.type === 'message' && message.text) {
      console.log('channel: ' +  message.channel + ' got message ' + message.text);
      var user = slackClient.getUserByID(message.user);
      var userName = user ? user.name : 'unknown';
      scripts.forEach(function (script) {
        script(config, slackWrapper, message.channel, to, userName, message.text);
      });
    }
  });
  
  slackClient.on('error', function(error) {
    console.error('Error: %s', error);
  });
  
  slackClient.login();