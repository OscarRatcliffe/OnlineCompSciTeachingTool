const Docker = require('dockerode');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const fs = require('fs');
const docker = new Docker();

const pythonScript = fs.readFileSync('test.py', 'utf8');

// WebSocket server setup
const ws = new WebSocket.Server({ port: 8080 });

ws.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        // console.log('received:', message);
    });
});

docker.createContainer({
    Image: 'python',
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    Tty: true,
    OpenStdin: true,
    name: "PLEASECHANGEME",
    Cmd: ['python', '-c', pythonScript]
}, function(err, container) {

        if(err) {
            console.error(err)
            return;
        }

    container.start(function(err, data) {1

        if(err) {
            console.error(err);
            return;
        }

        // spawn('docker attach PLEASECHANGEME', {
        //     stdio: 'inherit',
        //     shell: true
        // });
        
        container.attach({ stream: true, stdout: true, stderr: true, stdin: true }, function (err, stream) {
            
            if (err) {
                console.error(err);
                return;
            }

            // ws.on('message', function incoming(message) {
            //     console.log(message);
            //     stream.write(message);
            // });

            stream.on('data', function (data, ws) {
                console.log(data.toString())

                console.log("Writing data to stream...")
                stream.write("Testing")
                // ws.send(data.toString());
            });

                // container.remove(function(err) {
                //     if (err) {
                //         console.error(err);
                //         return;
                //     }
                // });
        })
    })
});
