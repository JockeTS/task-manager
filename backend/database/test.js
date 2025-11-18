const { insertItem, getAllItems, getAllItemsOrdered } = require("./index");

insertItem("Finances");
insertItem("Appointments");
insertItem("Home");
insertItem("Work");
insertItem("Health");

console.log(getAllItems());
console.log(getAllItemsOrdered());