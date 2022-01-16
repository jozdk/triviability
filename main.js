let res;
let quiz;

const getQuizBtn = document.querySelector("#get-quiz");
const startQuizBtn = document.querySelector("#start-quiz");
const quizQuestionDiv = document.querySelector("#quiz-question");
const quizAnswersDiv = document.querySelector("#quiz-answers");


// getQuizBtn.addEventListener("click", () => {

//     // fetch("https://opentdb.com/api.php?amount=10")
//     // .then((response) => {
//     //     res = response;
//     //     return response.json()})
//     //     .then((value) => {
//     //         console.log(value.results)
//     //         array = value.results;
//     // });

//     fetch("https://api.trivia.willfry.co.uk/questions?categories=geography&limit=9")
//     .then((response) => {
//         res = response;
//         return response.json()})
//         .then((value) => {
//             console.log(value.results)
//             quiz = value.results;
//     });

// })


getQuizBtn.addEventListener("click", fetchQuiz);

startQuizBtn.addEventListener("click", askQuestion);


async function fetchQuiz() {
    res = await fetch("https://api.trivia.willfry.co.uk/questions?categories=geography&limit=9");
    quiz = await res.json();
}


function askQuestion() {
    quizQuestionDiv.innerHTML = quiz[0].question;
    let multiChoice = "";
    let wrongAnswers = [];
    let wrongAnswersSelect = [...quiz[0].incorrectAnswers];
    while (wrongAnswers.length < 3) {
        let random = Math.floor(Math.random() * wrongAnswersSelect.length);
        wrongAnswers.push(wrongAnswersSelect[random]);
        wrongAnswersSelect.splice(random, 1);
    }
    multiChoice += quiz[0].correctAnswer + wrongAnswers[0] + wrongAnswers[1] + wrongAnswers[2];
    quizAnswersDiv.innerHTML = multiChoice;
}







