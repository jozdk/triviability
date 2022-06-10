import { quiz, settings } from "../../index.js";
import { SettingsScreen } from "./SettingsScreen.js";
import { Button } from "../sharedUIComponents.js";
import { buildNode } from "../../ui.js";

export class QuizScreen {
    constructor({ question, gamestate, timer }) {
        this.root = {
            element: buildNode("div", { id: "quiz-element", className: "container-xl" }),
            children: [
                {
                    element: buildNode("div", { className: "row justify-content-center" }),
                    children: [
                        new InfoRail({ question, gamestate, timer }),
                        {
                            element: buildNode("div", { id: "quizbox-component", className: "col-11 col-md-8 col-xxl-7 mt-xxl-5 mt-4 d-flex flex-column" }),
                            children: [
                                new QuestionComponent({ question, jokers: gamestate.jokers, gamestate }),
                                new Answers({ question })
                            ]
                        },
                        new TimerSmallScreen({ category: question.category, timer })
                    ]
                },
                new Controls({ gamestate, result: question.result })
            ]

        }
    }
}

class InfoRail {
    constructor({ question, gamestate, timer }) {
        this.element = buildNode("div", { id: "info-rail-component", className: "col-md-2 d-flex me-2 mt-4 mt-xxl-5" });
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
                element: buildNode("div", { className: `col rounded-lg p-xl-2 p-1 bg-${category.color}` }),
                children: [
                    {
                        element: buildNode("p", { className: "px-0 my-2 text-center" }),
                        children: [
                            {
                                element: document.createTextNode(`${answered + 1} / ${total}`),
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
    constructor({ category, timer, amount }) {

        this.element = buildNode("div", { id: "timer-component", className: `row ${amount <= 12 ? "py-2 py-xl-3" : "pb-2 pb-xl-3 pt-2"}` });
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
                        ]
                    }
                ]
            }
        ];
    }
}

