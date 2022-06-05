import { SettingsScreen } from "./components/screens/SettingsScreen.js";
import { QuizScreen, Time, TimeSmallScreen } from "./components/screens/QuizScreen.js";
import { StatsScreen } from "./components/screens/StatsScreen.js";
import { Spinner } from "./components/sharedUIComponents.js";
import { toUnderscore, capitalize, shuffleArray } from "./helpers.js";
import { UI } from "./ui.js";

export class Settings {
    constructor() {
        this._categories = [];
        this._amount = 12;
        this.originalQuestions = [];
        this.ui = new UIForSettings(this._categories, this.amount);
    }

    static allCategories = ["Science", "History", "Geography", "Film & TV", "Arts & Literature", "Music", "Sport & Leisure", "General Knowledge", "Society & Culture"];

    get categories() {
        return this._categories;
    }

    get amount() {
        return this._amount;
    }

    set amount(number) {
        this._amount = number;
    }

    toggleSelection = (category) => {
        category = toUnderscore(category);
        if (this._categories.includes(category)) this._categories.splice(this._categories.indexOf(category), 1);
        else this._categories.push(category);
        this.ui.selectionMenuElement = new SettingsScreen({ selected: this._categories, amount: this._amount });
    }

    selectAll() {
        if (this._categories.length !== Settings.allCategories.length) this._categories = Settings.allCategories.map((cat) => toUnderscore(cat));
        else this._categories = [];
        this.ui.selectionMenuElement = new SettingsScreen({ selected: this._categories, amount: this._amount });
    }

    selectRandom() {
        this.calcRandom();
        this.ui.selectionMenuElement = new SettingsScreen({ selected: this._categories, amount: this._amount });
    }

    calcRandom() {
        this._categories = [];
        const pool = Settings.allCategories.map(cat => toUnderscore(cat));
        const amount = Math.floor(Math.random() * (Settings.allCategories.length - 1) + 1);
        while (this._categories.length < amount) {
            this._categories.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
    }

    reset() {
        this.originalQuestions = [];
        this._categories = [];
        this.amount = 12;
    }

    findDuplicates() {
        const count = {};
        const duplicates = [];
        const questions = this.originalQuestions.map((question) => question.question);
        questions.forEach((qn) => {
            if (count[qn]) {
                count[qn] += 1;
                return;
            }
            count[qn] = 1;
        });
        for (let qn in count) {
            if (count[qn] >= 2) {
                duplicates.push(qn);
            }
        }
        return duplicates;
    }

    url(categories, amount) {
        return `https://the-trivia-api.com/questions?categories=${categories}&limit=${amount}`
    }

    getAmountPerCategory() {
        if (this._categories.length === 0) {
            throw new Error("No categories selected");
        }
        const amountPerCat = {};
        let loops = 0;
        if (this._categories.length === 1) return { [this._categories[0]]: this._amount };
        else {
            while (Object.keys(amountPerCat).reduce((total, cat) => total + amountPerCat[cat], 0) !== this._amount && loops < 1000) {
                if (this._categories.length <= this._amount) {
                    // Max number of questions for each category is its equal share + 1 (+1 can be removed for a more balanced distribution); min number is 1
                    this._categories.forEach((cat) => amountPerCat[cat] = Math.floor(Math.random() * (this._amount / this._categories.length + 1)) + 1);
                } else {
                    this._categories.forEach((cat) => amountPerCat[cat] = Math.round(Math.random()));
                }
                loops++;
            }
            // console.log(`${this._amount} questions / ${this._categories.length} categories. It took ${loops} loops`, amountPerCat);
            return amountPerCat;
        }
    }

    async fetchQuestions() {
        try {
            const amountPerCat = this.getAmountPerCategory();
            const categories = Object.keys(amountPerCat);
            const shortestCat = categories.find((cat) => amountPerCat[cat] === Math.min(...Object.values(amountPerCat)));
            amountPerCat[shortestCat] += 1;
            const urls = categories.filter((cat) => amountPerCat[cat] !== 0).map((cat) => {
                return this.url(cat, amountPerCat[cat]);
            })
            this.originalQuestions = [];
            this.ui.spinnerElement = new Spinner();

            for (let url of urls) {
                const result = await fetch(url);
                this.originalQuestions.push(...await result.json());
                // console.log("Fetch request has been made");
            }

            const duplicates = this.findDuplicates();
            if (duplicates.length) {
                // console.log(`Found ${duplicates.length} duplicate(s)`);

                for (let dup of duplicates) {
                    const index = this.originalQuestions.findIndex((question) => question.question === dup);
                    const category = toUnderscore(this.originalQuestions[index].category);
                    const result = await fetch(this.url(category, 1));
                    const newQuestion = await result.json();
                    this.originalQuestions.splice(index, 1, newQuestion[0]);
                    // console.log(`Exchanged duplicate at index ${index} with a new question from category ${category}`);
                }

            }
            shuffleArray(this.originalQuestions);
            quiz.init(this.originalQuestions);
        } catch (error) {
            console.log(error.message);
        }

    }

}

class UIForSettings extends UI {
    constructor(selected, amount) {
        super();
        this.mainElement = document.querySelector("#main");
        this._selectionMenuElement = new SettingsScreen({ selected, amount });
        this._spinnerElement;

        this.render(this.mainElement, this._selectionMenuElement);
    }

