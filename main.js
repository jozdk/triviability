let res;
let quiz;


const catScienceElement = document.querySelector("#cat-science");
const catHistoryElement = document.querySelector("#cat-history");
const catGeographyElement = document.querySelector("#cat-geography");
const catMoviesElement = document.querySelector("#cat-movies");
const catArtLitElement = document.querySelector("#cat-art-lit");
const catMusicElement = document.querySelector("#cat-music");
const catSportLeisureElement = document.querySelector("#cat-sport-leisure");
const catGeneralKnowledgeElement = document.querySelector("#cat-general-knowledge");
const catSocietyCultureElement = document.querySelector("#cat-society-culture");

const categorySelection = document.querySelector("#category-selection");

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

categorySelection.addEventListener("click", (event) => {
    const category = event.target.firstElementChild.lastElementChild.innerText;
    switch (category) {
        case "Science":

    }
})

// categorySelection.addEventListener("click", fetchQuiz);

startQuizBtn.addEventListener("click", askQuestion);


async function fetchQuiz(category) {
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







