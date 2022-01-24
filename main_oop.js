// new Settings;


// Quiz Class: Represents a Quiz

class Quiz {
    constructor(gamestate) {
        this._gamestate = gamestate;
        this._categories = [];
        this._questions = [];
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

    set questions(data) {
        for (let question of data) {
            this._questions.push(question);
        }
    }

    get questions() {
        return this._questions;
    }

    async fetchQuestions() {
        const url = `https://api.trivia.willfry.co.uk/questions?categories=${this._categories}&limit=9`;
        const result = await fetch(url);
        const questions = await result.json();
        for (let question of questions) {
            this._questions.push(question);
        }
    }
}


// Question Class: Represents a Question

// Settings Class: Represents Settings

// class Settings {
//     constructor() {

//     }
// }

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
            this.buildNode("div", {
                id: "my-div"
            })
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

    render() {

    }

    buildNode(tag, attributes) {
        const element = document.createElement(tag);
        Object.keys(attributes).forEach((attribute) => {
            element.setAttribute(attribute, attributes[attribute]);
        })
    }

}

class TriviabilityNode {
    constructor(tag, attributes) {
        
    }
}


// Local Storage Class: Handles Local Storage

// Events?


const ui = new UI;
const quiz = new Quiz();