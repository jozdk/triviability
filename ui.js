export function buildNode(tag, properties) {
    const element = document.createElement(tag);
    if (properties) {
        Object.keys(properties).forEach((propertyName) => {
            if (properties[propertyName] && typeof properties[propertyName] === "object") {
                //const nestedObj = properties[propertyName];
                Object.keys(properties[propertyName]).forEach((nestedProperty) => {
                    if (properties[propertyName][nestedProperty]) {
                        element[propertyName][nestedProperty] = properties[propertyName][nestedProperty];
                    }
                })
            } else if (properties[propertyName]) {
                element[propertyName] = properties[propertyName];
            }

        });
    }

    return element;
}

export function compileDOMTree(rootNode, startingNode) {

    rootNode.append(startingNode.element);

    if (startingNode.children) {
        startingNode.children.forEach((child) => {
            compileDOMTree(rootNode.lastElementChild, child);
        })

    }

}

export class UI {
    render(rootNode, startingNode) {

        rootNode.append(startingNode.element);

        if (startingNode.children) {
            startingNode.children.forEach((child) => {
                this.render(rootNode.lastElementChild, child);
            })

        }

    }
}