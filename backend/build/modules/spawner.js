import Docker from 'dockerode';
const docker = new Docker();
function spawnContainer(code, containerID, currentContainerIDs) {
    //Container Properties
    docker.createContainer({
        Image: 'python',
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        Tty: true,
        OpenStdin: true,
        name: containerID.toString(),
        Cmd: ['python', '-c', code]
    }, function (err, container) {
        if (err) {
            console.error(err);
            return;
        }
        // Run container
        container.start(function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            container.wait(function (err) {
                if (err) {
                    console.error(err);
                    return;
                }
                // Delete container once code has run
                container.remove(function (err) {
                    if (err) {
                        console.error(err);
                        currentContainerIDs = currentContainerIDs.filter((item) => item !== containerID); //Remove ID from current running containers
                        return;
                    }
                });
            });
        });
    });
}
export default spawnContainer;
