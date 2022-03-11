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
            throw new Error("no categories selected");
        }
    }

    async fetchQuestions() {
        try {
            const categories = this.checkCategories();
            let url = `https://api.trivia.willfry.co.uk/questions?categories=${categories}&limit=9`;
            if (this._categories.length === 1 && this._categories[0] === "history") {
                console.log("History selected");
                url = `https://opentdb.com/api.php?amount=9&category=23&difficulty=easy&type=multiple`;
            }
            const result = await fetch(url);
            const questions = await result.json();
            questions.results ? quiz.init(questions.results) : quiz.init(questions);
        } catch (error) {
            console.log(error.message);
        }

    }
}


// Question Class: Represents a Question

class Question {
    constructor(question) {
        this.category = {
            title: question.category,
            color: question.category.toLowerCase().replace(/\s/g, "_")
        };
        this.type = question.type;
        this.question = question.question;
        this.correctAnswer = question.correctAnswer ? question.correctAnswer : question.correct_answer;
        this.wrongAnswers = question.incorrectAnswers ? question.incorrectAnswers : question.incorrect_answers;
        this.multipleChoice = this.makeMultipleChoice();
        this.userAnswer;
        this.result = "unanswered";
        this.time = 0;
    }

    makeMultipleChoice() {
        const allWrongAnswers = [...this.wrongAnswers];
        const randomWrongAnswers = [];

        while (randomWrongAnswers.length < 3) {
            let random = Math.floor(Math.random() * allWrongAnswers.length);
            randomWrongAnswers.push(allWrongAnswers[random]);
            allWrongAnswers.splice(random, 1);
        }

        const choices = [this.correctAnswer, ...randomWrongAnswers].sort(() => 0.5 - Math.random());
        return choices;
    }

    // validate(answer) {
    //     this.userAnswer = answer;
    //     this.result = answer === this.correctAnswer ? "correct" : "wrong";
    //     return this.result;
    // }

}

class UIForQuiz {
    constructor(question, gamestate, timer) {
        console.log(timer)
        this.mainElement = document.querySelector("#main");
        this._quizElement = new QuizComponent({
            // category: question.category,
            question: question,
            gamestate: gamestate,
            timer: timer
            // multipleChoice: question.multipleChoice,
            // answered: gamestate.answered,
            // points: gamestate.points,
            // board: gamestate.board,
            // handler: this.answerHandler
        });
        this._timeElement;

        this.render(this.mainElement, this._quizElement.root);
        // this.countdown();
    }

    set quizElement(quizComp) {
        this._quizElement = quizComp;
        this.mainElement.innerHTML = "";
        this.render(this.mainElement, this._quizElement.root);
    }

    set timeElement(timeComp) {
        this._timeElement = timeComp;
        document.querySelector("#timer-container").innerHTML = "";
        this.render(document.querySelector("#timer-container"), this._timeElement);
    }

    // updateComponent(component, question, gamestate) {
    //     switch (component) {
    //         case "quizBox":
    //             this._quizElement = new QuizComponent(question, gamestate, this.answerHandler);
    //             this.render(this.mainElement, this._quizElement.abstractDOMTree.root)
    //             break;
    //         case "stats":
    //             this.stats = new StatsComponent(question, gamestate.points);
    //             this.render(document.querySelector("#stats-component"), this.stats.abstractDOMTree.root);
    //             break;
    //         case "answers":
    //             this.answers = new AnswersComponent(question, null);
    //             this.render(document.querySelector("#box-component"), this.answers.abstractDOMTree.root);
    //             //document.querySelector("#answers-component").children[question.correctAnswer.index].firstElementChild.classList.add("correct");
    //             break;
    //     }
    // }

    // updateStats(category, gamestate) {
    //     this.stats = new StatsComponent(category, gamestate);
    //     this.render(document.querySelector("#stats-component"), this.stats.abstractDOMTree.root);
    // }

    // updateAnswers(userAnswer, correctAnswer) {
    //     // this.answers = new AnswersComponent(question, null);
    //     // this.compileDOMTree(document.querySelector("#box-component"), this.answers.abstractDOMTree.root);
    //     document.querySelector("#answers-component")
    // }

    render(rootNode, startingNode) {

        rootNode.append(startingNode.element);

        // if (startingNode.componentDidMount) {
        //     startingNode.componentDidMount();
        // }

        if (startingNode.children) {
            startingNode.children.forEach((child) => {
                this.render(rootNode.lastElementChild, child);
            })

        }

    }

