'use strict';
var Alexa = require('alexa-sdk');

var APP_ID = undefined; //OPTIONAL: replace with "amzn1.echo-sdk-ams.app.[your-unique-value-here]";
var SKILL_NAME = 'On Campus Dining';

var dietaryRestriction = "";
// TODO: probably set default to None
var meal = "";

function greeting() {
    return "Welcome to Thunderbird Dining!";
}

function scrapeDining(result) {
    // TODO: grab todays date
    var url = 'https://new.dineoncampus.com/v1/location/menu.json?date=2017-4-20&location_id=587e5ede3191a20db79dd2bc&platform=0&site_id=5751fd3790975b60e04893f0'
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

function setDietaryRestriction() {
    dietaryRestriction = "Vegetarian";
}

function listMeals() {
    chooseMeal(function(meals){
        if(dietaryRestriction == ""){
            console.log("empty");
        }     
        else{
            console.log(dietaryRestriction);
        }
            var result = "";
            for(var m in meals){
                result += meals[m].name + ", ";
            }
            var speechOutput = "The meals are " + result +  ".";
            console.log(speechOutput);
        });
}

function getMeals() {
    chooseMeal(function(meals){
            var chosenMeal = meals;
            var mealList = "Your options for ";
            switch(meal){
                case "Breakfast":
                    chosenMeal = chosenMeal[0].categories;
                    mealList += "breakfast are: ";
                    break;
                case "Lunch":
                    chosenMeal = chosenMeal[1].categories;
                    mealList += "lunch are: ";
                    break;
                case "Dinner":
                    chosenMeal = chosenMeal[2].categories;
                    mealList += "dinner are: ";
                    break;
                case "Brunch":
                    chosenMeal = chosenMeal[3].categories;
                    mealList += "brunch are: ";
                    break;
            }
            for(var category in chosenMeal){
                for(var items in chosenMeal[category].items){
                    //console.log(chosenMeal[category].items[items].name);
                    if(dietaryRestriction == "None"){
                        mealList += chosenMeal[category].items[items].name + "\n";
                    }
                    else {
                        for(var filters in items){
                            if(chosenMeal[category].items[items].filters[filters].name == dietaryRestriction){
                                mealList += chosenMeal[category].items[items].name + ", ";
                            }
                        }
                    }
                }
            }
            console.log(mealList);
        });
}

getMeals();


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
    'ListMealsIntent': function () {
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
    'ChooseVegetarianIntent': function () {
        dietaryRestriction = "Vegetarian";
        this.emit('CheckMealAndDiet');
        // this.emit(':tell', dietaryRestriction + " " + meal);
    },
    'ChooseVeganIntent': function () {
        dietaryRestriction = "Vegan";
        this.emit('CheckMealAndDiet');
        // this.emit(':tell', dietaryRestriction + " " + meal);
    },
    'ChooseNoneIntent': function () {
        dietaryRestriction = "None";
        this.emit('CheckMealAndDiet');
    },
    'ChooseBreakfastIntent': function () {
        meal = "Breakfast";
        this.emit('CheckMealAndDiet');
        // this.emit(':tell', dietaryRestriction + " " + meal);
    },
    'ChooseLunchIntent': function () {
        meal = "Lunch";
        this.emit('CheckMealAndDiet');
        // this.emit(':tell', dietaryRestriction + " " + meal);
    },
    'ChooseDinnerIntent': function () {
        meal = "Dinner";
        this.emit('CheckMealAndDiet');
        // this.emit(':tell', dietaryRestriction + " " + meal);
    },
    'ChooseBrunchIntent': function () {
        meal = "Brunch";
        this.emit('CheckMealAndDiet');
        // this.emit(':tell', dietaryRestriction + " " + meal);
    },
    'CheckMealAndDiet': function () {
        // TODO: rearrange when default is None
        if(meal !== "" && dietaryRestriction == "") {
            this.emit(':tell', "Do you have a dietary restriction or would you like to hear the meals?");
        }
        else if(meal == "" && dietaryRestriction !== "") {
            this.emit(':tell', "What meal will you be eating?");
        }
        else if(meal == "" && dietaryRestriction == ""){
            this.emit(':tell', "Let me know what meal you would like to eat as well as any dietary restrictions you may have.");
        }
        else {
            this.emit('PullMeals');
        }
    },
    'PullMeals': function () {
        var outerThis = this;
        chooseMeal(function(meals){
            var chosenMeal = meals;
            var mealList = "Your options for ";
            switch(meal){
                case "Breakfast":
                    chosenMeal = chosenMeal[0].categories;
                    mealList += "breakfast are: ";
                    break;
                case "Lunch":
                    chosenMeal = chosenMeal[1].categories;
                    mealList += "lunch are: ";
                    break;
                case "Dinner":
                    chosenMeal = chosenMeal[2].categories;
                    mealList += "dinner are: ";
                    break;
                case "Brunch":
                    chosenMeal = chosenMeal[3].categories;
                    mealList += "brunch are: ";
                    break;
            }
            for(var category in chosenMeal){
                for(var items in chosenMeal[category].items){
                    //console.log(chosenMeal[category].items[items].name);
                    if(dietaryRestriction == "None"){
                        mealList += chosenMeal[category].items[items].name + "\n";
                    }
                    else {
                        for(var filters in items){
                            if(chosenMeal[category].items[items].filters[filters].name == dietaryRestriction){
                                mealList += chosenMeal[category].items[items].name + ", ";
                            }
                        }
                    }
                }
            }
            outerThis.emit(':tell',mealList);
        });
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "Please choose a meal you would like to eat and note if you have any dietary restrictions.";
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