    set selectionMenuElement(menuComp) {
        this._selectionMenuElement = menuComp;
        this.mainElement.innerHTML = "";
        this.render(this.mainElement, this._selectionMenuElement);
    }

    set spinnerElement(spinnerComp) {
        this._spinnerElement = spinnerComp;
        this.mainElement.innerHTML = "";
        this.render(this.mainElement, this._spinnerElement);
    }
}

class Stats {
    init(questions, gamestate, discarded) {
        this.calculate(questions, gamestate);
        this.ui = new StatsScreen({ stats: this.stats, questions, discarded, colors: this.colors });
        this.ui.render();
    }

    calculate(questions, gamestate) {
        const amountTotal = questions.length;
        const amountCorrect = questions.filter(question => question.result === "correct").length;
        const percentCorrect = (amountCorrect / amountTotal * 100) % 1 === 0 ? (amountCorrect / amountTotal * 100) : (amountCorrect / amountTotal * 100).toFixed(2);
        const percentScore = gamestate.points / (questions.length * 20) * 100;
        let emoji;
        if (percentScore >= 85) emoji = "bi bi-emoji-sunglasses";
        else if (percentScore >= 70) emoji = "bi bi-emoji-laughing";
        else if (percentScore >= 55) emoji = "bi bi-emoji-smile";
        else if (percentScore >= 40) emoji = "bi bi-emoji-neutral";
        else if (percentScore >= 25) emoji = "bi bi-emoji-smile-upside-down";
        else if (percentScore >= 0) emoji = "bi bi-emoji-dizzy";
        const colors = shuffleArray(questions.map(question => question.category.color).filter((cat, i, arr) => arr.indexOf(cat) === i));
        const timesCorrect = questions.filter(qn => qn.result === "correct").map(question => question.time);
        const times = questions.map(question => question.time);
        const timeTotal = times.reduce((acc, curr) => acc + curr) / 1000;
        const timeAverage = (timeTotal / questions.length).toFixed(3);
        const fastestCorrect = timesCorrect.length ? Math.min(...timesCorrect) / 1000 : "-";
        // const slowest = Math.max(...times) / 1000;
        const categoryCount = {};
        questions.forEach((q) => categoryCount[q.category.title] = categoryCount[q.category.title] ? categoryCount[q.category.title] + 1 : 1);
        const categories = [];
        Object.keys(categoryCount).forEach(cat => {
            const amountCat = categoryCount[cat];
            const share = Math.round(amountCat / amountTotal * 100);
            const correctCat = questions.filter(qn => qn.category.title === cat && qn.result === "correct").length;
            const timeTotalCat = questions.filter(qn => qn.category.title === cat).map(qn => qn.time).reduce((acc, curr) => acc + curr) / 1000;
            const averagePoints = questions.filter(qn => qn.category.title === cat).map(qn => qn.points).reduce((acc, curr) => acc + curr) / amountCat;
            categories.push({
                category: cat,
                amount: amountCat,
                percent: share % 1 === 0 ? share : share.toFixed(2),
                correct: correctCat,
                correctPercent: (correctCat / amountCat * 100) % 1 === 0 ? (correctCat / amountCat * 100) : (correctCat / amountCat * 100).toFixed(2),
                averageTime: (timeTotalCat / amountCat).toFixed(3),
                points: averagePoints % 1 === 0 ? averagePoints : averagePoints.toFixed(2)
            });
        });
        const catUnused = settings.categories
            .map(cat => capitalize(cat))
            .filter(category => !categories.find(cat => cat.category === category));

        this.stats = {
            general: { amountTotal, amountCorrect, percentCorrect, points: gamestate.points, emoji, categories },
            time: { timeTotal, timeAverage, fastestCorrect },
            jokers: gamestate.jokers,
            categories: { cat: categories, catUnused }
        };

        this.colors = colors;
    }
}

class Question {
    constructor(question) {
        this.category = {
            title: question.category,
            color: toUnderscore(question.category)
        };
        this.type = question.type;
        this.question = question.category === "Film & TV" ? question.question.replace(/featued/gm, "featured") : question.question;
        this.correctAnswer = question.category === "Science" ? this.fixLowerCase(question.correctAnswer) : question.correctAnswer;
        this.wrongAnswers = question.category === "Science" ? this.fixLowerCase(question.incorrectAnswers) : question.incorrectAnswers;
        this.multipleChoice = this.makeMultipleChoice();
        this.userAnswer;
        this.result = "unanswered";
        this.time = 0;
        this.points = 0;
    }

