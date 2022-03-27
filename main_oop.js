class Settings {
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
        this.ui.selectionMenuElement = new SelectionMenu({ selected: this._categories, amount: this._amount });
    }

    selectAll() {
        if (this._categories.length !== Settings.allCategories.length) this._categories = Settings.allCategories.map((cat) => toUnderscore(cat));
        else this._categories = [];
        this.ui.selectionMenuElement = new SelectionMenu({ selected: this._categories, amount: this._amount });
    }

    selectRandom() {
        this._categories = [];
        const pool = Settings.allCategories.map(cat => toUnderscore(cat));
        const amount = Math.floor(Math.random() * (Settings.allCategories.length - 1) + 1);
        while (this._categories.length < amount) {
            this._categories.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
        }
        this.ui.selectionMenuElement = new SelectionMenu({ selected: this._categories, amount: this._amount });
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
            console.log(`${this._amount} questions / ${this._categories.length} categories. It took ${loops} loops`, amountPerCat);
            return amountPerCat;
        }
    }

    async fetchQuestions() {
        try {
            // const categories = this._categories;
            // const url = this.url(categories, this._amount + 1);
            // this.ui.spinnerElement = new Spinner();
            // let result = await fetch(url);
            // this.originalQuestions = await result.json();

            const amountPerCat = this.getAmountPerCategory();
            const categories = Object.keys(amountPerCat);
            const shortestCat = categories.find((cat) => amountPerCat[cat] === Math.min(...categories.map((cat) => amountPerCat[cat])));
            amountPerCat[shortestCat] += 1;
            const urls = categories.filter((cat) => amountPerCat[cat] !== 0).map((cat) => {
                return this.url(cat, amountPerCat[cat]);
            })
            console.log(amountPerCat);
            console.log(urls);
            this.originalQuestions = [];
            this.ui.spinnerElement = new Spinner();

            for (let url of urls) {
                const result = await fetch(url);
                this.originalQuestions.push(...await result.json());
                console.log("Fetch request has been made");
            }

            const duplicates = this.findDuplicates();
            if (duplicates.length) {
                console.log(`Found ${duplicates.length} duplicate(s)`);

                for (let dup of duplicates) {
                    const index = this.originalQuestions.findIndex((question) => question.question === dup);
                    const category = toUnderscore(this.originalQuestions[index].category);
                    const result = await fetch(this.url(category, 1));
                    const newQuestion = await result.json();
                    this.originalQuestions.splice(index, 1, newQuestion[0]);
                    console.log(`Exchanged duplicate at index ${index} with a new question from category ${category}`);
                }

            }
            shuffleArray(this.originalQuestions);
            quiz.init(this.originalQuestions);
        } catch (error) {
            console.log(error.message);
        }

    }

}

