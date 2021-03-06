"use strict";
// Constants
var DEFAULT_TIME = 60;
var PENALTY_TIME = 10
var KEY_QANDA = "qanda"
var KEY_HIGHSCORE = "highscore";

// Variables
var loadedQuestions;
var currentQuestion = 0;
var counter = 0;
var timer;
var highscore = [];

// Functions
function loadHighScores() {
    // Load high scores if they exist.
    if (localStorage.getItem(KEY_HIGHSCORE)) {
        highscore = JSON.parse(localStorage.getItem(KEY_HIGHSCORE));
        return highscore;
    } else {
        return false;
    }
}


function storeHighScore(userInitials, score) {
    highscore.push({
        "player": userInitials,
        "score": score
    })
    localStorage.setItem(KEY_HIGHSCORE, JSON.stringify(highscore));
}

function shuffleArray(arrayToShuffle) {
    // Shuffles whatever array is parsed to it.
    for(var i = arrayToShuffle.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * i)
        var temp = arrayToShuffle[i];
        arrayToShuffle[i] = arrayToShuffle[j];
        arrayToShuffle[j] = temp;
    }
    // Return shuffled result.
    return arrayToShuffle;
}


function loadData() {
    if(!localStorage.getItem(KEY_QANDA)) {
        // it's the first time playing so set the default - and load the questions!
        localStorage.setItem(KEY_QANDA, JSON.stringify(shuffleArray(questions)));
        loadedQuestions = JSON.parse(localStorage.getItem(KEY_QANDA));
    } else {
        // Load the questions.
        loadedQuestions = JSON.parse(localStorage.getItem(KEY_QANDA));
    }
}


// Borrowed a good portion of the timer from
// https://codepen.io/joshLongmire3/pen/prJrZV
function countDown(seconds, callback) {
    timer = setInterval(function() {
        document.getElementById("seconds").innerHTML = "Number: " + seconds;
        seconds-- || (clearInterval(timer), callback());
        counter = seconds +1;
    }, 1000);
}


function theCounter(totalSeconds) {
    // This will start the timer and run it to completion.
    countDown(totalSeconds, function () {
        $('seconds').html("Countdown done!");
    });
}


function theCounterStop(){
    // Interrupts the timer on demand.
    clearInterval(timer);
}


function createButton(nameId, buttonType) {
    // Creates a new button for use in the game.
    // Set the variables.
    var newButton = $('<button>');
    var choiceDivRow = $('<div>');

    // Create the divs.
    choiceDivRow.attr("class", "row");

    // Add the button attributes.
    newButton.attr("id", nameId);
    newButton.attr("type", "button");
    newButton.attr("name", nameId);
    newButton.attr("class", buttonType + " btn btn-primary btn-lg");

    // Add the contents to the button and return the row div object.
    newButton.html(nameId);
    choiceDivRow.append(newButton);
    return choiceDivRow;
}


function viewHighScores() {
    var scoreList = $('#score-list');
    highscore = loadHighScores();
    if ( highscore) {
        var scoreUl = $('<ol>');

        highscore.forEach(function (item) {
            var scoreLi = $('<li>');
            scoreLi.append(item.player + " - " + item.score);
            scoreUl.append(scoreLi);
        });
        scoreList.append(scoreUl);
    } else {
        scoreList.html("<p>No high scores yet, play a game!</p>");
    }
}

function playGame() {
    $('#main-text').html(loadedQuestions[currentQuestion].title);
    var answerList = $('#answer-list');
    answerList.html("");
    var actualAnswer = loadedQuestions[currentQuestion].answer;
    $(loadedQuestions[currentQuestion].choices).each(function (index, item) {
        // Create a button for each answer.
        answerList.append(createButton(item, "gameButton"));
    });

    var answerButton = $('.gameButton');

    answerButton.click(function(event){
        event.preventDefault();
        // make sure we're clicking on a button
        if (event.target.matches(".gameButton")) {
            // check the result
            if (event.target.id === actualAnswer) {
                // Correct answer, but more questions to follow.
                console.log("correct answer");
                if (currentQuestion + 1 < loadedQuestions.length ) {
                    currentQuestion += 1;
                    playGame();
                } else {
                    // Correct answer, but that was the last question.
                    var initials = prompt("Congratulations you achieved a score worth keeping!\n" +
                        "Enter your initials\n" +
                        "Score: " + counter);
                    storeHighScore(initials, counter);
                    // Stop the counter and redirect the user to the high score page (get their initials here first).
                    theCounterStop();
                    window.location.href = "highscore.html";
                }
            } else {
                // Incorrect answer. Stop the current timer and start a new one minus 10 seconds.
                // TODO find a better way to achieve this.
                theCounterStop();
                if ( counter - PENALTY_TIME > 0) {
                    theCounter(counter - PENALTY_TIME);
                } else {
                    // we have an end game condition.
                    counter = 0;
                    $('seconds').html("Countdown done!");
                    console.log("game over bebbeee!")
                    // TODO view high scores
                    // TODO Start again.
                }
            }
        }
    })
}

// Statements
loadData();

// So it doesn't wig out, only show these if on the highscore page.
if ( window.location.href.indexOf("highscore") > -1) {
    viewHighScores();
    // Redirect button for highscores page.
    $('#btn-back').click(function () {
        window.location.href = "index.html";
    });

    // Clear highscore button for highscores page
    $('#btn-clear-highscore').click(function () {
        console.log("clearing");
        localStorage.removeItem(KEY_HIGHSCORE);
        $('#score-list').html("<p>No high scores yet, play a game!</p>")
    });
}

// So it doesn't wig out, only show these if on the index page.
if ( window.location.href.indexOf("index") > -1) {
    $('#btn-start').click(function () {
        console.log("starting");
        theCounter(DEFAULT_TIME);
        loadHighScores();
        playGame();
    });
}
