new Settings;
new UI;
const quiz = new Quiz();

// Quiz Class: Represents a Quiz

class Quiz {
    constructor(gamestate) {
        this._gamestate = gamestate;
        this._categories = [];
        this._questions = [];
    }

    set categories(chosen) {
        for (let cat of chosen) {
            this.categories.push(cat);
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

class Settings {
    constructor() {

    }
}

// UI Class: Handles UI Tasks

class UI {
    constructor() {
        this.SelectionElement = document.querySelector("#category-selection");
        this.startButton = document.querySelector("#start-button");
        this.catSelectElement.addEventListener("click", (event) => {
            const category = event.target.firstElementChild.lastElementChild.innerText;
            switch (category) {
                case "Science":
                    quiz.categories = "science";
                case "History":
                    quiz.categories = "history";
                case "Geography":
                    quiz.categories = "geography";
                case "Movies":
                    quiz.categories = "movies";
                case "Art & Literature":
                    quiz.categories = "literature";
                case "Music":
                    quiz.categories = "music";
                case "Sport & Leisure":
                    quiz.categories = "sport_and_leisure";
                case "General Knowledge":
                    quiz.categories = "general_knowledge";
                case "Society & Culture":
                    quiz.categories = "society_and_culture";
            }
        });
        this.startButton.addEventListener("click", () => {
            quiz.fetchQuestions();
        })
    }

}


// Local Storage Class: Handles Local Storage

// Events?