    makeMultipleChoice() {
        const allWrongAnswers = [...this.wrongAnswers];
        const randomWrongAnswers = [];

        while (randomWrongAnswers.length < 3) {
            let random = Math.floor(Math.random() * allWrongAnswers.length);
            randomWrongAnswers.push(allWrongAnswers[random]);
            allWrongAnswers.splice(random, 1);
        }

        const choices = shuffleArray([this.correctAnswer, ...randomWrongAnswers]);
        return choices;
    }

    fixLowerCase(answerOrArray) {
        if (typeof answerOrArray === "object") {
            return answerOrArray.map((answer) => {
                if (answer[0].toUpperCase() !== answer[0]) {
                    return answer[0].toUpperCase() + answer.substring(1);
                } else {
                    return answer;
                }
            });
        } else if (typeof answerOrArray === "string") {
            if (answerOrArray[0].toUpperCase() !== answerOrArray[0]) {
                return answerOrArray[0].toUpperCase() + answerOrArray.substring(1);
            } else {
                return answerOrArray;
            }
        }
    }

}

class UIForQuiz extends UI {
    constructor(question, gamestate, timer) {
        super();
        this.mainElement = document.querySelector("#main");
        this._quizElement = new QuizScreen({ question, gamestate, timer });
        this._timeElement;

        this.mainElement.innerHTML = "";
        this.render(this.mainElement, this._quizElement.root);
    }

    set quizElement(quizComp) {
        this._quizElement = quizComp;
        this.mainElement.innerHTML = "";
        this.render(this.mainElement, this._quizElement.root);
    }

    set timeElement(timeComp) {
        this._timeElement = timeComp;
        if (window.innerWidth >= 768) {
            document.querySelector("#timer-container").innerHTML = "";
            this.render(document.querySelector("#timer-container"), this._timeElement);
        } else {
            document.querySelector("#timer-container-small").innerHTML = "";
            this.render(document.querySelector("#timer-container-small"), this._timeElement);
        }
    }
}

class Quiz {
    constructor() {
        this._questions = [];
        this._gamestate = {
            answered: 0,
            points: 0,
            board: [],
            jokers: {
                fifty: true,
                switch: true,
                lookup: true
            }
        };
        this.timer = {
            total: 20,
            elapsed: 0
        };
        this.ui = {};
        this._extraQuestion;
        this._discardedQuestion;
    }

    init(questions) {
        this._extraQuestion = new Question(questions.pop());
        this._questions = questions.map((question) => new Question(question));
        this._questions.forEach((question, index) => {
            this._gamestate.board[index] = question.result;
        });
        // console.log(this.timer)
        this.ui = new UIForQuiz(this._questions[0], this._gamestate, this.timer);
        this.startTimer();
    }

    get gamestate() {
        return this._gamestate;
    }

