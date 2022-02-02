// Settings

class Settings {
    constructor() {
        this._categories = [];
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
        }
        this.wrongAnswers = question.incorrectAnswers;
        this.multipleChoice = this.makeMultipleChoice();
        this.userAnswer;
        this.result;
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
        this.result = answer === this.correctAnswer.title ? true : false;
        return this.result;
    }

}

class UIForQuiz {
    constructor(question, gamestate) {
        this.mainElement = document.querySelector("#main")
        this.quizBox = new QuizBoxComponent(question, gamestate, this.answerHandler);
        this.stats;
        this.answers;

        this.progressBar = {
            elem: document.querySelector("#bar"),
            width: 0,
        }

        this.compileDOMTree(this.mainElement, this.quizBox.abstractDOMTree.root);
    }

    updateComponent(component, question, gamestate) {
        switch (component) {
            case "quizBox":
                this.quizBox = new QuizBoxComponent(question, gamestate, this.answerHandler);
                this.compileDOMTree(this.mainElement, this.quizBox.abstractDOMTree.root)
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
            points: 0
        }
        //this.ui = new UIForQuiz(this._questions[0].category, this._questions[0].question, this.gamestate);
        this.ui = {};

    }

    set gamestate({ answered, points }) {
        this._gamestate.answered = answered;
        this._gamestate.points = points;
    }

    get gamestate() {
        return this._gamestate;
    }

    set questions(questions) {
        this._questions = questions.map((question) => new Question(question));
        this.ui = new UIForQuiz(this._questions[0], this._gamestate, this.ui.answerHandler);
    }

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
        this.windowElement = window;
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
            settings.fetchQuestions();
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


class QuizBoxComponent {
    constructor({ category, question, multipleChoice }, { answered, points }, handler) {
        this.abstractDOMTree = {
            root: {
                element: buildNode("div", { id: "quiz-element", className: "container" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg", id: "box-component" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "row mb-1 p-3", id: "stats-component" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "col" }),
                                                children: [
                                                    {
                                                        element: buildNode("div", { className: `row align-items-center rounded-lg p-2 bg-${category.color}` }),
                                                        children: [
                                                            {
                                                                element: buildNode("div", { className: "col-3" }),
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
                                                                element: buildNode("div", { className: "col-3" }),
                                                                children: [
                                                                    {
                                                                        element: buildNode("p", { className: "my-2" }),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(`${answered + 1}/9`),
                                                                                children: null
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                element: buildNode("div", { className: "col-3" }),
                                                                children: [
                                                                    {
                                                                        element: buildNode("p", { className: "my-2" }),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(`${points} pts`),
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
                                    },
                                    {
                                        element: buildNode("div", { className: "row", id: "question-component" }),
                                        children: [
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
                                    },
                                    {
                                        element: buildNode("div", { className: "row text-center lead px-md-2", id: "answers-component" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(multipleChoice[0]),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(multipleChoice[1]),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(multipleChoice[2]),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(multipleChoice[3]),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "row justify-content-center", id: "progress-component" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "mt-md-5 mt-4 col-6 px-0 rounded-lg bg-light" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "rounded-lg", id: "bar" }),
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
        }
    }
}

class StatsComponent {
    constructor(category, { answered, points }) {
        this.abstractDOMTree = {
            root: {
                element: buildNode("div", { className: "col" }),
                children: [
                    {
                        element: buildNode("div", { className: `row align-items-center rounded-lg p-2 bg-${category.color}` }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-3" }),
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
                                element: buildNode("div", { className: "col-3" }),
                                children: [
                                    {
                                        element: buildNode("p", { className: "my-2" }),
                                        children: [
                                            {
                                                element: document.createTextNode(`${answered + 1}/9`),
                                                children: null
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-3" }),
                                children: [
                                    {
                                        element: buildNode("p", { className: "my-2" }),
                                        children: [
                                            {
                                                element: document.createTextNode(`${points} pts`),
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
        }
    }
}

class AnswersComponent {
    constructor({ category, multipleChoice, correctAnswer, userAnswer }, handler) {
        this.abstractDOMTree = {
            root: {
                element: buildNode("div", { className: "row text-center lead px-md-2", id: "answers-component" }),
                children: [
                    {
                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                        children: [
                            {
                                element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                children: [
                                    {
                                        element: document.createTextNode(multipleChoice[0]),
                                        children: null
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                        children: [
                            {
                                element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                children: [
                                    {
                                        element: document.createTextNode(multipleChoice[1]),
                                        children: null
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                        children: [
                            {
                                element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                children: [
                                    {
                                        element: document.createTextNode(multipleChoice[2]),
                                        children: null
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                        children: [
                            {
                                element: buildNode("p", { className: `rounded-lg py-2 py-md-5 bg-custom answer-highlight-${category.color}`, onclick: handler }),
                                children: [
                                    {
                                        element: document.createTextNode(multipleChoice[3]),
                                        children: null
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        }
        this.abstractDOMTree.root.children[correctAnswer.index].children[0].element.classList.add("correct");
    }
}




let component = {
    root: {
        element: buildNode("div", { className: "container", id: "quiz-element" }),
        children: [
            {
                element: buildNode("div", { className: "row justify-content-center" }),
                children: [
                    {
                        element: buildNode("div", { className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg" }),
                        children: null
                    },
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "mt-md-5 mt-4 col-6 px-0 rounded-lg bg-light" }),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ]
    }

}


// Local Storage Class: Handles Local Storage

// Events?


const ui = new UIForSettings;
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

//depthFirstTraversalTest(ui.mainElement, quizComponent.root);



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