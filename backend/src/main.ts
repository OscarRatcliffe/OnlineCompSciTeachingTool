const fs = require('fs');
import spawnContainer from "./spawner";

const pythonScript = fs.readFileSync('test.py', 'utf8');

var currentContainerIDs: any = []

var containerID:number = Math.floor(Math.random() * 1000000);
currentContainerIDs.push(containerID)

spawnContainer(pythonScript, containerID, currentContainerIDs)