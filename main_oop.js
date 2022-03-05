// Settings

class Settings {
    constructor() {
        this._categories = [];
        this.ui = new UIForSettings();
    }

    set categories(selected) {
        if (selected.request === "add") {
            this._categories.push(selected.category);
        } else if (selected.request === "remove") {
            this._categories = this._categories.filter(cat => cat !== selected.category);
        }
    }

    get categories() {
        return this._categories;
    }

    checkCategories() {
        if (this._categories.length) {
            return this._categories;
        } else {
            throw new Error("Please select one or more categories");
        }
    }

    async fetchQuestions() {
        try {
            const categories = this.checkCategories();
            const url = `https://api.trivia.willfry.co.uk/questions?categories=${categories}&limit=9`;
            const result = await fetch(url);
            const questions = await result.json();
            quiz.questions = questions;
        } catch (error) {
            // output error message
            console.log(error.message)
        }

    }
}


// Question Class: Represents a Question

class Question {
    constructor(question) {
        this.category = {
            title: question.category,
            color: question.category.toLowerCase().replace(/\s/g, "-")
        };
        this.type = question.type;
        this.question = question.question;
        this.correctAnswer = {
            title: question.correctAnswer,
            index: -1
        };
        this.wrongAnswers = question.incorrectAnswers;
        this.multipleChoice = this.makeMultipleChoice();
        this.userAnswer;
        this.result = "unanswered";
    }

    makeMultipleChoice() {
        const allWrongAnswers = [...this.wrongAnswers];
        const randomWrongAnswers = [];

        while (randomWrongAnswers.length < 3) {
            let random = Math.floor(Math.random() * allWrongAnswers.length);
            randomWrongAnswers.push(allWrongAnswers[random]);
            allWrongAnswers.splice(random, 1);
        }

        const choices = [this.correctAnswer.title, ...randomWrongAnswers].sort(() => 0.5 - Math.random());
        this.correctAnswer.index = choices.indexOf(this.correctAnswer.title);
        return choices;
    }

    validate(answer) {
        this.userAnswer = answer;
        this.result = answer === this.correctAnswer.title ? "correct" : "wrong";
        return this.result;
    }

}

class UIForQuiz {
    constructor(question, gamestate) {
        this.mainElement = document.querySelector("#main");
        this.quizElement = new QuizComponent({
            category: question.category,
            question: question.question,
            multipleChoice: question.multipleChoice,
            answered: gamestate.answered,
            points: gamestate.points,
            board: gamestate.board,
            handler: this.answerHandler
        });

        this.compileDOMTree(this.mainElement, this.quizElement.abstractDOMTree.root);
    }

    updateComponent(component, question, gamestate) {
        switch (component) {
            case "quizBox":
                this.quizElement = new QuizComponent(question, gamestate, this.answerHandler);
                this.compileDOMTree(this.mainElement, this.quizElement.abstractDOMTree.root)
                break;
            case "stats":
                this.stats = new StatsComponent(question, gamestate.points);
                this.compileDOMTree(document.querySelector("#stats-component"), this.stats.abstractDOMTree.root);
                break;
            case "answers":
                this.answers = new AnswersComponent(question, null);
                this.compileDOMTree(document.querySelector("#box-component"), this.answers.abstractDOMTree.root);
                //document.querySelector("#answers-component").children[question.correctAnswer.index].firstElementChild.classList.add("correct");
                break;
        }
    }

    updateStats(category, gamestate) {
        this.stats = new StatsComponent(category, gamestate);
        this.compileDOMTree(document.querySelector("#stats-component"), this.stats.abstractDOMTree.root);
    }

    updateAnswers(userAnswer, correctAnswer) {
        // this.answers = new AnswersComponent(question, null);
        // this.compileDOMTree(document.querySelector("#box-component"), this.answers.abstractDOMTree.root);
        document.querySelector("#answers-component")
    }

    compileDOMTree(rootNode, startingNode) {

        rootNode.append(startingNode.element);

        if (startingNode.children) {
            startingNode.children.forEach((child) => {
                this.compileDOMTree(rootNode.lastElementChild, child);
            })

        }

    }

