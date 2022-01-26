// new Settings;


// Quiz Class: Represents a Quiz

class Quiz {
    constructor(quizstate) {
        this._quizstate = quizstate;
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
        try {
            const url = `https://api.trivia.willfry.co.uk/questions?categories=${this._categories}&limit=9`;
            const result = await fetch(url);
            const questions = await result.json();
            for (let question of questions) {
                this._questions.push(question);
            }
        } catch {
            new Error("The request to Open Trivia API failed.")
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
            new QuizUI(quiz.categories[0]);
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


class QuizUI {
    constructor(category) {
        this.mainElement = document.querySelector("#main");
        this.boxComponent = buildComponent(this.buildNode("div", { id: "quiz-element", className: "container" }), this.buildNode("div", { className: "row justify-content-center" }), this.buildNode("div", { className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg" }));
        this.statsComponent = buildComponent(this.buildNode("div", { className: "row mb-1 p-3" }), this.buildNode("div", { className: "col-12" }), this.buildNode("div", { className: `row rounded-lg bg-${category}` }), this.buildNode())
    }

    buildNode(tag, properties) {
        const element = document.createElement(tag);
        Object.keys(properties).forEach((propertyName) => {
            element[propertyName] = properties[propertyName];
            // if (properties) {
            //     Object.keys(properties).forEach((property) => {
            //         element[property] = properties[property];
            //     })
            // }
        })
    }

    buildComponent(...elements) {
        
    }

    append() {
        //
    }

    render() {
        this.mainElement.append()
    }

}





const tree = {
    root: {
        element: this.buildNode("div", {id: "quiz-element", className: "container" }),
        children: [
            {
                element: this.buildNode("div", {className: "row justify-content-center" }),
                children: [
                    {
                        element: this.buildNode("div", {className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg", id:"box-component"}),
                        children: [
                            {
                                element: this.buildNode("div", {className: "row mb-1 p-3", id: "stats-component"}),
                                children: [
                                    {
                                        element: this.buildNode("div", {className: "col"}),
                                        children: [
                                            {
                                                element: this.buildNode("div", {className: "row rounded-lg p-2 bg-sport_and_leisure"}),
                                                children: [
                                                    {
                                                        element: this.buildNode("div", {className: "col-3"}),
                                                        children: [
                                                            {
                                                                element: this.buildNode("p"),
                                                                children: [
                                                                    {
                                                                        element: document.createTextNode(category),
                                                                        children: null
                                                                    },
                                                                    {
                                                                        element: document.createTextNode(`${answered + 1}/9`),
                                                                        children: null
                                                                    },
                                                                    {
                                                                        element: document.createTextNode(`${points} pts.`),
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
                                element: this.buildNode("div", {className: "row", id: "question-component"}),
                                children: [
                                    {
                                        element: this.buildNode("div", {className: "col text-center p-4 p-md-5"}),
                                        children: [
                                            {
                                                element: this.buildNode("p", {className: "lead"}),
                                                children: [
                                                    {
                                                        element: document.createTextNode(quiz.questions[answered].question),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: this.buildNode("div", {className: "row text-center lead px-md-2", id: "answers-component"}),
                                children: [
                                    {
                                        element: this.buildNode("div", {className: "col-md-6 px-3 px-md-2"}),
                                        children: [
                                            {
                                                element: this.buildNode("p", {className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight"}),
                                                children: [
                                                    {
                                                        element: document.createTextNode(quiz.questions[answered].multipleChoice[0]),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: this.buildNode("div", {className: "col-md-6 px-3 px-md-2"}),
                                        children: [
                                            {
                                                element: this.buildNode("p", {className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight"}),
                                                children: [
                                                    {
                                                        element: document.createTextNode(quiz.questions[answered].multipleChoice[1]),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: this.buildNode("div", {className: "col-md-6 px-3 px-md-2"}),
                                        children: [
                                            {
                                                element: this.buildNode("p", {className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight"}),
                                                children: [
                                                    {
                                                        element: document.createTextNode(quiz.questions[answered].multipleChoice[2]),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: this.buildNode("div", {className: "col-md-6 px-3 px-md-2"}),
                                        children: [
                                            {
                                                element: this.buildNode("p", {className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight"}),
                                                children: [
                                                    {
                                                        element: document.createTextNode(quiz.questions[answered].multipleChoice[3]),
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
                        element: this.buildNode("div", {className: "row justify-content-center", id: "progress-component"}),
                        children: [
                            {
                                element: this.buildNode("div", {className: "mt-md-5 mt-4 col-6 px-0 rounded-lg bg-light"}),
                                children: [
                                    {
                                        element: this.buildNode("div", {className: "rounded-lg", id: "bar"}),
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

// Loop

// buildDOM(tree) {
//     const queue = [];
//     const startNode = {node: tree.root, explored: true};
//     queue.push(startNode);

//     while (queue.length) {
//         let currentNode = queue.pop();
//         if (currentNode.children === null) {

//         }
//     }


//     const currentNode = {};

//     while (!currentNode.explored) {
//         currentNode.node
//     }

// }

// Recursion

// let main = document.querySelector("#main")

// buildDOM(tree, root) {

//     if (queue.length === 0) {
//         return;
//     }

//     const queue = [];
//     queue.push(tree.root);
//     // Mark startNode as explored????
    
//     let currentNode = queue.pop();

//     if (currentNode.children) {
//         currentNode.element.append(...currentNode.children);
//     }


//     if (currentNode.children === null) {

//     } else {
//         for (let child of currentNode.children) {
//         queue.push(child);
//         // Mark child as explored????
//         }
//     }
    
//     buildDOM()
// }



let component = {
    root: {
        element: buildNode("div", {className: "container", id: "quiz-element"}),
        children: [
            {
                element: buildNode("div", {className: "row justify-content-center"}),
                children: [
                    {
                        element: buildNode("div", {className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg"}),
                        children: null
                    },
                    {
                        element: buildNode("div", {className: "row justify-content-center"}),
                        children: [
                            {
                                element: buildNode("div", {className: "mt-md-5 mt-4 col-6 px-0 rounded-lg bg-light"}),
                                children: null
                            }
                        ]
                    }
                ]
            }
        ]
    }

}


function breadthFirstTraversal(startingNode, callback) {
    const queue = [startingNode];

    while (queue.length) {
        const node = queue.shift();
        callback(node);
        for (let child of node.children) {
            queue.push(child);
        }
        
    }



}




class TriviabilityNode {
    element;

    constructor(tag, attributes, properties) {
        this.element = document.createElement(tag);

        if (attributes) {
            this.setHTMLAttributes(attributes);
        }

        if (properties) {
            this.setProperties(properties);
        }

    }


    append(childorChildren) {
        if (Array.isArray(childorChildren)) {
            for (let childNode of childorChildren) {
                this.element.appendChild(childNode.element);
            }
        } else {
            this.element.appendChild(childorChildren.element);
        }
    }

    setHTMLAttributes(attributes) {
        Object.keys(attributes).forEach((attribute) => {
            this.element.setAttribute(attribute, attributes[attribute]);
        })
    }

    setProperties()
}


// Local Storage Class: Handles Local Storage

// Events?


const ui = new UI;
const quiz = new Quiz();
const quizUI = new QuizUI();


// class QuizUI {
//     constructor(category) {
//         this.mainElement = document.querySelector("#main");
//         this.boxComponent = buildComponent(this.buildNode("div", { id: "quiz-element", className: "container" }), this.buildNode("div", { className: "row justify-content-center" }), this.buildNode("div", { className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg" }));
//         this.statsComponent = buildComponent(this.buildNode("div", { className: "row mb-1 p-3" }), this.buildNode("div", { className: "col-12" }), this.buildNode("div", { className: `row rounded-lg bg-${category}` }), this.buildNode())
//     }

//     root(tag, properties, children) {
//         const element = document.createElement(tag);
//         Object.keys(properties).forEach((propertyName) => {
//             element[propertyName] = properties[propertyName];
//             // if (HTMLAttributes) {
//             //     Object.keys(HTMLAttributes).forEach((attribute) => {
//             //         element.setAttribute(attribute, HTMLAttributes.attribute)
//             //     })
//             // }
//         })
//         return {
//             type: "root",
//             element: element,
//             children: this.childrensList(children)
//         }
//     }

//     childrensList(children) {
//         const childrensList = [];
//         for (let i = 0; i < children.length; i++) {
//             childrensList.push()
//         }

//         while 
//     }

//     buildComponent(elements, structure = {}) {

//     }

//     append() {
//         //
//     }

//     render() {
//         this.mainElement.append()
//     }

// }