    countdown() {
        this.timerVals.start = Date.now();
        // this.timerVals.degreeFirstHalf = 0;
        // this.timerVals.degreeSecondHalf = 0;
        // this.timerVals.seconds = 12;

        this.timerVals.timeInterval = setInterval(() => {

            this.timerVals.time = Date.now() - this.timerVals.start;
            this.timerVals.elapsed = Math.floor(this.timerVals.time / 1000);


            document.querySelector("#timer-container").innerHTML = "";
            this.render(document.querySelector("#timer-container"), new Time({
                category: quiz.questions[quiz.gamestate.answered].category,
                // secondHalf: this.timerVals.elapsed <= 6 ? `rotate(${this.timerVals.degreeSecondHalf += 30}deg)` : "",
                // firstHalf: this.timerVals.elapsed > 6 ? `rotate(${this.timerVals.degreeFirstHalf += 30}deg)` : "",
                // seconds: --this.timerVals.seconds
                time: this.timerVals.elapsed
            }));

            if (this.timerVals.elapsed === 12) {
                clearInterval(this.timerVals.timeInterval);
            }

        }, 1000);

    }

}

// Quiz

class Quiz {
    constructor() {
        // this._questions = questions.map((question) => new Question(question));
        this._questions = [];
        this._gamestate = {
            answered: 0,
            points: 0,
            board: []
        };
        this.timer = {
            total: 20,
            elapsed: 0
        };
        this.ui = {};
    }

    init(questions) {
        this._questions = questions.map((question) => new Question(question));
        this._questions.forEach((question, index) => {
            this._gamestate.board[index] = question.result;
        });
        console.log(this.timer)
        this.ui = new UIForQuiz(this._questions[0], this._gamestate, this.timer);
        this.startTimer();
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

    startTimer() {
        this.timer.start = Date.now();

        this.timer.timeInterval = setInterval(() => {

            this.timer.time = Date.now() - this.timer.start;
            this.timer.elapsed = Math.floor(this.timer.time / 1000);

            this.ui.timeElement = new Time({ category: this._questions[this._gamestate.answered].category, timer: this.timer });

            if (this.timer.elapsed === this.timer.total) {
                clearInterval(this.timer.timeInterval);
                this.validate();
            }

        }, 1000);

    }

    resetTimer() {
        this.timer.elapsed = 0;
    }

    validate(answer) {

        // Stop timer
        clearInterval(this.timer.timeInterval);

        const exactTime = Date.now() - this.timer.start;

        console.log(exactTime)

        // Update quiz values
        this._questions[this._gamestate.answered].userAnswer = answer;
        this._questions[this._gamestate.answered].result = answer === this._questions[this._gamestate.answered].correctAnswer ? "correct" : "wrong";
        this._gamestate.board[this._gamestate.answered] = this._questions[this._gamestate.answered].result;
        this._questions[this._gamestate.answered].time = this.timer.elapsed;
        // this._gamestate.points += this._questions[this._gamestate.answered].result === "correct" ? (20 - this._questions[this._gamestate.answered].time * 0.5) : 0;

        // Calculate score based on time elapsed
        if (this._questions[this._gamestate.answered].result === "correct") {
            if (exactTime < 2000) this._gamestate.points += 10;
            else if (exactTime < 4000) this._gamestate.points += 9;
            else if (exactTime < 6000) this._gamestate.points += 8;
            else if (exactTime < 8000) this._gamestate.points += 7;
            else if (exactTime < 10000) this._gamestate.points += 6;
            else if (exactTime < 12000) this._gamestate.points += 5;
            else if (exactTime < 14000) this._gamestate.points += 4;
            else if (exactTime < 16000) this._gamestate.points += 3;
            else if (exactTime < 18000) this._gamestate.points += 2;
            else if (exactTime < 20000) this._gamestate.points += 1;
        }

        // this.ui.updateComponent("stats", currentQuestion, this._gamestate);
        // this.ui.updateComponent("answers", currentQuestion);

        // Update UI
        this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });

        this._gamestate.answered++;

        // setTimeout(() => {

        // }, 3000)

        // return {
        //     result: currentQuestion.result,
        //     points: this._gamestate.points,
        //     correctAnswer: currentQuestion.correctAnswer.index
        // }

