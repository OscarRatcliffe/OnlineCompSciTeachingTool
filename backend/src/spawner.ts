const Docker = require('dockerode');
const { spawn } = require('child_process');
const docker = new Docker();

function spawnContainer(code: string, containerID: number, currentContainerIDs: any) {

docker.createContainer({
    Image: 'python',
    AttachStdout: true,
    AttachStderr: true,
    AttachStdin: true,
    Tty: true,
    OpenStdin: true,
    name: containerID,
    Cmd: ['python', '-c', code]

}, function(err: any, container: any) {

        if(err) {
            console.error(err)
            return;
        }

    container.start(function(err: any, data: any) {

        if(err) {
            console.error(err);
            return;
        }

        spawn(`docker attach ${containerID}`, {
            stdio: 'inherit',
            shell: true
        });

        container.wait(function(err: any ) {
            if (err) {
                console.error(err);
                return;
            }

            container.remove(function(err: any) {
                if (err) {
                    console.error(err);

                    currentContainerIDs = currentContainerIDs.filter((item: number )=> item !== containerID); //Remove ID from current running containers

                    return;
                }
            });
        });
    })
});
}

export default spawnContainer;