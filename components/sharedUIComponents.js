import { buildNode } from "../ui.js";
import { hexColors } from "../helpers.js";

export class Button {
    constructor({ id, className, style, text, icon, spanClassName, handler }) {
        this.element = buildNode("button", {
            id: id ? id : null,
            className: `btn btn-outline-dark${className ? ` ${className}` : ""}`,
            style: style ? style : null,
            textContent: icon ? null : text,
            onclick: handler
        });
        this.children = icon ? [
            {
                element: buildNode("i", { className: `bi bi-${icon.type}${icon.className ? ` ${icon.className}` : ""}` }),
                children: null
            },
            {
                element: buildNode("span", { textContent: text, className: spanClassName ? spanClassName : null }),
                children: null
            }
        ] : null;
        if (icon && icon.behindText) this.children.reverse();
    }
}

// className parameter not needed atm, but we'll see
export class Modal {
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
                                        element: buildNode("div", { id: contentID ? contentID : null, className: "container-fluid" }),
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

export class Spinner {
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

export class Header {
    constructor() {
        this.element = buildNode("header", { className: "bg-light d-none d-md-block" });
        this.children = [
            {
                element: buildNode("div", { className: "container" }),
                children: [
                    {
                        element: buildNode("div", { className: "row justify-content-center" }),
                        children: [
                            {
                                element: buildNode("div", { className: "col-lg-10" }),
                                children: [
                                    {
                                        element: buildNode("div", { className: "navbar navbar-light" }),
                                        children: [
                                            {
                                                element: buildNode("a", { className: "navbar-brand", textContent: "Triviablity" })
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

export class Footer {
    constructor() {
        this.element = buildNode("footer", { className: "bg-light mt-5 text-center text-lg-start overflow-hidden d-none d-md-block" }),
        this.children = [
            {
                element: buildNode("div", { className: "row" }),
                children: [
                    {
                        element: buildNode("div", { className: "col pe-0" }),
                        children: [
                            {
                                element: buildNode("p", { className: "p-3 mb-0" }),
                                children: [
                                    {
                                        element: buildNode("span", { textContent: "Questions from" }),
                                        children: null
                                    },
                                    {
                                        element: buildNode("a", { href: "https://the-trivia-api.com/", textContent: "The Trivia API" }),
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