        //setTimeout(DisplayNextButton, 3000);
    }

    advance() {
        this.resetTimer();
        this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
        this.startTimer();
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
            if (settings.categories.length) {
                settings.fetchQuestions();
                //quiz.init(testQuestions);
                this.selectionPage.style.display = "none";
            }
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
            if (properties[propertyName] && typeof properties[propertyName] === "object") {
                //const nestedObj = properties[propertyName];
                Object.keys(properties[propertyName]).forEach((nestedProperty) => {
                    element[propertyName][nestedProperty] = properties[propertyName][nestedProperty];
                })
            } else {
                element[propertyName] = properties[propertyName];
            }

        });
    }

    return element;
}



class QuizComponent {
    constructor({ question, gamestate, timer }) {
        this.root = {
            element: buildNode("div", { id: "quiz-element", className: "container-lg" }),
            children: [
                {
                    element: buildNode("div", { className: "row justify-content-center" }),
                    children: [
                        new InfoRail({ question, gamestate, timer }),
                        {
                            element: buildNode("div", { id: "quizbox-component", className: "col-11 col-md-8 col-xxl-7 mt-5" }),
                            children: [
                                new QuestionComponent({ category: question.category, question: question.question }),
                                new Answers({ question })
                            ]
                        }
                    ]
                },
                ...question.result !== "unanswered" ? [new NextButton()] : []
            ]

        }
    }
}

class InfoRail {
    constructor({ question, gamestate, timer }) {
        this.element = buildNode("div", { className: "col-md-2 d-flex me-2 mt-5" }),
        this.children = [
            {
                element: buildNode("div", { className: "row justify-content-end" }),
                children: [
                    {
                        element: buildNode("div", { className: "d-none d-md-flex col-md-12 col-xl-10 col-xxl-9 bg-light rounded-lg flex-column" }),
                        children: [
                            new InfoHeader({ category: question.category, answered: gamestate.answered }),
                            new Timer({ category: question.category, timer }),
                            new Score({ points: gamestate.points, board: gamestate.board })
                        ]
                    }
                ]
            }
        ]
    }
}


class InfoHeader {
    constructor({ category, answered }) {
        this.element = buildNode("div", { className: "row mb-1 p-3" });
        this.children = [
            {
                element: buildNode("div", { className: `col rounded-lg p-2 bg-${category.color}` }),
                children: [
                    {
                        element: buildNode("p", { className: "px-0 my-2 text-center small-font" }),
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
    constructor({ category, timer }) {

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
                            new Time({ category, timer })
                            // {
                            //     element: buildNode("div", { className: "radial-timer" }),
                            //     children: [
                            //         {
                            //             element: buildNode("div", { className: `first-half-js bg-${category.color}` }),
                            //             children: null
                            //         },
                            //         {
                            //             element: buildNode("div", { className: "half-mask" }),
                            //             children: null
                            //         },
                            //         {
                            //             element: buildNode("div", { className: `second-half-js bg-${category.color}` }),
                            //             children: null
                            //         },
                            //         {
                            //             element: buildNode("div", { className: "seconds d-flex align-items-center justify-content-center lead" }),
                            //             children: [
                            //                 {
                            //                     element: buildNode("h4", { id: "seconds-js" }),
                            //                     children: [
                            //                         {
                            //                             element: document.createTextNode(`${secs}`),
                            //                             children: null
                            //                         }
                            //                     ]
                            //                 }
                            //             ]
                            //         }
                            //     ]
                            // }
                        ]
                    }
                ]
            }
        ];
        this.state = {
            secondHalf: this.children[0].children[1].children[0].children[2].element,
            firstHalf: this.children[0].children[1].children[0].children[0].element,
            seconds: this.children[0].children[1].children[0].children[3].children[0].element
            // start: undefined,
            // timeInterval: undefined,
            // time: undefined,
            // degree: undefined,
            // elapsed: undefined,
            // object: undefined,
        }
    }
    componentDidMount() {

        // this.state.secondHalf = document.querySelector(".second-half-js");
        // this.state.firstHalf = document.querySelector(".first-half-js");
        // this.state.seconds = document.querySelector("#seconds-js");

        // let start;
        // let timeInterval;
        // let time;

        const grabAsync = () => {
            return new Promise((resolve, reject) => {
                document.querySelector
            })
        }

        const selectAsync = async (selector) => {
            while (document.querySelector(selector) === null) {
                await grabAsync()
            }
        }

        this.state.start = Date.now();
        this.state.degree = 0;
        this.state.object = this.state.secondHalf;

        this.state.timeInterval = setInterval(function () {

            this.state.time = Date.now() - this.state.start;

            this.state.elapsed = Math.floor(this.state.time / 1000);

            this.state.seconds.textContent--;

            this.state.object.style.transform = `rotate(${this.state.degree += 30}deg)`;

            if (this.state.elapsed === 6) {
                //clearInterval(timeInterval)
                this.state.secondHalf.style.display = "none";
                this.state.object = this.state.firstHalf;
                this.state.degree = 0;
            }

            if (this.state.elapsed === 12) {
                clearInterval(this.state.timeInterval);
            }

        }.bind(this), 1000);
    }
}

