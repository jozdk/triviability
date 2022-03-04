class QuizComponent {
    constructor({ category, question, multipleChoice, answered, points, board, handler }) {
        this.abstractDOMTree = {
            root: {
                element: buildNode("div", { id: "quiz-element", className: "container-xl" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { id: "stats-component", className: "col-md-2 d-none d-md-flex bg-light rounded-lg me-2 mt-5 flex-column" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "row mb-1 p-3" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: `col rounded-lg p-2 bg-${category.color}` }),
                                                children: [
                                                    {
                                                        element: buildNode("p", { className: "px-0 my-2 text-center" }),
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
                                    },
                                    {
                                        element: buildNode("div", { id: "timer-component", className: "row py-3" }),
                                        children: [
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
                                                            {
                                                                element: buildNode("div", { className: "radial-timer" }),
                                                                children: [
                                                                    {
                                                                        element: buildNode("div", { className: `first-half bg-${category.color}` }),
                                                                        children: null
                                                                    },
                                                                    {
                                                                        element: buildNode("div", { className: "half-mask" }),
                                                                        children: null
                                                                    },
                                                                    {
                                                                        element: buildNode("div", { className: `second-half bg-${category.color}` }),
                                                                        children: null
                                                                    },
                                                                    {
                                                                        element: buildNode("div", { className: "seconds d-flex align-items-center justify-content-center lead" }),
                                                                        children: [
                                                                            {
                                                                                element: buildNode("h4", { id: "seconds" }),
                                                                                children: [
                                                                                    {
                                                                                        element: document.createTextNode("12"),
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
                                    },
                                    {
                                        element: buildNode("div", { id: "score-component", className: "row mb-1 py-3 px-xxl-5 px-lg-4 px-md-1 text-center" }),
                                        children: [
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
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[0])}-fill board-${board[0]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[1])}-fill board-${board[1]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[2])}-fill board-${board[2]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[3])}-fill board-${board[3]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[4])}-fill board-${board[4]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[5])}-fill board-${board[5]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[6])}-fill board-${board[6]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[7])}-fill board-${board[7]}` }),
                                                        children: null
                                                    }
                                                ]
                                            },
                                            {
                                                element: buildNode("div", { className: "col-4 px-0" }),
                                                children: [
                                                    {
                                                        element: buildNode("i", { className: `fs-3 bi bi-${resultIcon(board[8])}-fill board-${board[8]}` }),
                                                        children: null
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            {
                                element: buildNode("div", { id: "quizbox-component", className: "col-11 col-md-9 col-xxl-7 mt-5" }),
                                children: [
                                    {
                                        element: buildNode("div", { id: "question-component", className: "row" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "col bg-light rounded-lg" }),
                                                children: [
                                                    {
                                                        element: buildNode("div", { id: "question-header-component", className: "row mb-1 p-3" }),
                                                        children: [
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
                                                                                        element: buildNode("p", { className: "my-2" }),
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
                                                                                element: buildNode("div", { className: "col-2 text-end" }),
                                                                                children: [
                                                                                    {
                                                                                        element: buildNode("i", { className: "bi bi-hourglass-top fs-4 p-1 cursor joker-highlight" }),
                                                                                        children: null
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                element: buildNode("div", { className: "col-2 text-end" }),
                                                                                children: [
                                                                                    {
                                                                                        element: buildNode("i", { className: "bi bi-arrow-left-right fs-4 p-1 cursor joker-highlight" }),
                                                                                        children: null
                                                                                    }
                                                                                ]
                                                                            },
                                                                            {
                                                                                element: buildNode("div", { className: "col-2 d-flex align-items-center justify-content-end" }),
                                                                                children: [
                                                                                    {
                                                                                        element: buildNode("strong", { className: "border border-dark p-1 cursor joker-highlight" }),
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
                                                    },
                                                    {
                                                        element: buildNode("div", { id: "question-question-component", className: "row" }),
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
                                                ]
                                            }
                                        ]
                                    },
                                    {
                                        element: buildNode("div", { id: "answers-component", className: "row" }),
                                        children: [
                                            {
                                                element: buildNode("div", { className: "col bg-light rounded-lg mt-2" }),
                                                children: [
                                                    {
                                                        element: buildNode("div", { className: "row text-center lead px-md-2 py-3 gy-3" }),
                                                        children: [
                                                            {
                                                                element: buildNode("div", { className: "col-md-6 px-3 px-md-2" }),
                                                                children: [
                                                                    {
                                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 my-0 bg-custom border answer-highlight-${category.color}`, onclick: handler }),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(multipleChoice[0]),
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
                                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 my-0 bg-custom border answer-highlight-${category.color}`, onclick: handler }),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(multipleChoice[1]),
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
                                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 my-0 bg-custom border answer-highlight-${category.color}`, onclick: handler }),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(multipleChoice[2]),
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
                                                                        element: buildNode("p", { className: `rounded-lg py-2 py-md-5 my-0 bg-custom border answer-highlight-${category.color}`, onclick: handler }),
                                                                        children: [
                                                                            {
                                                                                element: document.createTextNode(multipleChoice[3]),
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
                        ]
                    }
                ]
            }
        }
    }
}