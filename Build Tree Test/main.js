function buildNode(tag, properties) {
    const element = document.createElement(tag);
    Object.keys(properties).forEach((propertyName) => {
        element[propertyName] = properties[propertyName];
    })
    return element;
}



function breadthFirstTraversal(startingNode, callback) {
    const queue = [startingNode];
    const root = document.body;


    while (queue.length) {

        const node = queue.shift();

        appendToSomething(node.element)

        if (node.children) {
            for (let child of node.children) {
                queue.push(child);
            }
        }

    }

}


let component = {
    root: {
        element: buildNode("div", { className: "div-1", id: "first-element" }),
        children: [
            {
                element: buildNode("div", { className: "div-2", id: "second-element" }),
                children: [
                    {
                        element: buildNode("div", { className: "div-3", id: "third-element" }),
                        children: [
                            {
                                element: buildNode("div", { className: "div-5", id: "fifth-element" }),
                                children: null
                            }
                        ]
                    },
                    {
                        element: buildNode("div", { className: "div-4", id: "fourth-element" }),
                        children: [
                            {
                                element: buildNode("div", {className: "div-4-child", id: "fourth-element-child"}),
                                children: null
                            }
                        ]
                    }
                ]
            },
            {
                element: buildNode("div", {className: "div-new-1", id: "new-element"}),
                children: [
                    {
                        element: buildNode("div", {className: "div-new-3", id: "new-element-3"}),
                        children: null
                    }
                ]
            },
            {
                element: buildNode("div", {className: "div-new-2", id: "new-element-2"}),
                children: [
                    {
                        element: buildNode("div", {className: "div-new-4", id: "new-element-4"}),
                        children: [
                            {
                                element: buildNode("div", {className: "div-new-4-child", id: "new-element-4-child"}),
                                children: null
                            },
                            {
                                element: buildNode("div", {className: "div-new-4-child-2", id: "new-element-4-child-2"}),
                                children: null
                            },
                            {
                                element: buildNode("div", {className: "div-new-4-child-3", id: "new-element-4-child-3"}),
                                children: [
                                    {
                                        element: buildNode("p", {className: "p-1", id: "first-p-element"}),
                                        children: [
                                            {
                                                element: document.createTextNode("div-new-4-child-3-child-child"),
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


// breadthFirstTraversal(component.root);



// function toDOM(node) {
//     node.element.append(...node.children);
//     console.log(node.element);
// }


let called = 0;

const rootNode = document.querySelector("#root");

function depthFirstTraversal(rootNode, indexOfParentInNodeArray, startingNode) {
    called++;
    rootNode.append(startingNode.element);

    //console.log(startingNode.children)

    if (startingNode.children) {
        startingNode.children.forEach((child) => {
            
            depthFirstTraversal(rootNode.firstElementChild, child);
        })

        for (let i = 0; i < startingNode.children.length; i++) {
            let nodeArray = Array.from(rootNode.childNodes);
            let newRootNode = nodeArray[index];
            depthFirstTraversal(newRootNode, i, child);
        }

    }

}


depthFirstTraversalTest(rootNode, 0, component.root);






// Jedes child müsste halt irgendwie wissen, ob sein parent ein erstes, zweites, drittes etc. child ist.
// Dann könnte man für es die Funktion mit dem richtigen rootNode aufrufen.



function depthFirstTraversalTest(rootNode, indexOfParentInNodeArray, startingNode) {
    called++;
    rootNode.append(startingNode.element);

    //console.log(startingNode.children)

    if (startingNode.children) {
        startingNode.children.forEach((child, i) => {
            let nodeArray = Array.from(rootNode.childNodes);
            let newRootNode = nodeArray[indexOfParentInNodeArray];
            depthFirstTraversalTest(newRootNode, i, child);
        })

        // for (let i = 0; i < startingNode.children.length; i++) {
        //     let nodeArray = Array.from(rootNode.childNodes);
        //     let newRootNode = nodeArray[indexOfParentInNodeArray];
        //     depthFirstTraversal(newRootNode, i, startingNode.children[i]);
        // }

    }

}