    answerHandler(event) {

        const userAnswer = event.target.textContent;
        const { result, points, correctAnswer } = quiz.validate(userAnswer);

        this.updateStats(points);

        if (result === true) {
            event.target.classList.add("correct");
        } else {
            updateAnswers(userAnswer, correctAnswer);
        }

        // Or I could add a givenAnswer property to the question object, write a setter function that executes the validate function inside the question object
        // Or I could write a setter function for the quiz that takes the given answer as an argument and advances the gamestate.

        // settings._quiz = event.target.textContent;
    }

    timeProgress() {
        this.progressBar.startTime = Date.now();
        this.progressBar.timeInterval = setInterval(() => {
            // const time = Date.now();
            this.progressBar.width += 0.835;
            this.progressBar.elem.style.width = this.progressBar.width + "px";
        }, 10);

        setTimeout(() => {
            this.progressBar.elapsedTime = Date.now() - this.progressBar.startTime;
            clearInterval(this.progressBar.timeInterval);
            console.log()
        }, 10000)
    }

}

// Quiz

class Quiz {
    constructor(questions) {
        // this._questions = questions.map((question) => new Question(question));
        this._questions = [];
        this._gamestate = {
            answered: 0,
            points: 0,
            board: []
        };
        this.ui = {};
    }

    init(questions) {
        this._questions = questions.map((question) => new Question(question));
        this._questions.forEach((question, index) => {
            this._gamestate.board[index] = question.result;
        });
        this.ui = new UIForQuiz(this._questions[0], this._gamestate);
    }

    set gamestate({ answered, points, board }) {
        this._gamestate.answered = answered;
        this._gamestate.points = points;
        // set board
    }

    get gamestate() {
        return this._gamestate;
    }

    // set questions(questions) {
    //     this._questions = questions.map((question) => new Question(question));
    //     this.ui = new UIForQuiz(this._questions[0], this._gamestate);
    // }

    get questions() {
        return this._questions;
    }

    validate(answer) {
        //this._questions[this._gamestate.answered].userAnswer = answer;
        let currentQuestion = this._questions[this._gamestate.answered];

        if (currentQuestion.validate(answer) === true) {
            this._gamestate.points += 10;
        }

        // this.ui.updateComponent("stats", currentQuestion, this._gamestate);
        // this.ui.updateComponent("answers", currentQuestion);

        this._gamestate.answered++;

        return {
            result: currentQuestion.result,
            points: this._gamestate.points,
            correctAnswer: currentQuestion.correctAnswer.index
        }

        //setTimeout(DisplayNextButton, 3000);
    }
}


// UI Class: Handles UI Tasks

class UIForSettings {
    constructor() {
        this.selectionPage = document.querySelector("#selection-menu");
        this.selectionElement = document.querySelector("#category-selection");
        this.startButton = document.querySelector("#start-button");

        this.selectionElement.addEventListener("click", (event) => {
            if (event.target !== this.selectionElement && !event.target.classList.contains("col-sm-12")) {
                const elements = event.composedPath();
                const targetElement = elements.find(element => element.classList.contains("category"));
                const category = targetElement.firstElementChild.lastElementChild.innerText;
                switch (category) {
                    case "Science":
                        this.toggleSelection(targetElement, "science");
                        break;
                    case "History":
                        this.toggleSelection(targetElement, "history");
                        break;
                    case "Geography":
                        this.toggleSelection(targetElement, "geography");
                        break;
                    case "Film & TV":
                        this.toggleSelection(targetElement, "movies");
                        break;
                    case "Art & Literature":
                        this.toggleSelection(targetElement, "literature");
                        break;
                    case "Music":
                        this.toggleSelection(targetElement, "music");
                        break;
                    case "Sport & Leisure":
                        this.toggleSelection(targetElement, "sport_and_leisure");
                        break;
                    case "General Knowledge":
                        this.toggleSelection(targetElement, "general_knowledge");
                        break;
                    case "Society & Culture":
                        this.toggleSelection(targetElement, "society_and_culture");
                        break;
                }
            }

        });

        this.startButton.addEventListener("click", () => {
            //settings.fetchQuestions();
            quiz.init(testQuestions);
            this.selectionPage.style.display = "none";
        });


    }

