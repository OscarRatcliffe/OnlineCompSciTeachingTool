"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const spawner_1 = __importDefault(require("./spawner"));
const pythonScript = fs.readFileSync('test.py', 'utf8');
var currentContainerIDs = [];
var containerID = Math.floor(Math.random() * 1000000);
currentContainerIDs.push(containerID);
(0, spawner_1.default)(pythonScript, containerID, currentContainerIDs);
