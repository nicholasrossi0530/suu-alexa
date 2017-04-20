'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var SKILL_NAME = 'On Campus Dining';

function greeting() {
    return "Welcome to Thunderbird Dining!";
}

function scrapeDining(result) {
    var url = 'https://new.dineoncampus.com/v1/location/menu.json?date=2017-4-19&location_id=587e5ede3191a20db79dd2bc&platform=0&site_id=5751fd3790975b60e04893f0';
var http = require('https');
http.get(url, function(res){
    var body = '';

    res.on('data', function(chunk){
        body += chunk;
    });

    res.on('end', function(){
        var response = JSON.parse(body);
        result(response);
    });
}).on('error', function(e){
      console.log("Got an error: ", e);
});
}

function chooseMeal(meals) {
    scrapeDining(function(result){
        meals(result.menu.periods);
    });
}

function listMeals() {
    chooseMeal(function(meals){     
            var result = "";
            for(var m in meals){
                result += meals[m].name + " ";
            }
            var speechOutput = "The meals are " + result +  ".";
            console.log(speechOutput);
        });
}


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':tell', greeting());
    },
    'ChooseMealIntent': function () {
        var outerThis = this;
        chooseMeal(function(meals){     
            var result = "";
            for(var m in meals){
                result += meals[m].name + ", ";
            }
            var speechOutput = "The meals are " + result + ".";
            outerThis.emit(':tell', speechOutput);
        });
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "You can say tell me a space fact, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Goodbye!');
    }
};