    toggleSelection(element, category) {
        if (element.classList.contains("category-highlight")) {
            element.classList.add("selected");
            element.classList.remove("category-highlight");
            settings.categories = {
                category: category,
                request: "add"
            };
        } else if (element.classList.contains("selected")) {
            element.classList.remove("selected");
            element.classList.add("category-highlight");
            settings.categories = {
                category: category,
                request: "remove"
            }
        }
    }

}


function buildNode(tag, properties) {
    const element = document.createElement(tag);
    if (properties) {
        Object.keys(properties).forEach((propertyName) => {
            element[propertyName] = properties[propertyName];
        });
    }

    return element;
}



class QuizComponent {
    constructor({ category, question, multipleChoice, answered, points, board, handler }) {
        this.abstractDOMTree = {
            root: {
                element: buildNode("div", { id: "quiz-element", className: "container-xl" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { id: "stats-component", className: "col-md-2 d-none d-md-flex bg-light rounded-lg me-2 mt-5 flex-column" }),
                                children: [
                                    new StatsHeader({ category, answered }),
                                    new Timer({ category }),
                                    new Score({ points: points, board: board })
                                ]
                            },
                            {
                                element: buildNode("div", { id: "quizbox-component", className: "col-11 col-md-9 col-xxl-7 mt-5" }),
                                children: [
                                    new QuestionComponent({category, question}),
                                    new Answers({category, multipleChoice, handler})
                                ]
                            }
                        ]
                    }
                ]
            }
        }
    }
}

