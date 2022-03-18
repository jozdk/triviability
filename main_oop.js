class Stats {
    constructor({ questions, gamestate }) {

        // Calculate stats
        const amountTotal = questions.length;
        const correct = questions.filter(question => question.result === "correct").length;
        const percent = (correct / amountTotal * 100) % 1 === 0 ? (correct / amountTotal * 100) : (correct / amountTotal * 100).toFixed(2);
        const percentScore = gamestate.points / (questions.length * 20) * 100;
        let emoji;
        if (percentScore >= 85) emoji = "bi bi-emoji-sunglasses";
        else if (percentScore >= 70) emoji = "bi bi-emoji-laughing";
        else if (percentScore >= 55) emoji = "bi bi-emoji-smile";
        else if (percentScore >= 40) emoji = "bi bi-emoji-neutral";
        else if (percentScore >= 25) emoji = "bi bi-emoji-smile-upside-down";
        else if (percentScore >= 0) emoji = "bi bi-emoji-dizzy";
        console.log(Math.round(percentScore));
        const colors = questions.map(question => question.category.color).filter((cat, i, arr) => arr.indexOf(cat) === i);
        const times = questions.map(question => question.time);
        const timeTotal = times.reduce((acc, curr) => acc + curr) / 1000;
        const average = (timeTotal / questions.length).toFixed(3);
        const fastest = Math.min(...times) / 1000;
        const categoryCount = {};
        questions.forEach((q) => categoryCount[q.category.title] = categoryCount[q.category.title] ? categoryCount[q.category.title] + 1 : 1);
        const categories = questions.map(question => question.category.title).filter((category, index, arr) => arr.indexOf(category) === index);
        Object.keys(categoryCount).forEach(cat => {
            categories[categories.indexOf(cat)] = { category: cat, percent: Math.round(categoryCount[cat] / amountTotal * 100) }
        });
        const catUnused = settings.categories.map(cat => {
            let category = (cat[0].toUpperCase() + cat.slice(1))
            .replace("and", "&")
            .replace(/_/g, " ")
            .replace(/(?<=\s)[a-z]/g, (match) => match.toUpperCase());
            if (category === "Movies") category = "Film & TV";
            if (category === "Literature") category = "Arts & Literature";
            console.log(category);
            console.log(!categories.find(cat => cat.category === category))
            return category;
        }).filter(category => !categories.find(cat => cat.category === category));
        console.log(catUnused);

        // Create Element
        this.element = buildNode("div", { id: "stats-element", className: "container" });
        this.children = [
            {
                element: buildNode("div", { className: "row justify-content-center" }),
                children: [
                    new StatsBox({
                        title: "General",
                        colors: colors,
                        stats: [
                            ["Correct", `${correct} of ${amountTotal} = ${percent}%`],
                            [
                                "Score",
                                [
                                    {
                                        element: buildNode("span", { textContent: gamestate.points }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("i", { className: `${emoji} ms-2` }),
                                        children: null
                                    }
                                ]
                            ],
                            [
                                "Categories",
                                [
                                    {
                                        element: buildNode("ul", { className: "list-group list-group-flush", style: { listStyle: "none" } }),
                                        children: [
                                            ...categories.map((cat) => {
                                                return {
                                                    element: buildNode("li", { textContent: `${cat.category} (${cat.percent}%)` }),
                                                    children: null
                                                };
                                            })]
                                    },
                                    {
                                        element: buildNode("ul", { className: "list-group list-group-flush", style: { color: "darkgrey", listStyle: "none" } }),
                                        children: [
                                            ...catUnused.map(cat => {
                                                return {
                                                    element: buildNode("li", { textContent: cat }),
                                                    children: null
                                                }
                                            })
                                        ]
                                    }
                                ]

                            ]
                        ]
                    }),
                    new StatsBox({
                        title: "Time",
                        colors: colors,
                        stats: [
                            ["Time (total)", timeTotal],
                            ["⌀ time per answer", average],
                            ["Fastest correct answer", fastest]
                        ]
                    }),
                    new StatsBox({
                        title: "Jokers",
                        colors: colors,
                        stats: [
                            [{ element: buildNode("span", { className: "border border-dark p-1 me-1 small-font", textContent: "50:50" }) }, gamestate.jokers.fifty ? "No" : "Yes"],
                            [{ element: buildNode("i", { className: "bi bi-arrow-left-right me-1" }) }, gamestate.jokers.switch ? "No" : "Yes"],
                            [{ element: buildNode("i", { className: "bi bi-search me-1" }) }, gamestate.jokers.time ? "No" : "Yes"]
                        ]
                    })
                ]
            },
            new ControlsB(),
            new Overview({ questions }),
            new ControlsB()
        ]
    }
}

class Overview {
    constructor({ questions }) {

        const tableHead = ["No", "Question", "Your Answer", "Seconds", "Points", "Category"];

        const tableData = questions.map((question, index) => {
            return [index + 1, question.question, new AnswersList({ question }), question.time / 1000, question.points, question.category.title];
        });

        const props = questions.map((question) => {
            return {
                0: { className: `bg-${question.category.color}` }
            }
        })

        this.element = buildNode("div", { className: "row justify-content-center mt-5" });
        this.children = [
            {
                element: buildNode("div", { className: "col-11 col-md-10 col-xxl-9" }),
                children: [
                    new Table({ tableData: tableData, props: props, tableHead: tableHead })
                ]
            }
        ];
    }
}

class AnswersList {
    constructor({ question }) {

        const ListElement = (answer) => {
            let color;
            if (answer === question.correctAnswer) color = "green";
            else if (question.result === "wrong" && answer === question.userAnswer) color = "darkred";
            else color = "";

            return {
                element: buildNode("li", { className: "list-group-item", style: { color }, textContent: answer }),
                children: null
            };
        }

        const listElements = question.multipleChoice.map(answer => {
            return ListElement(answer);
        })

        this.element = buildNode("ul", { className: "list-group list-group-flush" });
        this.children = [
            ...listElements
        ]
    }
}

class ControlsB {
    constructor() {

        const catHandler = () => {
            quiz.reset();
            settings.reset();
            settings.ui.selectionMenuElement = new SelectionMenu();
        }

        const playHandler = () => {
            quiz.reset();
            settings.fetchQuestions();
        }

        this.element = buildNode("div", { id: "controls-b", className: "row justify-content-center mt-5" });
        this.children = [
            {
                element: buildNode("div", { className: "col-11 col-md-10 col-xxl-9" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-end" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-auto" }),
                                children: [
                                    {
                                        element: buildNode("button", { className: "btn btn-outline-dark", onclick: catHandler }),
                                        children: [
                                            {
                                                element: buildNode("i", { className: "bi bi-grid-3x3-gap me-1" }),
                                                children: null
                                            },
                                            {
                                                element: buildNode("span", { className: "align-middle" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode("Categories"),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-auto" }),
                                children: [
                                    {
                                        element: buildNode("button", { className: "btn btn-outline-dark", onclick: playHandler }),
                                        children: [
                                            {
                                                element: buildNode("i", { className: "bi bi-arrow-repeat me-1" }),
                                                children: null
                                            },
                                            {
                                                element: buildNode("span", { className: "align-middle" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode("Play Again"),
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

class StatsBox {
    constructor({ colors, title, stats }) {

        const props = stats.map(row => {
            return {
                1: { className: "fw-bold" }
            }
        })

        const hexColors = { "science": "#03FCBA", "history": "#FFF75C", "geography": "#D47AE8", "film_and_tv": "#EA3452", "arts_and_literature": "#71FEFA", "music": "#FFA552", "sport_and_leisure": "#D2FF96", "general_knowledge": "#C4AF9A", "society_and_culture": "#FF579F" };

        this.element = buildNode("div", { className: "col-auto mt-5" });
        this.children = [
            {
                element: buildNode("div", { className: "card p-3 bg-light rounded-lg", style: { minWidth: "300px" } }),
                children: [
                    {
                        element: buildNode("div", { className: `card-header rounded-lg${colors.length === 1 ? ` bg-${colors}` : ""}`, style: { backgroundImage: colors.length > 1 ? `linear-gradient(to right, ${colors.map(color => hexColors[color]).sort(() => 0.5 - Math.random())})` : "" } }),
                        children: [
                            {
                                element: buildNode("span", { className: "fs-5" }),
                                children: [
                                    {
                                        element: document.createTextNode(title),
                                        children: null
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        element: buildNode("div", { className: "card-body" }),
                        children: [
                            new Table({ tableData: stats, props: props })
                        ]
                    }
                ]
            }
        ]
    }
}

class Table {
    constructor({ tableData, props, tableHead }) {

        const headProps = {};
        if (tableHead) {
            tableHead.forEach((header, index) => {
                headProps[index] = { style: { fontWeight: "bold" } }
            })
        }

        const tableRows = tableData.map((row, index) => {
            return new TableRow({ row, props: props[index] });
        })

        this.element = buildNode("table", { className: "table" });
        this.children = [
            ...tableHead ? [
                {
                    element: buildNode("thead"),
                    children: [
                        new TableRow({ row: tableHead, props: headProps })
                    ]
                }] : [],
            {
                element: buildNode("tbody"),
                children: [
                    ...tableRows
                ]
            }

        ]
    }
}

class TableRow {
    constructor({ row, props }) {

        const tableCells = row.map((datum, index) => {
            return new DataCell({ datum, props: props[index] ? props[index] : null });
        })

        this.element = buildNode("tr");
        this.children = [
            ...tableCells
        ]
    }
}

class HeaderCell {
    constructor({ header, props }) {

    }
}

class DataCell {
    constructor({ datum, props }) {
        this.element = buildNode("td", props);
        this.children = [
            ...datum !== Object(datum) ? [{ element: document.createTextNode(`${datum}`), children: null }] : [],
            ...typeof datum === "object" && !Array.isArray(datum) ? [datum] : [],
            ...Array.isArray(datum) ? [...datum] : []
        ]
    }
}

class SelectionMenu {
    constructor() {
        this.element = buildNode("div", { id: "selection-menu", className: "container" });
        this.children = [
            new Welcome(),
            new Categories(),
            new Params(),
            new StartButton()
        ]
    }
}

class Welcome {
    constructor() {
        this.element = buildNode("div", { className: "row mb-4 mt-5 m-xxl-5 justify-content-center" });
        this.children = [
            {
                element: buildNode("div", { className: "col-12" }),
                children: [
                    {
                        element: buildNode("h5", { className: "text-center" }),
                        children: [
                            {
                                element: document.createTextNode("Welcome to Triviability! Choose your Categorie(s) and Click the Button below to Start your Quiz!"),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

class Categories {
    constructor() {

        this.toggleSelection = (element, category) => {
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

        const handler = (event) => {
            const elements = event.composedPath();
            const targetElement = elements.find(element => element.classList && element.classList.contains("category"));
            const category = targetElement ? targetElement.firstElementChild.lastElementChild.innerText : null;
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
                case "Arts & Literature":
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

        const categories = ["Science", "History", "Geography", "Film & TV", "Arts & Literature", "Music", "Sport & Leisure", "General Knowledge", "Society & Culture"]
            .map((category) => {
                return new Category(category);
            });

        this.element = buildNode("div", { id: "category-selection", className: "row mt-3 mb-3 justify-content-center" });
        this.children = [
            {
                element: buildNode("div", { className: "col-md-9 col-xl-8 col-xxl-7" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center gy-4", onclick: handler }),
                        children: [
                            ...categories
                        ]
                    }
                ]
            }
        ]
    }
}

class Category {
    constructor(category) {

        const cssCategory = category.toLowerCase().replace(/\s/g, "_").replace(/&/g, "and");

        this.element = buildNode("div", { className: "col-8 col-sm-6 col-lg-4" });
        this.children = [
            {
                element: buildNode("div", { id: `cat-${cssCategory}`, className: `card category category-highlight cursor bg-${cssCategory}` }),
                children: [
                    {
                        element: buildNode("div", { className: "card-body text-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "h1 mb-3" }),
                                children: [
                                    {
                                        element: buildNode("img", { src: "science.svg", alt: category, className: "w-50" }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("h5", { className: "card-title" }),
                                children: [
                                    {
                                        element: document.createTextNode(category),
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

class Params {
    constructor() {
        this.element = buildNode("div", { className: "row justify-content-center mt-2 py-3" });
        this.children = [
            {
                element: buildNode("div", { className: "col-md-9 col-xl-8 col-xxl-7" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-11 col-sm d-flex" }),
                                children: [
                                    {
                                        element: buildNode("input", { id: "amount", type: "range", className: "form-range", max: "20", value: 9, oninput: (e) => e.target.nextElementSibling.textContent = e.target.value }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("label", { htmlFor: "amount", className: "form-label ms-3", style: { minWidth: "20px" }, textContent: "9" }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-12 col-sm-4 d-flex justify-content-end" }),
                                children: [
                                    new Switch({ type: "Random" }),
                                    new Switch ({ type: "All" })
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

class Switch {
    constructor({ type }) {
        this.element = buildNode("div", { className: "form-check form-check-inline form-switch" });
        this.children = [
            {
                element: buildNode("input", { className: "form-check-input", type: "checkbox", id: type.toLowerCase() }),
                children: null
            },
            {
                element: buildNode("label", { htmlFor: type.toLowerCase(), className: "form-check-label no-select", textContent: type }),
                children: null
            }
        ]
    }
}

class StartButton {
    constructor() {

        const handler = () => {
            if (settings.categories.length) {
                settings.fetchQuestions();
                //quiz.init(testQuestions);
                document.querySelector("#main").innerHTML = "";
            }
        }

        this.element = buildNode("div", { className: "row justify-content-center" });
        this.children = [
            {
                element: buildNode("div", { className: "col-md-9 col-xl-8 col-xxl-7" }),
                children: [
                    {
                        element: buildNode("button", { id: "start-button", className: "btn btn-outline-dark w-100", onclick: handler }),
                        children: [
                            {
                                element: document.createTextNode("Start Quiz!"),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

// Settings

class Settings {
    constructor() {
        this._categories = [];
        this.originalQuestions;
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

    reset() {
        this._categories = [];
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
            //const url = `https://api.trivia.willfry.co.uk/questions?categories=${categories}&limit=9`;
            const url = `https://the-trivia-api.com/questions?categories=${categories}&limit=10`
            const result = await fetch(url);
            const questions = await result.json();
            this.originalQuestions = questions;
            quiz.init(questions);
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
            color: question.category.toLowerCase().replace(/\s/g, "_").replace(/&/g, "and")
        };
        this.type = question.type;
        this.question = question.category === "Film & TV" ? question.question.replace(/featued/gm, "featured") : question.question;
        this.correctAnswer = question.category === "Science" ? this.fixLowerCase(question.correctAnswer) : question.correctAnswer;
        this.wrongAnswers = question.category === "Science" ? this.fixLowerCase(question.incorrectAnswers) : question.incorrectAnswers;
        this.multipleChoice = this.makeMultipleChoice();
        this.userAnswer;
        this.result = "unanswered";
        this.time = 0;
        this.points;
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

        this.mainElement.innerHTML = "";
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
    }

    init(questions) {
        this._extraQuestion = new Question(questions.pop());
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
        clearInterval(this.timer.timeInterval);
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
        this._questions[this._gamestate.answered].time = exactTime <= 20000 ? exactTime : 20000;

        // Calculate score based on time elapsed
        if (this._questions[this._gamestate.answered].result === "correct") {
            const bonus = Math.round((20000 - exactTime) / 2000);
            this._questions[this._gamestate.answered].points = 10 + bonus;
            this._gamestate.points += 10 + bonus;
        } else {
            this._questions[this._gamestate.answered].points = 0;
        }

        // this.ui.updateComponent("stats", currentQuestion, this._gamestate);
        // this.ui.updateComponent("answers", currentQuestion);

        // Update UI
        this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });

        this._gamestate.answered++;

    }

    advance() {
        // if (this._questions[this._gamestate.answered].result === "unanswered") {

        // }
        this.resetTimer();
        this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
        this.startTimer();
    }

    reset() {
        this.resetTimer();
        this._questions = [];
        this._gamestate.answered = 0;
        this._gamestate.points = 0;
        this._gamestate.board = [];
        this._gamestate.jokers = { fifty: true, switch: true, lookup: true };
        this.ui = {};
    }

    // Highly preliminary. It is to be considered if there should be one more controlling Stats Object next to Settings and Quiz, where the calculations of 
    // stats take place and which passes them to the stats component. Or the UI Objects for Quiz and Settings need to be incorporated by the components, that
    // would be responsible for their own rendering then
    showResults() {
        document.querySelector("#main").innerHTML = "";
        this.ui.render(document.querySelector("#main"), new Stats({ questions: this._questions, gamestate: this._gamestate }));
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
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
        } else if (joker === "time" && this._gamestate.jokers.time) {
            this.resetTimer();
            this._questions[this._gamestate.answered].time = true;
            this._gamestate.jokers.time = false;
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            this.startTimer();
        } else if (joker === "switch" && this._gamestate.jokers.switch) {
            clearInterval(this.timer.timeInterval);
            this._gamestate.jokers.switch = false;
            this._questions[this._gamestate.answered].switch = true;
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            setTimeout(() => {
                this._questions[this._gamestate.answered] = this._extraQuestion;
                this._questions[this._gamestate.answered].switched = true;
                this.timer.elapsed = 0;
                this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
                this.startTimer();
            }, 1000);
        } else if (joker === "lookup") {
            this._gamestate.jokers.lookup = false;
            this._questions[this._gamestate.answered].lookup = true;
            //const queryString = this._questions[this._gamestate.answered].question.replace(/\s/gm, "+").replace(/\?/gm, "%3F");
            //const url = `https://google.com/search?q=${queryString}`;
            //window.open(url, "", "width=900,height=600,noopener,noreferrer");
            this.resetTimer();
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            this.startTimer();
        }
    }
}


// UI Class: Handles UI Tasks

class UIForSettings {
    constructor() {
        //this.selectionPage = document.querySelector("#selection-menu");
        //this.selectionElement = document.querySelector("#category-selection");
        //this.startButton = document.querySelector("#start-button");
        this.mainElement = document.querySelector("#main");
        this._selectionMenuElement = new SelectionMenu();

        this.render(this.mainElement, this._selectionMenuElement);

        // this.selectionElement.addEventListener("click", (event) => {
        //     if (event.target !== this.selectionElement && !event.target.classList.contains("col-sm-12")) {
        //         const elements = event.composedPath();
        //         const targetElement = elements.find(element => element.classList.contains("category"));
        //         const category = targetElement.firstElementChild.lastElementChild.innerText;
        //         switch (category) {
        //             case "Science":
        //                 this.toggleSelection(targetElement, "science");
        //                 break;
        //             case "History":
        //                 this.toggleSelection(targetElement, "history");
        //                 break;
        //             case "Geography":
        //                 this.toggleSelection(targetElement, "geography");
        //                 break;
        //             case "Film & TV":
        //                 this.toggleSelection(targetElement, "movies");
        //                 break;
        //             case "Art & Literature":
        //                 this.toggleSelection(targetElement, "literature");
        //                 break;
        //             case "Music":
        //                 this.toggleSelection(targetElement, "music");
        //                 break;
        //             case "Sport & Leisure":
        //                 this.toggleSelection(targetElement, "sport_and_leisure");
        //                 break;
        //             case "General Knowledge":
        //                 this.toggleSelection(targetElement, "general_knowledge");
        //                 break;
        //             case "Society & Culture":
        //                 this.toggleSelection(targetElement, "society_and_culture");
        //                 break;
        //         }
        //     }

        // });

        // this.startButton.addEventListener("click", () => {
        //     if (settings.categories.length) {
        //         settings.fetchQuestions();
        //         //quiz.init(testQuestions);
        //         this.selectionPage.style.display = "none";
        //     }
        // });

    }

    set selectionMenuElement(menuComp) {
        this._selectionMenuElement = menuComp;
        this.mainElement.innerHTML = "";
        this.render(this.mainElement, this._selectionMenuElement);
    }

    // toggleSelection(element, category) {
    //     if (element.classList.contains("category-highlight")) {
    //         element.classList.add("selected");
    //         element.classList.remove("category-highlight");
    //         settings.categories = {
    //             category: category,
    //             request: "add"
    //         };
    //     } else if (element.classList.contains("selected")) {
    //         element.classList.remove("selected");
    //         element.classList.add("category-highlight");
    //         settings.categories = {
    //             category: category,
    //             request: "remove"
    //         }
    //     }
    // }

    render(rootNode, startingNode) {

        rootNode.append(startingNode.element);

        if (startingNode.children) {
            startingNode.children.forEach((child) => {
                this.render(rootNode.lastElementChild, child);
            })

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
            } else if (properties[propertyName]) {
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
                                new QuestionComponent({ question, jokers: gamestate.jokers }),
                                new Answers({ question })
                            ]
                        }
                    ]
                },
                new Controls({ gamestate, result: question.result })
            ]

        }
    }
}

class InfoRail {
    constructor({ question, gamestate, timer }) {
        this.element = buildNode("div", { className: "col-md-2 d-flex me-2 mt-5" });
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
    constructor({ question, jokers }) {
        this.element = buildNode("div", { id: "question-component", className: "row" });
        this.children = [
            {
                element: buildNode("div", { className: "col bg-light rounded-lg" }),
                children: [
                    new QuestionHeader({ question, jokers }),
                    new QuestionText({ question: question.question })
                ]
            }
        ]
    }
}

class QuestionHeader {
    constructor({ question, jokers }) {

        const queryString = jokers.lookup && question.result === "unanswered" ? question.question.replace(/\s/gm, "+").replace(/\?/gm, "%3F") : "";

        const handler = (event) => {
            quiz.useJoker(event.target.id);
        }

        this.element = buildNode("div", { id: "question-header-component", className: "row mb-1 p-3" });
        this.children = [
            {
                element: buildNode("div", { className: `col-12 rounded-lg p-2 bg-${question.category.color}` }),
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
                                                element: document.createTextNode(question.category.title),
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
                                        element: buildNode("a", { href: jokers.lookup && question.result === "unanswered" && !question.switch ? `https://google.com/search?q=${queryString}` : "", target: "_blank", rel: "noopener noreferrer", style: { color: "black" } }),
                                        children: [
                                            {
                                                element: buildNode("i", { id: "lookup", className: `bi bi-search fs-4 p-1 cursor ${jokers.lookup ? "joker-highlight" : "selected"}`, onclick: jokers.lookup && question.result === "unanswered" && !question.switch ? handler : null }),
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
                                        element: buildNode("i", { id: "switch", className: `bi bi-arrow-left-right fs-4 p-1 cursor ${jokers.switch ? "joker-highlight" : "selected"}`, onclick: jokers.switch && question.result === "unanswered" && !question.switch ? handler : null }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-2 d-flex align-items-center justify-content-end px-0 px-sm-2" }),
                                children: [
                                    {
                                        element: buildNode("strong", { id: "fifty", className: `border border-dark p-1 cursor fifty-fifty ${jokers.fifty ? "joker-highlight" : "selected"}`, onclick: jokers.fifty && question.result === "unanswered" && !question.switch ? handler : null }),
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
                        element: buildNode("p", { className: "lead", style: { userSelect: "none" } }),
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

        const handler = question.result === "unanswered" && !question.switch ? (event) => quiz.validate(event.target.textContent) : null;

        const answers = question.multipleChoice.map((answer, index) => {

            if (question.result === "correct" && answer === question.correctAnswer) {
                return new Answer({ answer, color: "correct", category: { color: undefined }, handler });
            }

            if (question.result === "wrong" && answer === question.userAnswer) {
                return new Answer({ answer, color: "wrong", category: { color: undefined }, handler });
            }

            if (question.result === "wrong" && answer === question.correctAnswer) {
                return new Answer({ answer, color: "actually-correct", category: { color: undefined }, handler });
            }

            if (question.fifty && (index === question.fifty.random1 || index === question.fifty.random2)) {
                return new Answer({ answer: null, color: null, category: null, handler: null });
            }

            if (question.switch && answer === question.correctAnswer) {
                return new Answer({ answer, color: "actually-correct", category: { color: undefined }, handler })
            }

            if (question.result !== "unanswered" || question.switch) {
                return new Answer({ answer, color: "white", category: { color: undefined }, handler })
            }

            return new Answer({ answer, color: "white", category: question.category, handler });

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
    constructor({ answer, color, category, handler }) {

        this.element = buildNode("div", { className: "col-md-6 px-3 px-md-2 answer-box" });
        this.children = [
            ...answer ?
                [{
                    element: buildNode("p", { className: `rounded-lg p-2 py-md-5 my-0 bg-answer-${color} border answer-highlight-${category.color}`, onclick: handler }),
                    children: [
                        {
                            element: document.createTextNode(answer),
                            children: null
                        }
                    ]
                }] : []
        ]
    }
}

class Controls {
    constructor({ result, gamestate }) {

        const text = gamestate.board[8] !== "unanswered" ? "View Results" : "Next Question";

        this.element = buildNode("div", { className: "row justify-content-center mt-3" });
        this.children = [
            new BackButton(),
            {
                element: buildNode("div", { className: "col-6 col-md-7 col-lg-8 col-xxl-7" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-end" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-0 col-sm" }),
                                children: null
                            },
                            //new BackButtonB(),
                            ...gamestate.board[8] !== "unanswered" ? [new AgainButton()] : [],
                            //new AgainButton(),
                            new NextButton({ result: result, text: text })
                        ]
                    }
                ]
            }
        ]
    }
}

class BackButtonB {
    constructor() {

        const handler = () => {
            quiz.reset();
            settings.reset();
            settings.ui.selectionMenuElement = new SelectionMenu();
        }

        this.element = buildNode("div", { className: "col-auto pe-0 ps-1 ps-sm-2" });
        this.children = [
            {
                element: buildNode("button", { className: "btn btn-outline-dark", onclick: handler }),
                children: [
                    {
                        element: buildNode("i", { className: "bi bi-arrow-left me-1" }),
                        children: null
                    },
                    {
                        element: buildNode("span"),
                        children: [
                            {
                                element: document.createTextNode("Categories"),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ];
    }
}

class BackButton {
    constructor() {

        const handler = () => {
            // clearInterval(quiz.timer.timeInterval);
            // settings.ui.selectionMenuElement = new SelectionMenu();
            quiz.reset();
            settings.reset();
            settings.ui.selectionMenuElement = new SelectionMenu();
        }

        this.element = buildNode("div", { className: "col-5 col-md-3 col-lg-2" });
        this.children = [
            {
                element: buildNode("div", { className: "row justify-content-end" }),
                children: [
                    {
                        element: buildNode("div", { className: "col-md-12 col-xl-10 col-xxl-9 px-0" }),
                        children: [
                            {
                                element: buildNode("button", { className: "btn btn-outline-dark", onclick: handler }),
                                children: [
                                    {
                                        element: buildNode("i", { className: "bi bi-arrow-left me-1" }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("span"),
                                        children: [
                                            {
                                                element: document.createTextNode("Categories"),
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
        ];
    }
}

class AgainButton {
    constructor() {

        const handler = () => {
            quiz.reset();
            settings.fetchQuestions();
        }

        this.element = buildNode("div", { className: "col-auto pe-0 ps-1 ps-sm-2" });
        this.children = [
            {
                element: buildNode("button", { className: "btn btn-outline-dark", onclick: handler }),
                children: [
                    {
                        element: buildNode("i", { className: "bi bi-arrow-repeat me-1" }),
                        children: null
                    },
                    {
                        element: buildNode("span"),
                        children: [
                            {
                                element: document.createTextNode("Play Again"),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ];
    }
}

class NextButton {
    constructor({ result, text }) {

        const handler = () => {
            if (text === "Next Question") {
                if (result === "unanswered") {
                    quiz.validate(null);
                    setTimeout(() => {
                        quiz.advance();
                    }, 1000);
                } else {
                    quiz.advance();
                }
            } else if (text === "View Results") {
                quiz.showResults();
            }

        }

        this.element = buildNode("div", { className: "col-auto pe-0 ps-1 ps-sm-2" });
        this.children = [
            {
                element: buildNode("button", { className: "btn btn-outline-dark", onclick: handler }),
                children: [
                    {
                        element: buildNode("span", { className: "span" }),
                        children: [
                            {
                                element: document.createTextNode(text),
                                children: null
                            },
                            {
                                element: buildNode("i", { className: "bi bi-arrow-right ms-1" }),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ];
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



const testQuestions = [{ "category": "Geography", "correctAnswer": "Africa", "id": 6696, "incorrectAnswers": ["South America", "Oceania", "Europe", "Asia", "North America"], "question": "Togo is located on which continent?", "type": "Multiple Choice" }, { "category": "Music", "correctAnswer": "Sudan", "id": 6549, "incorrectAnswers": ["South Sudan", "Egypt", "Republic of the Congo", "Equatorial Guinea", "Gabon", "Benin", "Democratic Republic of the Congo", "Eritrea", "Uganda", "Togo", "São Tomé and Príncipe", "Rwanda", "Tunisia", "Malta"], "question": "Which of these countries borders Chad?", "type": "Multiple Choice" }, { "category": "Arts & Literature", "correctAnswer": "Asia", "id": 22872, "incorrectAnswers": ["Europe", "Africa", "North America", "South America"], "question": "Which is the Earth's largest continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "South America", "id": 6683, "incorrectAnswers": ["Oceania", "Europe", "Asia", "Africa", "North America"], "question": "Suriname is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Spain", "id": 5713, "incorrectAnswers": ["Portugal", "Andorra", "Mali", "Tunisia", "France", "Monaco", "Senegal", "Burkina Faso", "Switzerland", "The Gambia", "Malta", "Ireland", "Italy", "Belgium", "Luxembourg", "Liechtenstein", "Niger"], "question": "Morocco shares a land border with which of these countries?", "type": "Multiple Choice" }, { "category": "History", "correctAnswer": "Tripoli", "id": 19272, "incorrectAnswers": ["Benghazi", "Tunis", "Alexandria"], "question": "What is the capital of Libya?", "type": "Multiple Choice" }, { "category": "History", "correctAnswer": "Europe", "id": 6685, "incorrectAnswers": ["South America", "Oceania", "Asia", "Africa", "North America"], "question": "Andorra is located on which continent?", "type": "Multiple Choice" }, { "category": "Arts & Literature", "correctAnswer": "East Timor", "id": 5609, "incorrectAnswers": ["Solomon Islands", "Vanuatu", "Palau", "Brunei", "Nauru", "Federated States of Micronesia", "Fiji", "Philippines", "Malaysia", "Singapore", "Tuvalu", "Kiribati", "Marshall Islands", "Cambodia", "Vietnam", "Thailand"], "question": "Which of these countries borders Australia?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Austria", "id": 19550, "incorrectAnswers": ["Croatia", "San Marino", "Bosnia and Herzegovina", "Romania", "Poland"], "question": "Which country borders Italy, Switzerland, Germany, Czech Republic, Hungary, Slovenia, and Liechtenstein?", "type": "Multiple Choice" }];


const testQuestionsB = [{ "category": "Science", "id": "622a1c3a7cc59eab6f95106f", "correctAnswer": "Dynamite", "incorrectAnswers": ["The combustion engine", "Plastic", "The printing press"], "question": "What Did Alfred Nobel Invent Before Initiating His Nobel Peace Prize Award Scheme?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950553", "correctAnswer": "the relationship between electric phenomena and bodily processes", "incorrectAnswers": ["animals", "the practice of escaping from restraints or other traps", "plant diseases"], "question": "What is Electrophysiology the study of?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950504", "correctAnswer": "the signification and application of words", "incorrectAnswers": ["statistics such as births, deaths, income, or the incidence of disease, which illustrate the changing structure of human populations", "crayfish", "butterflies and moths"], "question": "What is Lexicology the study of?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "unknown", "correctAnswer": "4", "incorrectAnswers": ["2", "3", "1"], "question": "How Many Chambers Are There In Your Heart?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c3a7cc59eab6f9510b3", "correctAnswer": "Jupiter", "incorrectAnswers": ["Venus", "Neptune", "Saturn"], "question": "Name the largest planet in the solar system.", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950559", "correctAnswer": "interactions among organisms and the water cycle", "incorrectAnswers": ["a variant of physiognomy", "the structure of cells", "the effect of evolution on ethology"], "question": "What is Ecohydrology the study of?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c3a7cc59eab6f950fd4", "correctAnswer": "Asbestos", "incorrectAnswers": ["Bleach", "Ethanol", "Methadone"], "question": "Which substance takes its name from the Greek for `not flammable'?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c3a7cc59eab6f950fd8", "correctAnswer": "Kidney", "incorrectAnswers": ["Liver", "Lung"], "question": "Which vital organ does the adjective renal refer to?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950544", "correctAnswer": "race", "incorrectAnswers": ["parasites", "in ethics, duty", "rocks"], "question": "What is Ethnology the study of?", "tags": [], "type": "Multiple Choice" }];

const testQuestionsScience = [
    {
        "category": "Science",
        "id": "622a1c397cc59eab6f950c2d",
        "correctAnswer": "ABBA",
        "incorrectAnswers": [
            "In Flames",
            "HammerFall",
            "Katatonia"
        ],
        "question": "Which Swedish pop group released the album 'The Visitors'?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "History",
        "id": "622a1c387cc59eab6f950bcc",
        "correctAnswer": "Alice in Chains",
        "incorrectAnswers": [
            "Poison",
            "Three 6 Mafia",
            "The Velvet Underground"
        ],
        "question": "Which American grunge band released the studio album 'Dirt'?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "General Knowledge",
        "id": "622a1c357cc59eab6f94fc86",
        "correctAnswer": "Erinaceous",
        "incorrectAnswers": [
            "Sprunt",
            "Whippersnapper",
            "Frankenfood"
        ],
        "question": "Which word is defined as 'of, pertaining to, or resembling a hedgehog'?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "General Knowledge",
        "id": "622a1c357cc59eab6f94fc58",
        "correctAnswer": "Whippersnapper",
        "incorrectAnswers": [
            "Salopettes",
            "Cabotage",
            "Bumfuzzle"
        ],
        "question": "Which word is defined as 'a young person considered to be presumptuous or overconfident'?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Music",
        "id": "622a1c347cc59eab6f94fb9f",
        "correctAnswer": "\"Hooked on a Feeling\" by B.J. Thomas",
        "incorrectAnswers": [
            "\"Immigrant Song\" by Led Zeppelin",
            "\"What I Got\" by Sublime",
            "\"American Pie\" by Don McLean"
        ],
        "question": "Which song begins with the lyrics: \"Ooga-chaka, Ooga-ooga / Ooga-chaka, Ooga-ooga...\"?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "General Knowledge",
        "id": "622a1c367cc59eab6f9500cc",
        "correctAnswer": "Surfing",
        "incorrectAnswers": [
            "Yoga",
            "Piano Playing",
            "Ballroom Dancing"
        ],
        "question": "Green Room, Crystal Cathedral & Walking The Dog are all terms from what?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Music",
        "id": "622a1c397cc59eab6f950bff",
        "correctAnswer": "Muse",
        "incorrectAnswers": [
            "Tears for Fears",
            "Bullet For My Valentine",
            "Enter Shikari"
        ],
        "question": "Which English rock band released the song 'Sunburn'?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Music",
        "id": "622a1c357cc59eab6f94fe8b",
        "correctAnswer": "Rihanna",
        "incorrectAnswers": [
            "Drake",
            "Nicki Minaj",
            "Ricky Martin"
        ],
        "question": "Which Barbadian singer, songwriter, and businesswoman released the song 'Russian Roulette'?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Music",
        "id": "622a1c397cc59eab6f950db6",
        "correctAnswer": "The Rolling Stones",
        "incorrectAnswers": [
            "McFly",
            "Delirious?",
            "Depeche Mode"
        ],
        "question": "Which band includes 'Keith Richards'?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Music",
        "id": "622a1c387cc59eab6f950b8a",
        "correctAnswer": "The Jimi Hendrix Experience",
        "incorrectAnswers": [
            "Poison",
            "The Pussycat Dolls",
            "Three 6 Mafia"
        ],
        "question": "Which English-American psychedelic rock band released the album 'Are You Experienced'?",
        "tags": [],
        "type": "Multiple Choice"
    }
]

//quiz.init(testQuestionsScience);

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

//const testQuestionsC = testQuestions.map((question) => new Question(question));
//const stats = new Stats({ questions: testQuestionsC, gamestate: { points: 132 } });

//depthFirstTraversalTest(document.querySelector("#main"), stats)