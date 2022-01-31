class QuizBoxComponent {
    constructor(category, questions, { answered, points }) {
        this.abstractDOMTree = {
            root: {
                element: buildNode("div", { id: "quiz-element", className: "container" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg", id: "box-component" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "row mb-1 p-3", id: "stats-component" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "col" }),
                                                children: [
                                                    {
                                                        element: buildNode("div", { className: `row rounded-lg p-2 bg-${category}` }),
                                                        children: [
                                                            {
                                                                element: buildNode("div", { className: "col-3" }),
                                                                children: [
                                                                    {
                                                                        element: buildNode("p"),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(category),
                                                                                children: null
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                element: buildNode("div", { className: "col-3" }),
                                                                children: [
                                                                    {
                                                                        element: buildNode("p"),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(`${answered + 1}/9`),
                                                                                children: null
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            },
                                                            {
                                                                element: buildNode("div", { className: "col-3" }),
                                                                children: [
                                                                    {
                                                                        element: buildNode("p"),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(`${points} pts`),
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
                                        element: buildNode("div", { className: "row", id: "question-component" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "col text-center p-4 p-md-5" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: "lead" }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(questions[answered].question),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: buildNode("div", { className: "row text-center lead px-md-2", id: "answers-component" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(questions[answered].multipleChoice[0]),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(questions[answered].multipleChoice[1]),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(questions[answered].multipleChoice[2]),
                                                                children: null
                                                            }
                                                        ]
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                        children: [
                                                            {
                                                                element: document.createTextNode(questions[answered].multipleChoice[3]),
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
                                element: buildNode("div", { className: "row justify-content-center", id: "progress-component" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "mt-md-5 mt-4 col-6 px-0 rounded-lg bg-light" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "rounded-lg", id: "bar" }),
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
    }
}



const buildQuizBox = (category, questions, { answered, points }) => {
    return {
        element: buildNode("div", { id: "quiz-element", className: "container" }),
        children: [
            {
                element: buildNode("div", { className: "row justify-content-center" }),
                children: [
                    {
                        element: buildNode("div", { className: "col-11 col-sm-12 col-xl-9 col-xxl-7 bg-light mt-5 rounded-lg", id: "box-component" }),
                        children: [
                            {
                                element: buildNode("div", { className: "row mb-1 p-3", id: "stats-component" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "col" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: `row rounded-lg p-2 bg-${category}` }),
                                                children: [
                                                    {
                                                        element: buildNode("div", { className: "col-3" }),
                                                        children: [
                                                            {
                                                                element: buildNode("p"),
                                                                children: [
                                                                    {
                                                                        element: document.createTextNode(category),
                                                                        children: null
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        element: buildNode("div", { className: "col-3" }),
                                                        children: [
                                                            {
                                                                element: buildNode("p"),
                                                                children: [
                                                                    {
                                                                        element: document.createTextNode(`${answered + 1}/9`),
                                                                        children: null
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    },
                                                    {
                                                        element: buildNode("div", { className: "col-3" }),
                                                        children: [
                                                            {
                                                                element: buildNode("p"),
                                                                children: [
                                                                    {
                                                                        element: document.createTextNode(`${points} pts`),
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
                                element: buildNode("div", { className: "row", id: "question-component" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "col text-center p-4 p-md-5" }),
                                        children: [
                                            {
                                                element: buildNode("p", { className: "lead" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode(questions[answered].question),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { className: "row text-center lead px-md-2", id: "answers-component" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                        children: [
                                            {
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode(questions[answered].multipleChoice[0]),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                        children: [
                                            {
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode(questions[answered].multipleChoice[1]),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                        children: [
                                            {
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode(questions[answered].multipleChoice[2]),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                        children: [
                                            {
                                                element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                                                children: [
                                                    {
                                                        element: document.createTextNode(questions[answered].multipleChoice[3]),
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
                        element: buildNode("div", { className: "row justify-content-center", id: "progress-component" }),
                        children: [
                            {
                                element: buildNode("div", { className: "mt-md-5 mt-4 col-6 px-0 rounded-lg bg-light" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "rounded-lg", id: "bar" }),
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

class StatsComponent {
    constructor(category, answered, points) {
        this.abstractDOMTree = {
            element: buildNode("div", { className: "row mb-1 p-3", id: "stats-component" }),
            children: [
                {
                    element: buildNode("div", { className: "col" }),
                    children: [
                        {
                            element: buildNode("div", { className: `row rounded-lg p-2 bg-${category}` }),
                            children: [
                                {
                                    element: buildNode("div", { className: "col-3" }),
                                    children: [
                                        {
                                            element: buildNode("p"),
                                            children: [
                                                {
                                                    element: document.createTextNode(category),
                                                    children: null
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    element: buildNode("div", { className: "col-3" }),
                                    children: [
                                        {
                                            element: buildNode("p"),
                                            children: [
                                                {
                                                    element: document.createTextNode(`${answered + 1}/9`),
                                                    children: null
                                                }
                                            ]
                                        }
                                    ]
                                },
                                {
                                    element: buildNode("div", { className: "col-3" }),
                                    children: [
                                        {
                                            element: buildNode("p"),
                                            children: [
                                                {
                                                    element: document.createTextNode(`${points} pts`),
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
}

class QuestionsComponent {
    constructor(question) {
        this.abstractDOMTree = {
            element: buildNode("div", { className: "row", id: "question-component" }),
            children: [
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
}

class AnswersComponent {
    constructor() {
        this.abstractDOMTree = {
            element: buildNode("div", { className: "row text-center lead px-md-2", id: "answers-component" }),
            children: [
                {
                    element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                    children: [
                        {
                            element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                            children: [
                                {
                                    element: document.createTextNode(questions[answered].multipleChoice[0]),
                                    children: null
                                }
                            ]
                        }
                    ]
                },
                {
                    element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                    children: [
                        {
                            element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                            children: [
                                {
                                    element: document.createTextNode(questions[answered].multipleChoice[1]),
                                    children: null
                                }
                            ]
                        }
                    ]
                },
                {
                    element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                    children: [
                        {
                            element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                            children: [
                                {
                                    element: document.createTextNode(questions[answered].multipleChoice[2]),
                                    children: null
                                }
                            ]
                        }
                    ]
                },
                {
                    element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                    children: [
                        {
                            element: buildNode("p", { className: "rounded-lg py-2 py-md-5 bg-custom answer-highlight" }),
                            children: [
                                {
                                    element: document.createTextNode(questions[answered].multipleChoice[3]),
                                    children: null
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    }
}

class TimeComponent {
    constructor() {
        this.abstractDOMTree = {
            element: buildNode("div", { className: "row justify-content-center", id: "progress-component" }),
            children: [
                {
                    element: buildNode("div", { className: "mt-md-5 mt-4 col-6 px-0 rounded-lg bg-light" }),
                    children: [
                        {
                            element: buildNode("div", { className: "rounded-lg", id: "bar" }),
                            children: null
                        }
                    ]
                }
            ]
        }
    }
}


function depthFirstTraversalTest(rootNode, indexOfStartingNode, startingNode) {

    rootNode.append(startingNode.element);

    if (startingNode.children) {
        startingNode.children.forEach((child, i) => {
            let nodeArray = Array.from(rootNode.children);
            let newRootNode = nodeArray[indexOfStartingNode];
            depthFirstTraversalTest(newRootNode, i, child);
        })
    }

}


function buildNode(tag, properties) {
    const element = document.createElement(tag);
    if (properties) {
        Object.keys(properties).forEach((propertyName) => {
            element[propertyName] = properties[propertyName];
        });
    }

    return element;
}