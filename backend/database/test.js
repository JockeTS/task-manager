const { insertItem, getItems } = require("./index");

// insertItem({name: "Finances", position: 1});
insertItem({name: "Appointments", position: 2});
insertItem({name: "Home", position: 3});
insertItem({name: "Work", position: 4});
insertItem({name: "Health", position: 5});

console.log(getItems());