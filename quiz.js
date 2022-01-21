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

const quiz = new Quiz();

export { Quiz, quiz };