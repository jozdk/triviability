// Settings

class Settings {
    constructor() {
        this._categories = [];
        this._quiz = {};
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
            this._quiz = new Quiz(questions);        
        } catch(error) {
            // output error message
        }

    }
}


// Question Class: Represents a Question

class Question {
    constructor(question) {
        this.category = question.category
        this.type = question.type
        this.question = question.question
        this.correctAnswer = question.correctAnswer
        this.wrongAnswers = question.incorrectAnswers
        this.result
        this.makeMultipleChoice();
    }

    makeMultipleChoice() {
        const allWrongAnswers = this.wrongAnswers;
        const randomWrongAnswers = [];

        while (randomWrongAnswers.length < 3) {
            let random = Math.floor(Math.random() * allWrongAnswers.length);
            randomWrongAnswers.push(allWrongAnswers[random]);
            allWrongAnswers.splice(random, 1);
        }

        const choices = [this.correctAnswer, ...randomWrongAnswers]
        this.multipleChoice = choices.sort(() => 0.5 - Math.random());
    }

    validate(answer) {
        if (answer === this.correctAnswer) {
            this.result = true;
        } else {
            this.result = false;
        }
    }

}


// Quiz

class Quiz {
    constructor(questions) {
        this._questions = questions.map((question) => new Question(question));
        this._gamestate = {
            answered: 0,
            points: 0
        }

    }

    set gamestate({ answered, points }) {
        this._gamestate.answered = answered;
        this._gamestate.points = points;
    }

    get gamestate() {
        return this._gamestate;
    }

    get questions() {
        return this._questions;
    }
}


// UI Class: Handles UI Tasks

class UI {
    constructor() {
        this.progressBar = {
            width: 0,
            elem: document.querySelector("#bar"),
            called: 0
        }

        this.windowElement = window;
        this.selectionElement = document.querySelector("#category-selection");
        this.startButton = document.querySelector("#start-button");
        this.mainElement = document.querySelector("#main");
        this.quizElement = document.querySelector("#quiz-element");

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
                    case "Movies":
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
            quiz.fetchQuestions();
            this.mainElement.style.display = "none";
            
        });

        // this.windowElement.addEventListener("load", () => {
        //     this.progressBar.startTime = Date.now();
        //     this.progressBar.tInterval = setInterval(() => {
        //         this.progressBar.width += 0.835;
        //         this.progressBar.elem.style.width = this.progressBar.width + "px";
        //         this.progressBar.called++;
        //         if (this.progressBar.called === 600) {
        //             clearInterval(this.progressBar.tInterval);
        //             console.log(this.progressBar.called, Date.now() - this.progressBar.startTime)
        //         }
        //     }, 10);
        //     // setTimeout(() => {
        //     //     this.timerValues.elapsedTime = Date.now() - this.timerValues.startTime;
        //     //     clearInterval(this.timerValues.tInterval);
        //     //     console.log(this.timerValues.called, this.timerValues.elapsedTime)
        //     // }, 10000)
        // })

    }

    toggleSelection(element, category) {
        if (element.classList.contains("highlight")) {
            element.classList.add("selected");
            element.classList.remove("highlight");
            quiz.categories = {
                category: category,
                request: "add"
            };
        } else if (element.classList.contains("selected")) {
            element.classList.remove("selected");
            element.classList.add("highlight");
            quiz.categories = {
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


const quizComponent = {
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
                                                element: buildNode("div", { className: "row rounded-lg p-2 bg-sport_and_leisure" }),
                                                children: [
                                                    {
                                                        element: buildNode("div", { className: "col-3" }),
                                                        children: [
                                                            {
                                                                element: buildNode("p"),
                                                                children: [
                                                                    {
                                                                        element: document.createTextNode("Science"),
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
                                                                element: buildNode("p"),
                                                                children: [
                                                                    {
                                                                        element: document.createTextNode("3/10"),
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
                                                                element: buildNode("p"),
                                                                children: [
                                                                    {
                                                                        element: document.createTextNode("20 pts"),
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
                                                        element: document.createTextNode("What does it take to make this quiz look good?"),
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
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode("Bootstrap"),
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
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode("No Bootstrap"),
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
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode("Bootstrap + Custom CSS"),
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
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode("Magic"),
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


const ui = new UI;
const settings = new Settings();


function depthFirstTraversalTest(rootNode, indexOfStartingNode, startingNode) {
    
    rootNode.append(startingNode.element);

    if (startingNode.children) {
        startingNode.children.forEach((child, i) => {
            let nodeArray = Array.from(rootNode.children);
            let newRootNode = nodeArray[indexOfStartingNode];
            depthFirstTraversalTest(newRootNode, i, child);
        })

    }

}


depthFirstTraversalTest(ui.mainElement, 2, quizComponent.root);


class UIForQuiz {
    constructor(category, questions, { answered, points }) {
        this.mainElement = document.querySelector("#main")
        this.quizBox = new QuizBoxComponent(category, questions, answered, points)
        this.compileDOMTree(this.quizBox.abstractDOMTree);
        this.progressBar = {
            elem: document.querySelector("#bar"),
            width: 0,
            called: 0
        }
    }

    updateComponent(component, category, questions, answered, points) {
        switch (component) {
            case "quizBox":
                this.quizBox = new QuizBoxComponent(category, questions, answered, points);
                break;
            case "stats":
                
        }
    }

    compileDOMTree(startingNode, rootNode = this.mainElement, indexOfStartingNode = 2) {
    
        rootNode.append(startingNode.element);
    
        if (startingNode.children) {
            startingNode.children.forEach((child, i) => {
                let nodeArray = Array.from(rootNode.children);
                let newRootNode = nodeArray[indexOfStartingNode];
                this.compileDOMTree(child, newRootNode, i);
            })
        }
    
    }

}