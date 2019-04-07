// import snooze from "./snooze"

import("./snooze").then(s => console.log(s));

export default ms => new Promise(resolve => setTimeout(resolve, ms));
