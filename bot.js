exports.Wrapper = Wrapper;

function Wrapper(nick, slack) {
    var self = this;
    self.nick = nick;
    self.slack = slack;
}

Wrapper.prototype.say = function(channel, text) { 
    console.log(text);
    var channel = this.slack.getChannelGroupOrDMByID(channel);
    if (channel) {
        channel.send(text);
    }
}