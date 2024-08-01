"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Docker = require('dockerode');
const { spawn } = require('child_process');
const docker = new Docker();
function spawnContainer(code, containerID, currentContainerIDs) {
    docker.createContainer({
        Image: 'python',
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        AttachStream: true,
        Tty: true,
        OpenStdin: true,
        name: containerID,
        Cmd: ['python', '-c', code]
    }, function (err, container) {
        if (err) {
            console.error(err);
            return;
        }
        container.start(function (err, data) {
            //     if(err) {
            //         console.error(err);
            //         return;
            //     }
            //     spawn(`docker attach ${containerID}`, {
            //         stdio: 'inherit',
            //         shell: true
            //     });
            //     container.wait(function(err: any ) {
            //         if (err) {
            //             console.error(err);
            //             return;
            //         }
            //         container.remove(function(err: any) {
            //             if (err) {
            //                 console.error(err);
            //                 currentContainerIDs = currentContainerIDs.filter((item: number )=> item !== containerID); //Remove ID from current running containers
            //                 return;
            //             }
            //         });
            //         });
        });
    });
}
exports.default = spawnContainer;