export class Time {
    constructor({ category, timer }) {

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
                element: buildNode("div", { className: `second-half-js bg-${category.color}${timer.elapsed > timer.total / 2 ? " d-none" : ""}`, style: { transform: secondHalf } }),
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

class TimerSmallScreen {
    constructor({ category, timer }) {
        this.element = buildNode("div", { id: "timer-container-small", className: "d-md-none col-11 p-0 mt-3" });
        this.children = [
            new TimeSmallScreen({ category, timer })
        ];
    }
}

export class TimeSmallScreen {
    constructor({ category, timer }) {
        const width = timer.elapsed * 5;

        this.element = buildNode("div", { className: "progress bg-light position-relative", style: { height: "20px" } });
        this.children = [
            {
                element: buildNode("div", { className: "position-absolute zindex-fixed start-50" }),
                children: [
                    {
                        element: document.createTextNode(`${timer.total - timer.elapsed}`),
                        children: null
                    }
                ]
            },
            {
                element: buildNode("div", { className: `progress-bar text-dark bg-${category.color}`, role: "progressbar", style: { width: `${width}%` } }),
                children: null
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
                        element: buildNode("h5", { className: "mb-0 mb-xl-2" }),
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
                element: buildNode("i", { className: `bi bi-${icon(field)}-fill board-${field} ${length <= 12 ? "board-field-lg" : "board-field-sm"}` }),
                children: null
            }
        ]
    }
}

class QuestionComponent {
    constructor({ question, jokers, gamestate }) {
        this.element = buildNode("div", { id: "question-component", className: "row flex-grow-1" });
        this.children = [
            {
                element: buildNode("div", { className: "col bg-light rounded-lg" }),
                children: [
                    new QuestionHeader({ question, jokers, answered: gamestate.answered, total: gamestate.board.length, points: gamestate.points }),
                    new QuestionText({ question: question.question })
                ]
            }
        ]
    }
}

class QuestionHeader {
    constructor({ question, jokers, answered, total, points }) {

        const queryString = jokers.lookup && question.result === "unanswered" ? question.question.replace(/\s/gm, "+").replace(/\?/gm, "%3F") : "";

        const handler = (event) => {
            quiz.useJoker(event.target.id);
        }

        this.element = buildNode("div", { id: "question-header-component", className: "row p-3" });
        this.children = [
            {
                element: buildNode("div", { className: `col-12 rounded-lg p-xl-2 p-1 bg-${question.category.color}` }),
                children: [
                    {
                        element: buildNode("div", { className: "row px-2" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-6 text-start d-flex d-md-block" }),
                                children: [
                                    {
                                        element: buildNode("p", { className: "my-2 d-md-block d-none", textContent: question.category.title }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("p", { className: "my-2 d-md-none col-8 fw-bolder", textContent: `${answered + 1} / ${total}` }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("p", { className: "my-2 d-md-none col-4 fw-bolder", textContent: points === 0 ? "0" : points }),
                                        children: null
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
                                                element: buildNode("i", { id: "lookup", className: `bi bi-search fs-4 p-1 cursor ${jokers.lookup ? "joker-highlight" : "selected"}`, title: "Look-Up", onclick: jokers.lookup && question.result === "unanswered" && !question.switch ? handler : null }),
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
                                        element: buildNode("i", { id: "switch", className: `bi bi-arrow-left-right fs-4 p-1 cursor ${jokers.switch ? "joker-highlight" : "selected"}`, title: "Switch", onclick: jokers.switch && question.result === "unanswered" && !question.switch ? handler : null }),
                                        children: null
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "col-2 d-flex align-items-center justify-content-end px-1 px-sm-2" }),
                                children: [
                                    {
                                        element: buildNode("strong", { id: "fifty", className: `border border-dark p-1 cursor fifty-fifty ${jokers.fifty ? "joker-highlight" : "selected"}`, title: "50:50", onclick: jokers.fifty && question.result === "unanswered" && !question.switch ? handler : null }),
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
                element: buildNode("div", { className: "col text-center p-4 p-xl-5" }),
                children: [
                    {
                        element: buildNode("p", { className: "xl-lead", style: { userSelect: "none" } }),
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

        const handler = question.result === "unanswered" && !question.switch ? (event) => quiz.validate(event.target.textContent) : null;

        const answers = question.multipleChoice.map((answer, index) => {

            if (question.result === "correct" && answer === question.correctAnswer) {
                return new Answer({ answer, color: "correct", handler });
            }

            if (question.result === "wrong" && answer === question.userAnswer) {
                return new Answer({ answer, color: "wrong", handler });
            }

            if (question.result === "wrong" && answer === question.correctAnswer) {
                return new Answer({ answer, color: "actually-correct", handler });
            }

            if (question.fifty && (index === question.fifty.random1 || index === question.fifty.random2)) {
                return new Answer({});
            }

            if (question.switch && answer === question.correctAnswer) {
                return new Answer({ answer, color: "actually-correct", handler })
            }

            if (question.result !== "unanswered" || question.switch) {
                return new Answer({ answer, color: "white", handler })
            }

            return new Answer({ answer, color: "white", highlight: question.category.color, handler });

        })

        this.element = buildNode("div", { id: "answers-component", className: "row" });
        this.children = [
            {
                element: buildNode("div", { className: "col bg-light rounded-lg mt-2" }),
                children: [
                    {
                        element: buildNode("div", { className: "row text-center xl-lead px-md-2 py-3 gy-3" }),
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
    constructor({ answer, color, highlight, handler }) {

        this.element = buildNode("div", { className: "col-md-6 px-3 px-md-2 answer-box" });
        this.children = [
            ...answer ?
                [{
                    element: buildNode("p", { className: `rounded-lg border p-2 py-md-5 my-0 bg-answer-${color}${highlight ? ` answer-highlight-${highlight}` : ""}`, onclick: handler }),
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

        const next = () => {
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

        const playAgain = () => {
            quiz.reset();
            settings.fetchQuestions();
        }

        const back = () => {
            quiz.reset();
            settings.reset();
            settings.ui.selectionMenuElement = new SettingsScreen({ selected: settings.categories, amount: settings.amount });
        }

        this.element = buildNode("div", { className: "row justify-content-center mt-3" });
        this.children = [
            {
                element: buildNode("div", { className: "col-5 col-md-3 col-lg-2" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-end" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-md-12 col-xl-10 col-xxl-9 px-0" }),
                                children: [
                                    new Button({ text: "Categories", icon: { type: "arrow-left", className: "me-1" }, handler: back })
                                ]
                            }
                        ]
                    }
                ]
            },
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
                            ...gamestate.board[gamestate.board.length - 1] !== "unanswered" ? [
                                {
                                    element: buildNode("div", { className: "col-auto pe-0 ps-1 ps-sm-2 mb-md-0 mb-2" }),
                                    children: [
                                        new Button({ text: "Play Again", icon: { type: "arrow-repeat", className: "me-1" }, handler: playAgain })
                                    ]
                                }
                            ] : [],
                            {
                                element: buildNode("div", { className: "col-auto pe-0 ps-1 ps-sm-2" }),
                                children: [
                                    new Button({ text, icon: { type: "arrow-right", className: "ms-1", behindText: true }, handler: next })
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}