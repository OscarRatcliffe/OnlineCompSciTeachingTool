const Docker = require('dockerode');
const { exec } = require('child_process');
const fs = require('fs');
const { stdout } = require('process');
const docker = new Docker();

const pythonScript = fs.readFileSync('test.py', 'utf8');

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

    container.start(function(err, data) {

        if(err) {
            console.error(err);
            return;
        }

        exec("echo test", (stdout) => {

            console.log(stdout)

        })

        container.wait(function(err) {
            if (err) {
                console.error(err);
                return;
            }

            container.remove(function(err) {
                if (err) {
                    console.error(err);
                    return;
                }
            });
        });
    })
});

