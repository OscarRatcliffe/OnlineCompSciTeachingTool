"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const spawner_1 = __importDefault(require("./spawner"));
const express = require('express');
const app = express();
const pythonScript = fs.readFileSync('test.py', 'utf8');
var currentContainerIDs = [];
app.get('/', (req, res) => {
    var containerID = Math.floor(Math.random() * 999) + 8000;
    currentContainerIDs.push(containerID);
    res.send({
        "State": `Created container ${containerID}`
    });
    (0, spawner_1.default)(pythonScript, containerID, currentContainerIDs);
});
app.listen(3000, () => {
    console.log(`App running on port 3000`);
});