class StatsHeader {
    constructor({ category, answered }) {
        this.element = buildNode("div", { className: "row mb-1 p-3" });
        this.children = [
            {
                element: buildNode("div", { className: `col rounded-lg p-2 bg-${category.color}` }),
                children: [
                    {
                        element: buildNode("p", { className: "px-0 my-2 text-center" }),
                        children: [
                            {
                                element: document.createTextNode(`QUESTION ${answered + 1} of 9`),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

class Timer {
    constructor({ category }) {
        this.element = buildNode("div", { id: "timer-component", className: "row py-3" });
        this.children = [
            {
                element: buildNode("div", { className: "col text-center d-flex flex-column align-items-center" }),
                children: [
                    {
                        element: buildNode("h5", { className: "mb-3" }),
                        children: [
                            {
                                element: document.createTextNode("Timer"),
                                children: null
                            }
                        ]
                    },
                    {
                        element: buildNode("div", { id: "timer-container" }),
                        children: [
                            {
                                element: buildNode("div", { className: "radial-timer" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: `first-half bg-${category.color}` }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("div", { className: "half-mask" }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("div", { className: `second-half bg-${category.color}` }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("div", { className: "seconds d-flex align-items-center justify-content-center lead" }),
                                        children: [
                                            {
                                                element: buildNode("h4", { id: "seconds" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode("12"),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

class Score {
    constructor({ points, board }) {

        const boardFields = board.map(field => {
           return new BoardField({ field: field });
        });

        this.element = buildNode("div", { id: "score-component", className: "row mb-1 py-3 px-xxl-5 px-lg-4 px-md-1 text-center" });
        this.children = [
            {
                element: buildNode("div", { className: "col-12" }),
                children: [
                    {
                        element: buildNode("h5"),
                        children: [
                            {
                                element: document.createTextNode("Score"),
                                children: null
                            }
                        ]
                    }
                ]
            },
            {
                element: buildNode("div", { className: "col-12" }),
                children: [
                    {
                        element: buildNode("h3", { className: "py-3" }),
                        children: [
                            {
                                element: document.createTextNode(points),
                                children: null
                            }
                        ]
                    }
                ]
            },
            ...boardFields
        ]
    }
}

class BoardField {
    constructor({ field }) {
        this.element = buildNode("div", { className: "col-4 px-0" });
        this.children = [
            {
                element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(field)}-fill board-${field}` }),
                children: null
            }
        ]
    }
}

class QuestionComponent {
    constructor({ category, question }) {
        this.element = buildNode("div", { id: "question-component", className: "row" });
        this.children = [
            {
                element: buildNode("div", { className: "col bg-light rounded-lg" }),
                children: [
                    new QuestionHeader({category}),
                    new QuestionText({question})
                ]
            }
        ]
    }
}

class QuestionHeader {
    constructor({ category }) {
        this.element = buildNode("div", { id: "question-header-component", className: "row mb-1 p-3" });
        this.children = [
            {
                element: buildNode("div", { className: `col-12 rounded-lg p-2 bg-${category.color}` }),
                children: [
                    {
                        element: buildNode("div", { className: "row px-2" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-6 text-start" }),
                                children: [
                                    {
                                        element: buildNode("p", { className: "my-2" }),
                                        children: [
                                            {
                                                element: document.createTextNode(category.title),
                                                children: null
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-2 text-end" }),
                                children: [
                                    {
                                        element: buildNode("i", { className: "bi bi-hourglass-top fs-4 p-1 cursor joker-highlight" }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-2 text-end" }),
                                children: [
                                    {
                                        element: buildNode("i", { className: "bi bi-arrow-left-right fs-4 p-1 cursor joker-highlight" }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-2 d-flex align-items-center justify-content-end" }),
                                children: [
                                    {
                                        element: buildNode("strong", { className: "border border-dark p-1 cursor joker-highlight" }),
                                        children: [
                                            {
                                                element: document.createTextNode("50:50"),
                                                children: null
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

class QuestionText {
    constructor({ question }) {
        this.element = buildNode("div", { id: "question-question-component", className: "row" });
        this.children = [
            {
                element: buildNode("div", { className: "col text-center p-4 p-md-5" }),
                children: [
                    {
                        element: buildNode("p", { className: "lead" }),
                        children: [
                            {
                                element: document.createTextNode(question),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

class Answers {
    constructor({ category, multipleChoice, handler }) {

        const answers = multipleChoice.map((answer) => {
            return new Answer({answer, category, handler});
        })

        this.element = buildNode("div", { id: "answers-component", className: "row" });
        this.children = [
            {
                element: buildNode("div", { className: "col bg-light rounded-lg mt-2" }),
                children: [
                    {
                        element: buildNode("div", { className: "row text-center lead px-md-2 py-3 gy-3" }),
                        children: [
                            ...answers
                        ]
                    }
                ]
            }
        ]
    }
}

class Answer {
    constructor({ answer, category, handler }) {
        this.element = buildNode("div", { className: "col-md-6 px-3 px-md-2" });
        this.children = [
            {
                element: buildNode("p", { className: `rounded-lg py-2 py-md-5 my-0 bg-custom border answer-highlight-${category.color}`, onclick: handler }),
                children: [
                    {
                        element: document.createTextNode(answer),
                        children: null
                    }
                ]
            }
        ]
    }
}

// Local Storage Class: Handles Local Storage

// Events?


// const ui = new UIForSettings;
const settings = new Settings();
const quiz = new Quiz();
//const quizBox = new QuizBoxComponent()


// function depthFirstTraversalTest(rootNode, indexOfStartingNode, startingNode) {

//     rootNode.append(startingNode.element);

//     if (startingNode.children) {
//         startingNode.children.forEach((child, i) => {
//             let nodeArray = Array.from(rootNode.children);
//             let newRootNode = nodeArray[indexOfStartingNode];
//             depthFirstTraversalTest(newRootNode, i, child);
//         })

//     }

// }



function depthFirstTraversalTest(rootNode, startingNode) {

    rootNode.append(startingNode.element);

    if (startingNode.children) {
        startingNode.children.forEach((child) => {
            depthFirstTraversalTest(rootNode.lastElementChild, child);
        })

    }

}

//depthFirstTraversalTest(document.querySelector("#main"), quizComponent.root);

// Render test

depthFirstTraversalTest(document.querySelector("#main"), new QuizComponent({
    category: {
        title: "Geography",
        color: "geography"
    },
    question: "Togo is located on which continent?",
    multipleChoice: ["South America", "Europe", "Asia", "Africa"],
    answered: 0,
    points: 0,
    board: ["unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered"],
    handler: function(event) {

        const userAnswer = event.target.textContent;

        if (userAnswer === "Africa") {
            event.target.classList.add("correct");
            event.target.classList.remove("answer-highlight-geography");
        } else {
            // updateAnswers(userAnswer, correctAnswer);
            // For now let's just do
            event.target.classList.add("incorrect");
        }

    }
}).abstractDOMTree.root);


function resultIcon(value) {
    switch(value) {
        case "unanswered":
            return "circle";
        case "correct":
            return "check-circle";
        case "wrong":
            return "x-circle";
    }
}



const testQuestions = [{ "category": "Geography", "correctAnswer": "Africa", "id": 6696, "incorrectAnswers": ["South America", "Oceania", "Europe", "Asia", "North America"], "question": "Togo is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Sudan", "id": 6549, "incorrectAnswers": ["South Sudan", "Egypt", "Republic of the Congo", "Equatorial Guinea", "Gabon", "Benin", "Democratic Republic of the Congo", "Eritrea", "Uganda", "Togo", "São Tomé and Príncipe", "Rwanda", "Tunisia", "Malta"], "question": "Which of these countries borders Chad?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Asia", "id": 22872, "incorrectAnswers": ["Europe", "Africa", "North America", "South America"], "question": "Which is the Earth's largest continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "South America", "id": 6683, "incorrectAnswers": ["Oceania", "Europe", "Asia", "Africa", "North America"], "question": "Suriname is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Spain", "id": 5713, "incorrectAnswers": ["Portugal", "Andorra", "Mali", "Tunisia", "France", "Monaco", "Senegal", "Burkina Faso", "Switzerland", "The Gambia", "Malta", "Ireland", "Italy", "Belgium", "Luxembourg", "Liechtenstein", "Niger"], "question": "Morocco shares a land border with which of these countries?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Tripoli", "id": 19272, "incorrectAnswers": ["Benghazi", "Tunis", "Alexandria"], "question": "What is the capital of Libya?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Europe", "id": 6685, "incorrectAnswers": ["South America", "Oceania", "Asia", "Africa", "North America"], "question": "Andorra is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "East Timor", "id": 5609, "incorrectAnswers": ["Solomon Islands", "Vanuatu", "Palau", "Brunei", "Nauru", "Federated States of Micronesia", "Fiji", "Philippines", "Malaysia", "Singapore", "Tuvalu", "Kiribati", "Marshall Islands", "Cambodia", "Vietnam", "Thailand"], "question": "Which of these countries borders Australia?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Austria", "id": 19550, "incorrectAnswers": ["Croatia", "San Marino", "Bosnia and Herzegovina", "Romania", "Poland"], "question": "Which country borders Italy, Switzerland, Germany, Czech Republic, Hungary, Slovenia, and Liechtenstein?", "type": "Multiple Choice" }];


//quiz.questions = testQuestions;

const secondHalf = document.querySelector(".second-half");
const firstHalf = document.querySelector(".first-half");
const seconds = document.querySelector("#seconds");

let start;
let timeInterval;


function rotate() {
    start = Date.now();
    let degree = 0;
    //secondHalf.style.transform = `rotate(${degree}deg)`
    let object = secondHalf;
    timeInterval = setInterval(function () {
        time = Date.now() - start;

        let elapsed = Math.floor(time / 1000);

        seconds.innerHTML--;

        object.style.transform = `rotate(${degree += 30}deg)`;

        if (elapsed === 6) {
            //clearInterval(timeInterval)
            secondHalf.style.display = "none";
            object = firstHalf;
            degree = 0;
        }

        if (elapsed === 12) {
            clearInterval(timeInterval);
        }

    }, 1000);


}

//rotate();