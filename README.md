# Triviability

Colorful trivia quiz with different categories to choose from, a countdown clock, three kinds of jokers and a result overview. You can also set the number of questions and view statistics in a sortable table.

The questions are from [The Trivia API](https://the-trivia-api.com/).

## Architecture

Triviablity is a single-page-application, written in Vanilla JavaScript. All of the HTML is rendered dynamically on the client-side via JavaScript. For this the app makes use of a small custom UI framework, inspired by React (see below for details).

The application makes AJAX calls to a third-party API using JavaScript's Fetch API.

The styling is made with Bootstrap 5 and some additional CSS.

## Custom UI framework

At the core of the framework lies the concept of an abstract DOM tree, much like React's Virtual DOM, and depth-first tree traversal. The latter is implemented by a `render` function, that takes in a root element and an abstract element/DOM tree, which is recursively written into the actual DOM.

The abstract DOM tree is built up of independent, reusable pieces (components) that are implemented as instances of classes. They take optional input as parameters and return abstract DOM elements. Components can also make use of other components, allowing for component extraction and composition on whatever level of detail. Inside the component's constructor function the whole power of JavaScript can be harnessed for conditional rendering, rendering collections of elements with the `map()` function and more. This makes it easy to build a highly interactive application, which is the main goal of any UI framework.

However, the framework is considerably limited, especially in comparison to React, in that it does not pay any attention to efficiency, when it comes to updating the DOM and does not support the concept of state or other component lifecycle methods whatsoever. That means there is no diffing between a previous and an updated tree, and the only way to update the UI is to create a new element/component and pass it to `UI.render()`. (For component state & lifecycle the framework would, for starters, need to introduce a distinction between the abstract DOM elements and the component instances. Maybe that's something for the future...)

Because of these limitations, the framework relies on a separation of concerns between UI, on the one hand, and controlling logic on the other hand. The controller classes persist the state of the application in global class instances, update the abstract DOM tree and initiate its rerendering (except when the updates are triggered solely by HTML events and don't involve state).

## Running the App

Clone or download the repository. For the ES6 modules to work, you need to serve the application with a local static server. An easy way to do so would be, for example, to install the VSCode Extension [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).

## Gameplay

### Settings

You can select one or multiple quiz categories by clicking on their cards. Unselect them by clicking again.

The **shuffle icon** selects categories randomly.  
The **double checkmarks icon** selects/unselects all categories.  
The **gear icon** opens a dialog to set the number of questions.

When you are satisfied with your settings, click on `Start Quiz!` to start your quiz.

### Quiz

For each question you have 20 seconds to select an answer from a multiple choice of four. If your answer is correct, a score is calculated based on your answering time. Click on `Next Question` to proceed to the next question. At any time, you can quit the current quiz session and go back to the settings screen by clicking on `Categories`.

#### Score system

For every correct answer you get a base score of 10 points + 1 bonus point for every two seconds left on the clock, resulting in the score table below.

| Answer time (sec) | score |
| --- | --- |
| 0-2 | 20 |
| 2-4 | 19 |
| 4-6 | 18 |
| 6-8 | 17 |
| 8-10 | 16 |
| 10-12 | 15 |
| 12-14 | 14 |
| 14-16 | 13 |
| 16-18 | 12 |
| 18-20 | 11 |

Note that to calculate the score, the application uses the exact time in milliseconds. That means that the score can diverge from the time displayed on the screen which is only updated per second.

#### Jokers

There are three jokers, each of them can be used once per quiz.

**Lookup**

The `Lookup` joker opens a link to a Google search of the question in a new Browser tab and resets the time. It is activated by clicking on the magnifying glass icon.

**Switch**

The `Switch` joker discards the current question and provides you with a new one. Note: The new question can be from a different category than the old one (but not from a different category than the ones you selected). Also, the time is reset. Click on the left-right-arrows icon to use it.

**50:50**

The `50:50` joker eliminates randomly two wrong answers from the current question. (No time reset.) Activated by a click on the "50:50" icon.

### Overview/Statistics

At the end of the quiz, click on `View Results` to get to the overview/statistics screen. (Or click `Play again` to start another quiz with the same length and categories, but new questions).

If you chose more than one category, you can check out additional statistics in a sortable table to compare your category results. Click on the expand icon next to `Categories` in the `General` box to do so.

Below you can browse through a detailed overview of the whole quiz session.
