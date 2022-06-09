export function toUnderscore(cat) {
    if (cat === "Film & TV") cat = "movies";
    if (cat === "Arts & Literature") cat = "literature";
    return cat.toLowerCase().replace(/\s/g, "_").replace(/&/g, "and");
}

export function capitalize(cat) {
    let category = cat
        .replace("and", "&")
        .replace(/_/g, " ")
        .replace(/\b[a-z]/g, (match) => match.toUpperCase());
    if (category === "Movies") category = "Film & TV";
    if (category === "Literature") category = "Arts & Literature";
    return category;
}

export function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

export const hexColors = {
    "science": "#03FCBA",
    "history": "#FFF75C",
    "geography": "#D47AE8",
    "movies": "#EA3452",
    "literature": "#71FEFA",
    "music": "#FFA552",
    "sport_and_leisure": "#D2FF96",
    "general_knowledge": "#C4AF9A",
    "society_and_culture": "#FF579F"
};