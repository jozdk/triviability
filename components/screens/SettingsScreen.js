import { Settings, settings } from "../../index.js";
import { buildNode } from "../../ui.js";
import { toUnderscore } from "../../helpers.js";
import { Button, Modal } from "../sharedUIComponents.js";

export class SettingsScreen {
    constructor({ selected, amount }) {
        this.element = buildNode("div", { id: "selection-menu", className: "container" });
        this.children = [
            new Welcome(),
            new Categories({ selected }),
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
                element: buildNode("div", { className: "col-lg-10" }),
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
                                        element: buildNode("img", { src: `/assets/icons/${cat}.svg`, alt: category, className: "w-50" }),
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
                        element: buildNode("i", { className: "bi bi-shuffle fs-4 cursor", title: "Random", onclick: () => settings.selectRandom() }),
                        children: null
                    }
                ]
            },
            {
                element: buildNode("div", { className: "col-auto" }),
                children: [
                    {
                        element: buildNode("i", { className: "bi bi-check2-all fs-4 cursor", title: "Select All", onclick: () => settings.selectAll() }),
                        children: null
                    }
                ]
            },
            {
                element: buildNode("div", { className: "col-auto" }),
                children: [
                    {
                        element: buildNode("span", { title: "Settings" }),
                        children: [
                            {
                                element: buildNode("i", { className: "bi fs-4 cursor bi-gear", dataset: { bsToggle: "modal", bsTarget: "#advanced-settings-modal" }, onmouseover: fill, onmouseout: unfill }),
                                children: null
                            }
                        ]
                    }
                ]
            },
            {
                element: buildNode("div", { className: "col-2 d-sm-none" }),
                children: null
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

class StartButton {
    constructor() {

        const handler = () => {
            if (settings.categories.length) {
                settings.fetchQuestions();
                //quiz.init(testQuestions);
            } else {
                settings.calcRandom();
                settings.fetchQuestions();
            }
        }

        this.element = buildNode("div", { className: "row justify-content-center mt-3" });
        this.children = [
            {
                element: buildNode("div", { className: "col-md-9 col-xl-8 col-xxl-7" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-8 col-sm" }),
                                children: [
                                    new Button({ text: "Start Quiz!", className: "w-100", handler })
                                ]
                            }
                        ]
                    }

                    
                ]
            }
        ]
    }
}