class Time {
    constructor({ category, timer }) {

        const noDisplay = () => {
            if (timer.elapsed > timer.total / 2) {
                return "d-none";
            }
        }

        const secondHalf = timer.elapsed <= timer.total / 2 ? `rotate(${timer.elapsed * (360 / timer.total)}deg)` : "";
        const firstHalf = timer.elapsed > timer.total / 2 ? `rotate(${(timer.elapsed - timer.total / 2) * (360 / timer.total)}deg)` : "";

        this.element = buildNode("div", { className: "radial-timer" });
        this.children = [
            {
                element: buildNode("div", { className: `first-half-js bg-${category.color}`, style: { transform: firstHalf } }),
                children: null
            },
            {
                element: buildNode("div", { className: "half-mask" }),
                children: null
            },
            {
                element: buildNode("div", { className: `second-half-js bg-${category.color} ${noDisplay()}`, style: { transform: secondHalf } }),
                children: null
            },
            {
                element: buildNode("div", { className: "seconds d-flex align-items-center justify-content-center lead" }),
                children: [
                    {
                        element: buildNode("h4", { id: "seconds-js" }),
                        children: [
                            {
                                element: document.createTextNode(`${timer.total - timer.elapsed}`),
                                children: null
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
            return new BoardField({ field });
        });

        this.element = buildNode("div", { id: "score-component", className: "row mb-1 py-3 px-lg-4 px-md-1 text-center" });
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
                    new QuestionHeader({ category }),
                    new QuestionText({ question })
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
                                        element: buildNode("p", { className: "my-2 small-font" }),
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
                                element: buildNode("div", { className: "col-2 text-start text-sm-end px-1 px-sm-2" }),
                                children: [
                                    {
                                        element: buildNode("i", { className: "bi bi-hourglass-top fs-4 p-1 cursor joker-highlight" }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-2 text-start text-sm-end px-1 px-sm-2" }),
                                children: [
                                    {
                                        element: buildNode("i", { className: "bi bi-arrow-left-right fs-4 p-1 cursor joker-highlight" }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-2 d-flex align-items-center justify-content-end px-0 px-sm-2" }),
                                children: [
                                    {
                                        element: buildNode("strong", { className: "border border-dark p-1 cursor fifty-fifty joker-highlight" }),
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
    constructor({ question }) {

        // let answers;

        // if (question.result === "correct") {
        //     answers = question.multipleChoice.map((answer) => {
        //         if (answer === question.correctAnswer.title && answer === question.userAnswer) {
        //             return new Answer({ answer: answer, result: "correct", category: { color: undefined }, handler: handler });
        //         } else {
        //             return new Answer({ answer: answer, result: "white", category: question.category, handler: handler });
        //         }
        //     });
        // } else if (question.result === "wrong") {
        //     if (answer === question.correctAnswer.title && answer === question.userAnswer) {
        //         return new Answer({ answer: answer, result: "correct", category: { color: undefined }, handler: handler });

        // }

        // const answers = [];

        // for (let i = 0; i < question.multipleChoice.length; i++) {
        //     if ()

        //     answers.push(new Answer({
        //         answer: question.multipleChoice[i],
        //         result: question.result,
        //         category: question.category,
        //         handler }));
        // }

        const handler = question.result === "unanswered" ? (event) => quiz.validate(event.target.textContent) : null;

        const answers = question.multipleChoice.map((answer) => {

            if (question.result === "correct" && answer === question.correctAnswer) {
                return new Answer({ answer: answer, result: "correct", category: { color: undefined }, handler: handler });
            }

            if (question.result === "wrong" && answer === question.userAnswer) {
                return new Answer({ answer: answer, result: "wrong", category: { color: undefined }, handler: handler });
            }

            if (question.result === "wrong" && answer === question.correctAnswer) {
                return new Answer({ answer: answer, result: "actually-correct", category: { color: undefined }, handler: handler });
            }

            if (question.result !== "unanswered") {
                return new Answer({ answer, result: "white", category: { color: undefined }, handler: handler })
            }

            return new Answer({ answer: answer, result: "white", category: question.category, handler: handler });

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
    constructor({ answer, result, category, handler }) {
        this.element = buildNode("div", { className: "col-md-6 px-3 px-md-2" });
        this.children = [
            {
                element: buildNode("p", { className: `rounded-lg p-2 py-md-5 my-0 bg-answer-${result} border answer-highlight-${category.color}`, onclick: handler }),
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

class NextButton {
    constructor() {

        const handler = () => {
            quiz.advance();
        }

        this.element = buildNode("div", { className: "row justify-content-center" }),
            this.children = [
                {
                    element: buildNode("div", { className: "col-11 col-md-10 col-xxl-9 mt-3" }),
                    children: [
                        {
                            element: buildNode("div", { className: "row justify-content-center justify-content-md-end" }),
                            children: [
                                {
                                    element: buildNode("div", { className: "col-5 col-lg-3 px-0 d-flex justify-content-md-end justify-content-center" }),
                                    children: [
                                        {
                                            element: buildNode("button", { className: "btn btn-outline-dark px-4", onclick: handler }),
                                            children: [
                                                {
                                                    element: document.createTextNode("Next Question"),
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

// depthFirstTraversalTest(document.querySelector("#main"), new QuizComponent({
//     category: {
//         title: "Geography",
//         color: "geography"
//     },
//     question: "Togo is located on which continent?",
//     multipleChoice: ["South America", "Europe", "Asia", "Africa"],
//     answered: 0,
//     points: 0,
//     board: ["unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered", "unanswered"],
//     handler: function (event) {

//         const userAnswer = event.target.textContent;

//         if (userAnswer === "Africa") {
//             event.target.classList.add("correct");
//             event.target.classList.remove("answer-highlight-geography");
//         } else {
//             // updateAnswers(userAnswer, correctAnswer);
//             // For now let's just do
//             event.target.classList.add("incorrect");
//         }

//     }
// }).root);


function resultIcon(value) {
    switch (value) {
        case "unanswered":
            return "circle";
        case "correct":
            return "check-circle";
        case "wrong":
            return "x-circle";
    }
}



const testQuestions = [{ "category": "Geography", "correctAnswer": "Africa", "id": 6696, "incorrectAnswers": ["South America", "Oceania", "Europe", "Asia", "North America"], "question": "Togo is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Sudan", "id": 6549, "incorrectAnswers": ["South Sudan", "Egypt", "Republic of the Congo", "Equatorial Guinea", "Gabon", "Benin", "Democratic Republic of the Congo", "Eritrea", "Uganda", "Togo", "São Tomé and Príncipe", "Rwanda", "Tunisia", "Malta"], "question": "Which of these countries borders Chad?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Asia", "id": 22872, "incorrectAnswers": ["Europe", "Africa", "North America", "South America"], "question": "Which is the Earth's largest continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "South America", "id": 6683, "incorrectAnswers": ["Oceania", "Europe", "Asia", "Africa", "North America"], "question": "Suriname is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Spain", "id": 5713, "incorrectAnswers": ["Portugal", "Andorra", "Mali", "Tunisia", "France", "Monaco", "Senegal", "Burkina Faso", "Switzerland", "The Gambia", "Malta", "Ireland", "Italy", "Belgium", "Luxembourg", "Liechtenstein", "Niger"], "question": "Morocco shares a land border with which of these countries?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Tripoli", "id": 19272, "incorrectAnswers": ["Benghazi", "Tunis", "Alexandria"], "question": "What is the capital of Libya?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Europe", "id": 6685, "incorrectAnswers": ["South America", "Oceania", "Asia", "Africa", "North America"], "question": "Andorra is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "East Timor", "id": 5609, "incorrectAnswers": ["Solomon Islands", "Vanuatu", "Palau", "Brunei", "Nauru", "Federated States of Micronesia", "Fiji", "Philippines", "Malaysia", "Singapore", "Tuvalu", "Kiribati", "Marshall Islands", "Cambodia", "Vietnam", "Thailand"], "question": "Which of these countries borders Australia?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Austria", "id": 19550, "incorrectAnswers": ["Croatia", "San Marino", "Bosnia and Herzegovina", "Romania", "Poland"], "question": "Which country borders Italy, Switzerland, Germany, Czech Republic, Hungary, Slovenia, and Liechtenstein?", "type": "Multiple Choice" }];


quiz.init(testQuestions);

const secondHalf = document.querySelector(".second-half-js");
const firstHalf = document.querySelector(".first-half-js");
const seconds = document.querySelector("#seconds-js");

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