    get questions() {
        return this._questions;
    }

    startTimer() {
        this.timer.start = Date.now();

        this.timer.timeInterval = setInterval(() => {

            this.timer.time = Date.now() - this.timer.start;
            this.timer.elapsed = Math.floor(this.timer.time / 1000);

            this.ui.timeElement = window.innerWidth >= 768 ? new Time({ category: this._questions[this._gamestate.answered].category, timer: this.timer }) : new TimeSmallScreen({ category: this._questions[this._gamestate.answered].category, timer: this.timer })


            if (this.timer.elapsed === this.timer.total) {
                clearInterval(this.timer.timeInterval);
                this.validate();
            }

        }, 1000);

    }

    resetTimer() {
        clearInterval(this.timer.timeInterval);
        this.timer.elapsed = 0;
    }

    validate(answer) {
        // Stop timer
        clearInterval(this.timer.timeInterval);

        const exactTime = Date.now() - this.timer.start;

        // Update quiz values
        this._questions[this._gamestate.answered].userAnswer = answer;
        this._questions[this._gamestate.answered].result = answer === this._questions[this._gamestate.answered].correctAnswer ? "correct" : "wrong";
        this._gamestate.board[this._gamestate.answered] = this._questions[this._gamestate.answered].result;
        this._questions[this._gamestate.answered].time = exactTime <= 20000 ? exactTime : 20000;

        // Calculate score based on time elapsed
        if (this._questions[this._gamestate.answered].result === "correct") {
            const bonus = Math.ceil((20000 - exactTime) / 2000);
            this._questions[this._gamestate.answered].points = 10 + bonus;
            this._gamestate.points += 10 + bonus;
        } else {
            this._questions[this._gamestate.answered].points = 0;
        }

        // Update UI
        this.ui.quizElement = new QuizScreen({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });

        this._gamestate.answered++;
    }

    advance() {
        if (this._questions[this._gamestate.answered]) {
            this.resetTimer();
            this.ui.quizElement = new QuizScreen({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            this.startTimer();
        }
    }

    reset() {
        this.resetTimer();
        this._questions = [];
        this._discardedQuestion = null;
        this._gamestate.answered = 0;
        this._gamestate.points = 0;
        this._gamestate.board = [];
        this._gamestate.jokers = { fifty: true, switch: true, lookup: true };
        this.ui = {};
    }

    showResults() {       
        stats.init(this._questions, this._gamestate, this._discardedQuestion);
    }

    useJoker(joker) {
        if (joker === "fifty" && this._gamestate.jokers.fifty) {
            const currentQuestion = this._questions[this._gamestate.answered];
            let random1, random2;

            while (currentQuestion.multipleChoice[random1] === currentQuestion.correctAnswer || currentQuestion.multipleChoice[random2] === currentQuestion.correctAnswer || random1 === random2) {
                random1 = Math.floor(Math.random() * currentQuestion.multipleChoice.length);
                random2 = Math.floor(Math.random() * currentQuestion.multipleChoice.length);
            }

            this._questions[this._gamestate.answered].fifty = { random1, random2 };
            this._gamestate.jokers.fifty = false;
            this.ui.quizElement = new QuizScreen({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
        } else if (joker === "switch" && this._gamestate.jokers.switch) {
            clearInterval(this.timer.timeInterval);
            this._questions[this._gamestate.answered].time = Date.now() - this.timer.start;
            this._gamestate.jokers.switch = false;
            this._questions[this._gamestate.answered].switch = true;
            this.ui.quizElement = new QuizScreen({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            setTimeout(() => {
                this._discardedQuestion = this._questions[this._gamestate.answered];
                this._questions[this._gamestate.answered] = this._extraQuestion;
                this._questions[this._gamestate.answered].switched = true;
                this.timer.elapsed = 0;
                this.ui.quizElement = new QuizScreen({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
                this.startTimer();
            }, 1000);
        } else if (joker === "lookup") {
            this._gamestate.jokers.lookup = false;
            this._questions[this._gamestate.answered].lookup = true;
            this.resetTimer();
            this.ui.quizElement = new QuizScreen({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            this.startTimer();
        }
    }
}

export const settings = new Settings();
export const quiz = new Quiz();
export const stats = new Stats();