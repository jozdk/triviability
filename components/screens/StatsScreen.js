import { quiz, settings } from "../../index.js";
import { Button, Modal } from "../sharedUIComponents.js";
import { buildNode, compileDOMTree } from "../../ui.js";
import { hexColors, shuffleArray } from "../../helpers.js";
import { SettingsScreen } from "./SettingsScreen.js";

export class StatsScreen {
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
                    new StatsControls(),
                    new Overview({ questions, discarded }),
                    new StatsControls()
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

class CategoriesTable {
    constructor({ categories, unused, column, chevron }) {
        
        const sortCategories = (e) => {
            const column = e.target.previousElementSibling.textContent;
            const sortDown = e.target.classList.contains("bi-chevron-up") || e.target.classList.contains("bi-chevron-expand");
            const chevron = sortDown ? "down" : "up";
            if (column === "Category") {
                sortDown ? categories.sort((a, b) => a.category < b.category ? -1 : 1) : categories.sort((a, b) => a.category > b.category ? -1 : 1);
            } else if (column === "Questions") {
                sortDown ? categories.sort((a, b) => b.amount - a.amount) : categories.sort((a, b) => a.amount - b.amount);
            } else if (column === "Questions (%)") {
                sortDown ? categories.sort((a, b) => b.percent - a.percent) : categories.sort((a, b) => a.percent - b.percent);
            } else if (column === "Correct") {
                sortDown ? categories.sort((a, b) => b.correct - a.correct) : categories.sort((a, b) => a.correct - b.correct);
            } else if (column === "Correct (%)") {
                sortDown ? categories.sort((a, b) => b.correctPercent - a.correctPercent) : categories.sort((a, b) => a.correctPercent - b.correctPercent);
            } else if (column === "Time per answer ⌀") {
                sortDown ? categories.sort((a, b) => a.averageTime - b.averageTime) : categories.sort((a, b) => b.averageTime - a.averageTime);
            } else if (column === "Points ⌀") {
                sortDown ? categories.sort((a, b) => b.points - a.points) : categories.sort((a, b) => a.points - b.points);
            }
            new CategoriesTable({ categories, unused, column, chevron }).render();
        }

        return new Table({
            tableHead: ["Category", "Questions", "Questions (%)", "Correct", "Correct (%)", "Time per answer ⌀", "Points ⌀"].map((header) => {
                return {
                    data: [
                        {
                            element: buildNode("span", { textContent: header }),
                            children: null
                        },
                        {
                            element: buildNode("i", { className: `bi bi-chevron-${header === column ? chevron : "expand"} cursor small-font align-top ms-2`, onclick: sortCategories }),
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

class StatsControls {
    constructor() {

        const toCategories = () => {
            quiz.reset();
            settings.reset();
            settings.ui.selectionMenuElement = new SettingsScreen({ selected: settings.categories, amount: settings.amount });
        }

        const playAgain = () => {
            quiz.reset();
            settings.fetchQuestions();
        }

        this.element = buildNode("div", { id: "stats-controls", className: "row justify-content-center mt-5" });
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
                                    new Button({ text: "Categories", icon: { type: "grid-3x3-gap", className: "me-1" }, spanClassName: "align-middle", handler: toCategories })
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-auto" }),
                                children: [
                                    new Button({ text: "Play Again", icon: { type: "arrow-repeat", className: "me-1" }, spanClassName: "align-middle", handler: playAgain })
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