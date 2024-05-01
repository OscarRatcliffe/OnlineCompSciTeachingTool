const Docker = require('dockerode');
const { stdout } = require('process');
const fs = require('fs');
const docker = new Docker();

const pythonScript = fs.readFileSync('test.py', 'utf8');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

docker.createContainer({
    Image: 'python',
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    Tty: false,
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

        const inputStream = process.stdin;

        container.logs({ follow: true, stdout: true, stderr: true }, function(err, stream) {
            if (err) {
              console.error(err);
              return;
            }

            container.modem.demuxStream(stream, process.stdout, process.stderr);
            });

          return sleep(1000).then(() => {
            container.remove();
          });

          
    })
});
