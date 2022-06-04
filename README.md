# Triviability

Colorful trivia quiz with different categories to choose from, a countdown clock, three kinds of jokers and a result overview. You can also set the number of questions and view statistics in a sortable table.

The questions are from [The Trivia API](https://the-trivia-api.com/).

## Architecture

Triviablity is a single-page-application, written in Vanilla JavaScript. All of the HTML is rendered dynamically on the client-side via JavaScript. For this the app makes use of a small custom UI framework, inspired by React (see below for details).

The application makes AJAX calls to a third-party API using JavaScript's Fetch API.

The styling is made with Bootstrap 5 and some additional CSS.

## Custom UI framework

At the core of the framework lies the concept of an abstract DOM tree, much like React's Virtual DOM, and depth-first tree traversal. The latter is implemented by a `render` function that writes the abstract DOM recursively into the actual DOM.

The abstract DOM tree is built up of independent, reusable pieces (components) that are implemented as instances of classes. They take optional input as parameters and return abstract DOM elements. Components can also make use of other components, allowing for component extraction and composition on whatever level of detail. Inside the component's constructor function the whole power of JavaScript can be harnessed for conditional rendering, rendering collections of elements with the `map()` function and more. This makes it easy to build a highly interactive application, which is the main goal of any UI framework.

However, the framework is considerably limited, especially in comparison to React, in that it does not pay any attention to efficiency, when it comes to updating the DOM and does not support the concept of state or other component lifecycle methods whatsoever. That means there is no diffing between a previous and an updated tree, and the only way to update the UI is to create a new element/component and pass it to `UI.render()`. (For component state & lifecycle the framework would, for starters, need to introduce a distinction between the abstract DOM elements and the component instances. Maybe that's something for the future...)

Because of these limitations, the framework relies on a separation of concerns between UI, on the one hand, and controlling logic on the other hand. The controller classes persist the state of the application in global class instances, update the abstract DOM tree and initiate its rerendering (except when the updates are triggered solely by HTML events and don't involve state).