class UIForSettings {
    constructor(selected, amount) {
        this.mainElement = document.querySelector("#main");
        this._selectionMenuElement = new SelectionMenu({ selected, amount });
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

    // get selectionMenuElement() {
    //     return this._selectionMenuElement;
    // }

    // toggleSelection(element, category) {
    //     if (element.classList.contains("category-highlight")) {
    //         element.classList.add("selected");
    //         element.classList.remove("category-highlight");
    //         settings.categories = category;
    //     } else if (element.classList.contains("selected")) {
    //         element.classList.remove("selected");
    //         element.classList.add("category-highlight");
    //         settings.categories = category;      
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

class UIForStats {
    constructor() {
        this.mainElement = document.querySelector("#main");
        this.statsElement = new StatsComponent({ stats: this.stats, questions, discarded });
        this.categoriesTable = {};

        this.render(this.mainElement, this.statsElement);
    }
    render(rootNode, startingNode) {

        rootNode.append(startingNode.element);

        if (startingNode.children) {
            startingNode.children.forEach((child) => {
                this.render(rootNode.lastElementChild, child);
            })

        }

    }
}

class Stats {
    init(questions, gamestate, discarded) {
        this.calculate(questions, gamestate);
        this.ui = new StatsComponent({ stats: this.stats, questions, discarded, colors: this.colors });
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
        //const categories = questions.map(question => question.category.title).filter((category, index, arr) => arr.indexOf(category) === index);
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
        const catUnused = settings.categories.map(cat => {
            let category = cat
                .replace("and", "&")
                .replace(/_/g, " ")
                .replace(/(?<=\s)[a-z]|^[a-z]/g, (match) => match.toUpperCase());
            if (category === "Movies") category = "Film & TV";
            if (category === "Literature") category = "Arts & Literature";
            return category;
        }).filter(category => !categories.find(cat => cat.category === category));

        this.stats = {
            general: { amountTotal, amountCorrect, percentCorrect, points: gamestate.points, emoji, categories },
            time: { timeTotal, timeAverage, fastestCorrect },
            jokers: gamestate.jokers,
            categories: { cat: categories, catUnused }
        };

        this.colors = colors;
    }
}

class StatsComponent {
    constructor({ stats: { general, time, jokers, categories }, questions, discarded, colors }) {
        this.parent = document.getElementById("main");
        this.element = buildNode("div", { id: "stats-element", className: "container" });
        this.children = [
            {
                element: buildNode("div", { className: "row justify-content-center" }),
                children: [
                    new StatsBox({ title: "General", stats: general, colors }),
                    new StatsBox({ title: "Time", stats: time, colors }),
                    new StatsBox({ title: "Jokers", stats: jokers, colors }),
                    ...categories.cat.length > 1 ? [new Modal({ id: "categories-modal", title: "Categories", body: new CategoriesTable({ categories: categories.cat, unused: categories.catUnused }), size: "xl", contentID: "categories-table", colors })] : [],
                    new ControlsB(),
                    new Overview({ questions, discarded }),
                    new ControlsB()
                ]
            }
        ]
    }

    render() {
        this.parent.innerHTML = "";
        compileDOMTree(this.parent, this);
    }

}

class StatsBox {
    constructor({ title, stats, colors }) {

        const headingColors = (title) => {
            if (title === "Categories") return shuffleArray(colors);
            if (colors.length >= 4) {
                if (colors.length <= 5) {
                    if (title === "General") return colors.slice(2);
                    if (title === "Time") return colors.slice(0, 2);
                    if (title === "Jokers") return colors.length === 4 ? colors.slice(1, 3) : colors.slice(1, 4)
                }
                if (colors.length <= 7) {
                    if (title === "General") return colors.slice(0, 2);
                    if (title === "Time") return colors.length === 6 ? colors.slice(2, 4) : colors.slice(2, 5);
                    if (title === "Jokers") return colors.length === 6 ? colors.slice(4) : colors.slice(5);
                }
                if (colors.length <= 9) {
                    if (title === "General") return colors.slice(0, 3);
                    if (title === "Time") return colors.length === 8 ? colors.slice(3, 5) : colors.slice(3, 6);
                    if (title === "Jokers") return colors.length === 8 ? colors.slice(5) : colors.slice(6);
                }
            } else {
                return shuffleArray(colors);
            }
        };

        const props = { className: "fw-bold" };

        this.element = buildNode("div", { className: "col-auto mt-5" });
        this.children = [
            {
                element: buildNode("div", { className: "card p-3 bg-light rounded-lg", style: { minWidth: "300px" } }),
                children: [
                    {
                        element: buildNode("div", { className: `card-header rounded-lg${colors.length === 1 ? ` bg-${colors}` : ""}`, style: { backgroundImage: colors.length > 1 ? `linear-gradient(to right, ${headingColors(title).map(color => hexColors[color])})` : "" } }),
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
                            ...title === "General" ? [new Table({
                                tableBody: [
                                    [{ data: "Questions" }, { data: stats.amountTotal, props }],
                                    [
                                        { data: "Categories" },
                                        {
                                            data: stats.categories.length === 1 ? stats.categories[0].category : [
                                                {
                                                    element: buildNode("span", { textContent: stats.categories.length }),
                                                    children: null
                                                },
                                                {
                                                    element: buildNode("i", { className: "bi bi-arrows-angle-expand cursor", style: { position: "absolute", right: "0" }, dataset: { bsToggle: "modal", bsTarget: "#categories-modal" } }),
                                                    children: null
                                                }
                                            ],
                                            props: stats.categories.length === 1 ? props : { style: { position: "relative" }, className: props.className }
                                        }
                                    ],
                                    [{ data: "Correct" }, { data: `${stats.amountCorrect} of ${stats.amountTotal} = ${stats.percentCorrect}%`, props }],
                                    [
                                        { data: "Score" },
                                        {
                                            data: [
                                                {
                                                    element: buildNode("span", { textContent: stats.points === 0 ? "0" : stats.points }),
                                                    children: null
                                                },
                                                {
                                                    element: buildNode("i", { className: `${stats.emoji} ms-2` }),
                                                    children: null
                                                }
                                            ],
                                            props
                                        }
                                    ]                                 
                                ]
                            })] : [],
                            ...title === "Time" ? [new Table({
                                tableBody: [
                                    [{ data: "Time (total)" }, { data: stats.timeTotal, props }],
                                    [{ data: "⌀ time per answer" }, { data: stats.timeAverage, props }],
                                    [{ data: "Fastest correct answer" }, { data: stats.fastestCorrect, props }]
                                    // [{ data: "Slowest answer" }, { data: `${slowest} (${questions.find(qn => qn.time === slowest * 1000).result})`, props }]
                                ]
                            })] : [],
                            ...title === "Jokers" ? [new Table({
                                tableBody: [
                                    [{ data: new FiftyIcon({ className: "small-font" }) }, { data: stats.fifty ? "No" : "Yes", props }],
                                    [{ data: new SwitchIcon({}) }, { data: stats.switch ? "No" : "Yes", props }],
                                    [{ data: new LookupIcon({}) }, { data: stats.lookup ? "No" : "Yes", props }]
                                ]
                            })] : []
                        ]
                    }
                ]
            }
        ]
    }
}

// className parameter not needed atm, but we'll see
class Modal {
    constructor({ id, title, body, className, size, colors, centered, contentID }) {
        this.element = buildNode("div", { className: `modal fade${className ? ` ${className}` : ""}`, id: id, tabIndex: -1, });
        this.children = [
            {
                element: buildNode("div", { className: `modal-dialog${size ? ` modal-${size}` : ""}${centered ? " modal-dialog-centered" : ""}` }),
                children: [
                    {
                        element: buildNode("div", { className: "modal-content rounded-lg" }),
                        children: [
                            {
                                element: buildNode("div", { className: "modal-header border-0" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: `rounded-lg d-flex align-items-center w-100 bg-dark${colors ? "" : " text-light"}`, style: { backgroundImage: colors && colors.length > 1 ? `linear-gradient(to right, ${colors.map(color => hexColors[color])})` : "", padding: "12px" } }),
                                        children: [
                                            {
                                                element: buildNode("h5", { className: "modal-title", textContent: title }),
                                                children: null
                                            },
                                            {
                                                element: buildNode("button", { className: `btn-close${colors ? "" : " btn-close-white"}`, type: "button", dataset: { bsDismiss: "modal" } }),
                                                children: null
                                            }
                                        ]
                                    }                                  
                                ]
                            },
                            {
                                element: buildNode("div", { className: "modal-body" }),
                                children: [
                                    {
                                        element: buildNode("div", { id: contentID ? contentID : "", className: "container-fluid" }),
                                        children: [
                                            ...typeof body === "object" && !Array.isArray(body) ? [body] : [],
                                            ...Array.isArray(body) ? [...body] : []
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "modal-footer border-0" }),
                                children: [
                                    {
                                        element: buildNode("button", { type: "button", className: "btn btn-outline-dark", dataset: { bsDismiss: "modal" }, textContent: "Close" }),
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

class CategoriesTable {
    constructor({ categories, unused, index, chevron }) {
        
        const sortCategories = (e) => {
            const column = e.target.previousElementSibling.textContent;
            const sortUp = e.target.classList.contains("bi-chevron-up") || e.target.classList.contains("bi-chevron-expand");
            const chevron = sortUp ? "down" : "up";
            let index;
            if (column === "Category") {
                sortUp ? categories.sort((a, b) => a.category < b.category ? -1 : 1) : categories.sort((a, b) => a.category > b.category ? -1 : 1);
                index = 0;
            } else if (column === "Questions") {
                sortUp ? categories.sort((a, b) => b.amount - a.amount) : categories.sort((a, b) => a.amount - b.amount);
                index = 1;
            } else if (column === "Questions (%)") {
                sortUp ? categories.sort((a, b) => b.percent - a.percent) : categories.sort((a, b) => a.percent - b.percent);
                index = 2;
            } else if (column === "Correct") {
                sortUp ? categories.sort((a, b) => b.correct - a.correct) : categories.sort((a, b) => a.correct - b.correct);
                index = 3;
            } else if (column === "Correct (%)") {
                sortUp ? categories.sort((a, b) => b.correctPercent - a.correctPercent) : categories.sort((a, b) => a.correctPercent - b.correctPercent);
                index = 4;
            } else if (column === "Time per answer ⌀") {
                sortUp ? categories.sort((a, b) => a.averageTime - b.averageTime) : categories.sort((a, b) => b.averageTime - a.averageTime);
                index = 5;
            } else if (column === "Points ⌀") {
                sortUp ? categories.sort((a, b) => b.points - a.points) : categories.sort((a, b) => a.points - b.points);
                index = 6;
            }
            new CategoriesTable({ categories, unused, index, chevron }).render();
        }

        return new Table({
            tableHead: ["Category", "Questions", "Questions (%)", "Correct", "Correct (%)", "Time per answer ⌀", "Points ⌀"].map((header, i) => {
                return {
                    data: [
                        {
                            element: buildNode("span", { textContent: header }),
                            children: null
                        },
                        {
                            element: buildNode("i", { className: `bi bi-chevron-${i === index ? chevron : "expand"} cursor small-font align-top ms-2`, onclick: sortCategories }),
                            children: null
                        }
                    ],
                    props: { className: "fw-bold" }
                }
            }),
            tableBody: [
                ...categories.map((cat) => {
                    return [
                        { data: cat.category },
                        { data: cat.amount },
                        { data: `${cat.percent}%` },
                        { data: cat.correct },
                        { data: `${cat.correctPercent}%` },
                        { data: cat.averageTime },
                        { data: cat.points }
                    ]
                })
            ],
            tableFoot: unused ? [
                ...unused.map((cat) => {
                    return [
                        { data: cat }
                    ]
                })
            ] : null
        });
    }
}

class FiftyIcon {
    constructor({ className, style }) {
        this.element = buildNode("span", { className: "border border-dark p-1 no-select", textContent: "50:50" });
        this.children = null;

        if (className) this.element.className += " " + className;
        if (style) Object.keys(style).forEach(styleProp => this.element.style[styleProp] = style[styleProp]);
    }
}

class SwitchIcon {
    constructor({ className, style }) {
        this.element = buildNode("i", { className: "bi bi-arrow-left-right" });
        this.children = null;

        if (className) this.element.className += " " + className;
        if (style) Object.keys(style).forEach(styleProp => this.element.style[styleProp] = style[styleProp]);
    }
}

class LookupIcon {
    constructor({ className, style }) {
        this.element = buildNode("i", { className: "bi bi-search" });
        this.children = null;

        if (className) this.element.className += " " + className;
        if (style) Object.keys(style).forEach(styleProp => this.element.style[styleProp] = style[styleProp]);
    }
}

class Overview {
    constructor({ questions, discarded }) {

        const joker = (question) => {
            return {
                element: buildNode("div", { style: { position: "absolute", bottom: "5px", right: "15px" } }),
                children: [
                    ...question.lookup ? [new LookupIcon({ className: "fs-5 mx-2" })] : [],
                    ...question.switched ? [new SwitchIcon({ className: "fs-5 mx-2" })] : [],
                    ...question.fifty ? [new FiftyIcon({ className: "mx-2 small-font" })] : [],
                    ...question.switch ? [{ element: buildNode("i", { className: "bi bi-trash fs-5" }) }] : []
                ]
            }
        }

        const row = (question, index) => {
            return [
                { data: index, props: { className: `bg-${question.category.color} text-center` } },
                { data: [{ element: buildNode("span", { textContent: question.question }) }, ...question.lookup || question.fifty || question.switched || question.switch ? [joker(question)] : []], props: { style: { position: "relative", minWidth: "200px" } } },
                { data: [new AnswersList({ question })], props: { style: { minWidth: "250px" } } },
                { data: question.time / 1000 },
                { data: question.points === 0 ? "-" : question.points },
                { data: question.category.title }
            ];
        }

        const tableHead = ["No", "Question", "Your Answer", "Seconds", "Points", "Category"].map((header) => {
            return { data: header, props: { style: { fontWeight: "bold" } } };
        })

        const tableBody = questions.map((question, index) => {
            return row(question, index + 1);
        })

        const tableFoot = discarded ? [row(discarded, "-")] : null;

        this.element = buildNode("div", { className: "row justify-content-center mt-5" });
        this.children = [
            {
                element: buildNode("div", { className: "col-11 col-md-10 col-xxl-9" }),
                children: [
                    new Table({ tableHead, tableBody, tableFoot })
                ]
            }
        ];
    }
}

class AnswersList {
    constructor({ question }) {

        const ListElement = (answer, index) => {
            let color;
            if (answer === question.correctAnswer) color = "green";
            else if (question.result === "wrong" && answer === question.userAnswer) color = "darkred";
            else if (question.fifty) {
                if (index === question.fifty.random1 || index === question.fifty.random2) color = "darkgrey";
            }
            else color = "";

            return {
                element: buildNode("li", { className: "list-group-item", style: { color }, textContent: answer }),
                children: null
            };
        }

        const listElements = question.multipleChoice.map((answer, index) => {
            return ListElement(answer, index);
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
            settings.ui.selectionMenuElement = new SelectionMenu({ selected: settings.categories, amount: settings.amount });
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

class Table {
    constructor({ tableHead, tableBody, tableFoot }) {

        const tableRows = tableBody.map((row) => {
            return new TableRow({ row });
        })

        this.parent = document.getElementById("categories-table");
        this.element = buildNode("div", { className: "table-responsive" });
        this.children = [
            {
                element: buildNode("table", { className: "table" }),
                children: [
                    ...tableHead ? [
                        {
                            element: buildNode("thead"),
                            children: [
                                new TableRow({ row: tableHead })
                            ]
                        }
                    ] : [],
                    {
                        element: buildNode("tbody"),
                        children: [
                            ...tableRows
                        ]
                    },
                    ...tableFoot ? [
                        {
                            element: buildNode("tbody", { className: "opacity-50" }),
                            children: [
                                ...tableFoot.map((row) => new TableRow({ row }))
                            ]
                        }
                    ] : []
                ]
            }
        ];
    }
    render() {
        this.parent.innerHTML = "";
        compileDOMTree(this.parent, this);
    }
}

class TableRow {
    constructor({ row }) {

        const tableCells = row.map((cell) => {
            return new DataCell({ data: cell.data, props: cell.props ? cell.props : null });
        })

        this.element = buildNode("tr");
        this.children = [
            ...tableCells
        ]
    }
}

class DataCell {
    constructor({ data, props }) {
        this.element = buildNode("td", props);
        this.children = [
            ...data !== Object(data) ? [{ element: document.createTextNode(`${data}`), children: null }] : [],
            ...typeof data === "object" && !Array.isArray(data) ? [data] : [],
            ...Array.isArray(data) ? [...data] : []
        ]
    }
}

class SelectionMenu {
    constructor({ selected, amount }) {
        this.element = buildNode("div", { id: "selection-menu", className: "container" });
        this.children = [
            new Welcome(),
            new Categories({ selected }),
            //new SettingsModal({ amount }),
            new Modal({ id: "advanced-settings-modal", title: "How Many Questions?", body: new AdvancedSettings({ amount }), centered: true }),
            new StartButton()
        ];
    }
}

class Welcome {
    constructor() {
        this.element = buildNode("div", { className: "row mb-4 mt-5 justify-content-center" });
        this.children = [
            {
                element: buildNode("div", { className: "col-12" }),
                children: [
                    {
                        element: buildNode("p", { className: "text-center lead" }),
                        children: [
                            {
                                element: buildNode("strong"),
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
        ]
    }
}

class Categories {
    constructor({ selected }) {

        // const handler = (event) => {
        //     if (!event.target.classList.contains("col-8") && !event.target.classList.contains("row")) {
        //         const elements = event.composedPath();
        //         const targetElement = elements.find(element => element.classList && element.classList.contains("category"));
        //         const category = targetElement ? targetElement.firstElementChild.lastElementChild.innerText : null;
        //         settings.toggleSelection(targetElement, category);
        //     }
        // }

        const categories = Settings.allCategories.map((category) => {
            return new Category({ category, selected: selected.includes(toUnderscore(category)) })
        });

        this.element = buildNode("div", { id: "category-selection", className: "row mt-3 justify-content-center" });
        this.children = [
            {
                element: buildNode("div", { className: "col-md-9 col-xl-8 col-xxl-7" }),
                children: [
                    new ParamsButtons(),
                    {
                        element: buildNode("div", { className: "row justify-content-center gy-4" }),
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
    constructor({ category, selected }) {

        const handler = (e) => {
            const category = e.currentTarget.firstElementChild.lastElementChild.textContent;
            settings.toggleSelection(category);
        }

        const cat = toUnderscore(category);

        this.element = buildNode("div", { className: "col-8 col-sm-6 col-lg-4" });
        this.children = [
            {
                element: buildNode("div", { id: `category-${cat}`, className: `card rounded-lg cursor bg-${cat}${selected ? " selected" : " category-highlight"}`, onclick: handler }),
                children: [
                    {
                        element: buildNode("div", { className: "card-body text-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "h1 mb-3" }),
                                children: [
                                    {
                                        element: buildNode("img", { src: `images/${cat}.svg`, alt: category, className: "w-50" }),
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

class ParamsButtons {
    constructor() {
        const selectAll = () => {
            settings.selectAll();
        }

        const selectRandom = () => {
            settings.selectRandom();
        }

        const fill = (e) => { 
            e.target.className += "-fill";
        }

        const unfill = (e) => {
            e.target.className = e.target.className.slice(0, -5);
        }

        this.element = buildNode("div", { className: "row justify-content-end py-2" });
        this.children = [
            {
                element: buildNode("div", { className: "col-auto" }),
                children: [
                    {
                        element: buildNode("i", { className: "bi bi-shuffle fs-4 cursor", onclick: () => settings.selectRandom() }),
                        children: null
                    }
                ]
            },
            {
                element: buildNode("div", { className: "col-auto" }),
                children: [
                    {
                        element: buildNode("i", { className: "bi bi-check2-all fs-4 cursor", onclick: () => settings.selectAll() }),
                        children: null
                    }
                ]
            },
            {
                element: buildNode("div", { className: "col-auto" }),
                children: [
                    {
                        element: buildNode("span"),
                        children: [
                            {
                                element: buildNode("i", { className: "bi fs-4 cursor bi-gear", dataset: { bsToggle: "modal", bsTarget: "#advanced-settings-modal" }, onmouseover: fill, onmouseout: unfill }),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

class SettingsModal {
    constructor({ amount }) {

        const handler = (e) => {
            e.target.previousElementSibling.textContent = `${e.target.value} Questions`;
            settings.amount = parseInt(e.target.value);
        }

        this.element = buildNode("div", { className: "modal fade", id: "quiz-settings", tabIndex: -1, });
        this.children = [
            {
                element: buildNode("div", { className: "modal-dialog" }),
                children: [
                    {
                        element: buildNode("div", { className: "modal-content" }),
                        children: [
                            {
                                element: buildNode("div", { className: "modal-header" }),
                                children: [
                                    {
                                        element: buildNode("h5", { className: "modal-title", textContent: "How many Questions?" }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("button", { className: "btn-close", type: "button", dataset: { bsDismiss: "modal" } }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "modal-body" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "container-fluid" }),
                                        children: [
                                            {
                                                element: buildNode("label", { htmlFor: "amount", className: "form-label", textContent: `${amount} Questions` }),
                                                children: null
                                            },
                                            {
                                                element: buildNode("input", { type: "range", className: "form-range", id: "amount", min: "6", max: "20", value: amount, oninput: handler }),
                                                children: null
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "modal-footer" }),
                                children: [
                                    {
                                        element: buildNode("button", { type: "button", className: "btn btn-outline-dark", dataset: { bsDismiss: "modal" }, textContent: "Close" }),
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

class AdvancedSettings {
    constructor({ amount }) {

        const handler = (e) => {
            e.target.previousElementSibling.textContent = `${e.target.value} Questions`;
            settings.amount = parseInt(e.target.value);
        }
        
        this.element = buildNode("div", { id: "amount-range" });
        this.children = [
            {
                element: buildNode("label", { htmlFor: "amount", className: "form-label", textContent: `${amount} Questions` }),
                children: null
            },
            {
                element: buildNode("input", { type: "range", className: "form-range", id: "amount", min: "6", max: "20", value: amount, oninput: handler }),
                children: null
            }
        ];
    }
}

// class Switch {
//     constructor({ type }) {

//         const handler = (e) => {
//             if (e.target.checked === true) {
//                 if (e.target.parentElement.nextElementSibling) {
//                     e.target.parentElement.nextElementSibling.firstElementChild.checked = false;
//                 } else {
//                     e.target.parentElement.previousElementSibling.firstElementChild.checked = false;
//                 }
//             }
//         }

//         this.element = buildNode("div", { className: "form-check form-check-inline form-switch" });
//         this.children = [
//             {
//                 element: buildNode("input", { className: "form-check-input", type: "checkbox", id: type.toLowerCase(), oninput: handler }),
//                 children: null
//             },
//             {
//                 element: buildNode("label", { htmlFor: type.toLowerCase(), className: "form-check-label no-select", textContent: type }),
//                 children: null
//             }
//         ]
//     }
// }

class StartButton {
    constructor() {

        const handler = () => {
            if (settings.categories.length) {
                settings.fetchQuestions();
                //quiz.init(testQuestions);
            }
        }

        this.element = buildNode("div", { className: "row justify-content-center mt-3" });
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

class Spinner {
    constructor() {
        this.element = buildNode("div", { className: "flex-grow-1 d-flex justify-content-center align-items-center" });
        this.children = [
            {
                element: buildNode("div", { className: "spinner-border", style: { width: "3rem", height: "3rem" } }),
                children: [
                    {
                        element: buildNode("span", { className: "visually-hidden", textContent: "Loading..." }),
                        children: null
                    }
                ]
            }
        ]
    }
}



// Question Class: Represents a Question

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
        this._quizElement = new QuizComponent({ question, gamestate, timer });
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
        document.querySelector("#timer-container").innerHTML = "";
        this.render(document.querySelector("#timer-container"), this._timeElement);
    }

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
        this._discardedQuestion;
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
        if (this._questions[this._gamestate.answered]) {
            this.resetTimer();
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
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

    // Highly preliminary. It is to be considered if there should be one more controlling Stats Object next to Settings and Quiz, where the calculations of 
    // stats take place and which passes them to the stats component. Or the UI Objects for Quiz and Settings need to be incorporated by the components, that
    // would be responsible for their own rendering then
    showResults() {
        // document.querySelector("#main").innerHTML = "";
        // this.ui.render(document.querySelector("#main"), new StatsComponent({ questions: this._questions, gamestate: this._gamestate, discarded: this._discardedQuestion }));

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
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
        } else if (joker === "time" && this._gamestate.jokers.time) {
            this.resetTimer();
            this._questions[this._gamestate.answered].time = true;
            this._gamestate.jokers.time = false;
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            this.startTimer();
        } else if (joker === "switch" && this._gamestate.jokers.switch) {
            clearInterval(this.timer.timeInterval);
            this._questions[this._gamestate.answered].time = Date.now() - this.timer.start;
            this._gamestate.jokers.switch = false;
            this._questions[this._gamestate.answered].switch = true;
            this.ui.quizElement = new QuizComponent({ question: this._questions[this._gamestate.answered], gamestate: this._gamestate, timer: this.timer });
            setTimeout(() => {
                this._discardedQuestion = this._questions[this._gamestate.answered];
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

function toUnderscore(cat) {
    if (cat === "Film & TV") cat = "movies";
    if (cat === "Arts & Literature") cat = "literature";
    return cat.toLowerCase().replace(/\s/g, "_").replace(/&/g, "and");
}

function capitalize(cat) {
    let category = cat
        .replace("and", "&")
        .replace(/_/g, " ")
        .replace(/(?<=\s)[a-z]|^[a-z]/g, (match) => match.toUpperCase());
    if (category === "Movies") category = "Film & TV";
    if (category === "Literature") category = "Arts & Literature";
    return category;
}

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

// ???
function buildComponent(Component, props) {
    const component = new Component();
    if (props) {
        if (props.className) {
            component.element.className += " " + props.className;
        }
        if (props.style) {
            Object.keys(props.style).forEach((styleProp) => {
                component.element.style[styleProp] = props.style[styleProp];
            })
        }
    }
    return component;
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function compileDOMTree(rootNode, startingNode) {

    rootNode.append(startingNode.element);

    if (startingNode.children) {
        startingNode.children.forEach((child) => {
            compileDOMTree(rootNode.lastElementChild, child);
        })

    }

}

const hexColors = { "science": "#03FCBA", "history": "#FFF75C", "geography": "#D47AE8", "movies": "#EA3452", "literature": "#71FEFA", "music": "#FFA552", "sport_and_leisure": "#D2FF96", "general_knowledge": "#C4AF9A", "society_and_culture": "#FF579F" };

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
                            element: buildNode("div", { id: "quizbox-component", className: "col-11 col-md-8 col-xxl-7 mt-5 d-flex flex-column" }),
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
        this.element = buildNode("div", { id: "info-rail-component", className: "col-md-2 d-flex me-2 mt-5" });
        this.children = [
            {
                element: buildNode("div", { className: "row justify-content-end" }),
                children: [
                    {
                        element: buildNode("div", { className: "d-none d-md-block col-md-12 col-xl-10 col-xxl-9 bg-light rounded-lg" }),
                        children: [
                            new InfoHeader({ category: question.category, answered: gamestate.answered, total: gamestate.board.length }),
                            new Timer({ category: question.category, timer, amount: gamestate.board.length }),
                            new Score({ points: gamestate.points, board: gamestate.board })
                        ]
                    }
                ]
            }
        ]
    }
}


class InfoHeader {
    constructor({ category, answered, total }) {
        this.element = buildNode("div", { className: "row p-3" });
        this.children = [
            {
                element: buildNode("div", { className: `col rounded-lg p-2 bg-${category.color}` }),
                children: [
                    {
                        element: buildNode("p", { className: "px-0 my-2 text-center" }),
                        children: [
                            {
                                element: document.createTextNode(`${answered + 1} / ${total}`),
                                children: null
                            }
                        ]
                    },
                    // {
                    //     element: buildNode("p", { className: "px-0 my-2 text-center small-font d-lg-none", textContent: `${answered + 1} of ${total}` })
                    // }
                ]
            }
        ]
    }
}

class Timer {
    constructor({ category, timer, amount }) {

        this.element = buildNode("div", { id: "timer-component", className: `row ${amount <= 12 ? "py-3" : "pb-3 pt-2"}` });
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

        const boardFields = board.map((field, i, arr) => {
            return new BoardField({ field, length: arr.length });
        });

        this.element = buildNode("div", { id: "score-component", className: `row mb-1 py-3 px-lg-${board.length <= 12 ? "4" : "3"} px-md-2 text-center` });
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
                        element: buildNode("h3", { className: "py-3 mb-0" }),
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
    constructor({ field, length }) {

        const icon = (value) => {
            switch (value) {
                case "unanswered":
                    return "circle";
                case "correct":
                    return "check-circle";
                case "wrong":
                    return "x-circle";
            }
        }

        this.element = buildNode("div", { className: length < 13 ? "col-4 px-0" : "col-3 px-0" });
        this.children = [
            {
                element: buildNode("i", { className: `bi bi-${icon(field)}-fill board-${field} fs-${length <= 12 ? "3" : "4"}` }),
                children: null
            }
        ]
    }
}

class QuestionComponent {
    constructor({ question, jokers }) {
        this.element = buildNode("div", { id: "question-component", className: "row flex-grow-1" });
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

        this.element = buildNode("div", { id: "question-header-component", className: "row p-3" });
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
                                        element: buildNode("p", { className: "my-2" }),
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

        const text = gamestate.board[gamestate.board.length - 1] !== "unanswered" ? "View Results" : "Next Question";

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
                            ...gamestate.board[gamestate.board.length - 1] !== "unanswered" ? [new AgainButton()] : [],
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
            settings.ui.selectionMenuElement = new SelectionMenu({ selected: settings.categories, amount: settings.amount });
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
            settings.ui.selectionMenuElement = new SelectionMenu({ selected: settings.categories, amount: settings.amount });
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
const stats = new Stats();
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






const testQuestionsA = [{ "category": "Geography", "correctAnswer": "Africa", "id": 6696, "incorrectAnswers": ["South America", "Oceania", "Europe", "Asia", "North America"], "question": "Togo is located on which continent?", "type": "Multiple Choice" }, { "category": "Music", "correctAnswer": "Sudan", "id": 6549, "incorrectAnswers": ["South Sudan", "Egypt", "Republic of the Congo", "Equatorial Guinea", "Gabon", "Benin", "Democratic Republic of the Congo", "Eritrea", "Uganda", "Togo", "São Tomé and Príncipe", "Rwanda", "Tunisia", "Malta"], "question": "Which of these countries borders Chad?", "type": "Multiple Choice" }, { "category": "Arts & Literature", "correctAnswer": "Asia", "id": 22872, "incorrectAnswers": ["Europe", "Africa", "North America", "South America"], "question": "Which is the Earth's largest continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "South America", "id": 6683, "incorrectAnswers": ["Oceania", "Europe", "Asia", "Africa", "North America"], "question": "Suriname is located on which continent?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Spain", "id": 5713, "incorrectAnswers": ["Portugal", "Andorra", "Mali", "Tunisia", "France", "Monaco", "Senegal", "Burkina Faso", "Switzerland", "The Gambia", "Malta", "Ireland", "Italy", "Belgium", "Luxembourg", "Liechtenstein", "Niger"], "question": "Morocco shares a land border with which of these countries?", "type": "Multiple Choice" }, { "category": "History", "correctAnswer": "Tripoli", "id": 19272, "incorrectAnswers": ["Benghazi", "Tunis", "Alexandria"], "question": "What is the capital of Libya?", "type": "Multiple Choice" }, { "category": "History", "correctAnswer": "Europe", "id": 6685, "incorrectAnswers": ["South America", "Oceania", "Asia", "Africa", "North America"], "question": "Andorra is located on which continent?", "type": "Multiple Choice" }, { "category": "Arts & Literature", "correctAnswer": "East Timor", "id": 5609, "incorrectAnswers": ["Solomon Islands", "Vanuatu", "Palau", "Brunei", "Nauru", "Federated States of Micronesia", "Fiji", "Philippines", "Malaysia", "Singapore", "Tuvalu", "Kiribati", "Marshall Islands", "Cambodia", "Vietnam", "Thailand"], "question": "Which of these countries borders Australia?", "type": "Multiple Choice" }, { "category": "Geography", "correctAnswer": "Austria", "id": 19550, "incorrectAnswers": ["Croatia", "San Marino", "Bosnia and Herzegovina", "Romania", "Poland"], "question": "Which country borders Italy, Switzerland, Germany, Czech Republic, Hungary, Slovenia, and Liechtenstein?", "type": "Multiple Choice" }];


const testQuestionsB = [{ "category": "Science", "id": "622a1c3a7cc59eab6f95106f", "correctAnswer": "Dynamite", "incorrectAnswers": ["The combustion engine", "Plastic", "The printing press"], "question": "What Did Alfred Nobel Invent Before Initiating His Nobel Peace Prize Award Scheme?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950553", "correctAnswer": "the relationship between electric phenomena and bodily processes", "incorrectAnswers": ["animals", "the practice of escaping from restraints or other traps", "plant diseases"], "question": "What is Electrophysiology the study of?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950504", "correctAnswer": "the signification and application of words", "incorrectAnswers": ["statistics such as births, deaths, income, or the incidence of disease, which illustrate the changing structure of human populations", "crayfish", "butterflies and moths"], "question": "What is Lexicology the study of?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "unknown", "correctAnswer": "4", "incorrectAnswers": ["2", "3", "1"], "question": "How Many Chambers Are There In Your Heart?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c3a7cc59eab6f9510b3", "correctAnswer": "Jupiter", "incorrectAnswers": ["Venus", "Neptune", "Saturn"], "question": "Name the largest planet in the solar system.", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950559", "correctAnswer": "interactions among organisms and the water cycle", "incorrectAnswers": ["a variant of physiognomy", "the structure of cells", "the effect of evolution on ethology"], "question": "What is Ecohydrology the study of?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c3a7cc59eab6f950fd4", "correctAnswer": "Asbestos", "incorrectAnswers": ["Bleach", "Ethanol", "Methadone"], "question": "Which substance takes its name from the Greek for `not flammable'?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c3a7cc59eab6f950fd8", "correctAnswer": "Kidney", "incorrectAnswers": ["Liver", "Lung"], "question": "Which vital organ does the adjective renal refer to?", "tags": [], "type": "Multiple Choice" }, { "category": "Science", "id": "622a1c377cc59eab6f950544", "correctAnswer": "race", "incorrectAnswers": ["parasites", "in ethics, duty", "rocks"], "question": "What is Ethnology the study of?", "tags": [], "type": "Multiple Choice" }];

const testQuestionsC = [
    {
        "category": "Geography",
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
        "category": "Geography",
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
        "category": "History",
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
        "category": "Film & TV",
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
        "category": "Arts & Literature",
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
        "category": "Music",
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
    },// 6
    {
        "category": "Sport & Leisure",
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
        "category": "General Knowledge",
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
        "category": "Society & Culture",
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
    }, // 9
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
    },
    {
        "category": "Science",
        "id": "622a1c377cc59eab6f95052a",
        "correctAnswer": "gross and disgusting things",
        "incorrectAnswers": [
            "crayfish",
            "plant nutrition and growth in relation to soil conditions",
            "periodic biological phenomena such as flowering, migration, breeding, etc"
        ],
        "question": "What is Grossology the study of?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c377cc59eab6f950487",
        "correctAnswer": "the study or exploration of caves",
        "incorrectAnswers": [
            "how to encrypt and decrypt secret messages",
            "methods",
            "methods"
        ],
        "question": "What is Speleology the study of?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c3a7cc59eab6f9510c2",
        "correctAnswer": "Flax",
        "incorrectAnswers": [
            "Sunflower",
            "Hemp",
            "Wheat"
        ],
        "question": "Linen is obtained from the fibers of what plant?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c3a7cc59eab6f95108e",
        "correctAnswer": "Alchemy",
        "incorrectAnswers": [
            "Magic",
            "Aurentalism",
            "Mystic Metallurgy"
        ],
        "question": "The ancient attempt to transmute base metals into gold was called ________.",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c3a7cc59eab6f950fee",
        "correctAnswer": "Coypu",
        "incorrectAnswers": [
            "Beaver",
            "Rat",
            "Capybara"
        ],
        "question": "Which Large Rodent Is Also Known As Nutria?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c3a7cc59eab6f951003",
        "correctAnswer": "Black Widow",
        "incorrectAnswers": [
            "Tarantula",
            "Jumping Spider",
            "Crab Spider"
        ],
        "question": "Which Spider Devours Its Partner After Mating?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c3a7cc59eab6f95103c",
        "correctAnswer": "Ra",
        "incorrectAnswers": [
            "Rd",
            "Gi",
            "Rm"
        ],
        "question": "What is the chemical symbol for radium?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c3a7cc59eab6f950ffc",
        "correctAnswer": "Cirrhosis",
        "incorrectAnswers": [
            "Hepatitis",
            "Scurvy",
            "Meningitis"
        ],
        "question": "Which Disease Of The Liver Is Associated With Alcoholism?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c3a7cc59eab6f950fc4",
        "correctAnswer": "James Watt",
        "incorrectAnswers": [
            "Benjamin Franklin",
            "Eli Whitney",
            "Marcus Steam"
        ],
        "question": "Who Invented The Steam Engine?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Science",
        "id": "622a1c377cc59eab6f95056b",
        "correctAnswer": "how to encrypt and decrypt secret messages",
        "incorrectAnswers": [
            "animal diseases",
            "sacred texts",
            "feces"
        ],
        "question": "What is Cryptology the study of?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Geography",
        "id": "622a1c357cc59eab6f94fe1e",
        "correctAnswer": "Reykjavik",
        "incorrectAnswers": [
            "Ontario",
            "Moscow",
            "Helsinki"
        ],
        "question": "What Is The World's Most Northerly Capital City?",
        "tags": [],
        "type": "Multiple Choice"
    }
]

const substitutes = [
    {
        "category": "Science",
        "id": "622a1c377cc59eab6f950540",
        "correctAnswer": "writing systems",
        "incorrectAnswers": [
            "the field of dermatological anatomical pathology",
            "the atmosphere",
            "existence"
        ],
        "question": "What is Grammatology the study of?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Geography",
        "id": "622a1c387cc59eab6f950ab5",
        "correctAnswer": "Ukraine",
        "incorrectAnswers": [
            "Kyrgyzstan",
            "Tajikistan",
            "Uzbekistan"
        ],
        "question": "Which of these countries borders Russia?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Geography",
        "id": "622a1c357cc59eab6f94fe1e",
        "correctAnswer": "Reykjavik",
        "incorrectAnswers": [
            "Ontario",
            "Moscow",
            "Helsinki"
        ],
        "question": "What Is The World's Most Northerly Capital City?",
        "tags": [],
        "type": "Multiple Choice"
    },
    {
        "category": "Geography",
        "id": "622a1c387cc59eab6f95097d",
        "correctAnswer": "Kuwait",
        "incorrectAnswers": [
            "Eritrea",
            "Israel",
            "Djibouti"
        ],
        "question": "Which of these countries borders Saudi Arabia?",
        "tags": [],
        "type": "Multiple Choice"
    }
]

// function findDuplicates(arr) {
//     const count = {};
//     const duplicates = [];
//     const questions = arr.map((question) => question.id);
//     questions.forEach((qn) => {
//         if (count[qn]) {
//             count[qn] += 1;
//             return;
//         }
//         count[qn] = 1;
//     });
//     for (let qn in count) {
//         if (count[qn] >= 2) {
//             duplicates.push(qn);
//         }
//     }
//     return duplicates;
// }

// function substituteQuestions(questions, duplicates) {
//     if (duplicates.length) {

//         for (let i = 0; i < duplicates.length; i++) {
//             const index = questions.findIndex((question) => question.id === duplicates[i]);
//             const newQuestion = [substitutes[i]];
//             questions.splice(index, 1, newQuestion[0]);
//             console.log(`Substituted question at index ${index} with new question: "${newQuestion[0].question}"`);
//         }

//     }
// }

const testQuestionsD = [];
for (let i = 0; i < 4; i++) {
    testQuestionsD.push(testQuestionsC[i]);
}

//quiz.init(testQuestionsD);

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