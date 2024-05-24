const Docker = require('dockerode');
const WebSocket = require('ws');
const docker = new Docker();

// WebSocket server setup
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received:', message);
        spawnContainer(message, 123, [], ws);
    });
});

function spawnContainer(code, containerID, currentContainerIDs, ws) {
    docker.createContainer({
        Image: 'python',
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        Tty: true,
        OpenStdin: true,
        name: containerID,
        Cmd: ['python', '-c', code]
    }, function (err, container) {
        if (err) {
            console.error(err);
            ws.send(JSON.stringify({ error: err.message }));
            return;
        }

        container.start(function (err, data) {
            if (err) {
                console.error(err);
                ws.send(JSON.stringify({ error: err.message }));
                return;
            }

            container.attach({ stream: true, stdout: true, stderr: true, stdin: true }, function (err, stream) {
                if (err) {
                    console.error(err);
                    ws.send(JSON.stringify({ error: err.message }));
                    return;
                }

                ws.on('message', function incoming(message) {
                    stream.write(message);
                });

                stream.on('data', function (data) {
                    ws.send(data.toString());
                });

                stream.on('end', function () {
                    container.wait(function (err) {
                        if (err) {
                            console.error(err);
                            ws.send(JSON.stringify({ error: err.message }));
                            return;
                        }

                        container.remove(function (err) {
                            if (err) {
                                console.error(err);
                                ws.send(JSON.stringify({ error: err.message }));
                            }

                            currentContainerIDs = currentContainerIDs.filter((item) => item !== containerID);
                            ws.send(JSON.stringify({ message: `Container ${containerID} removed` }));
                        });
                    });
                });
            });
        });
    });
}

module.exports = spawnContainer;
