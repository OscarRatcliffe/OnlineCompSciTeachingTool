import Docker from 'dockerode';
import { spawn } from 'child_process';
const docker = new Docker();

function spawnContainer(code: string, containerID: number, currentContainerIDs: any) {

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

}, function(err: any, container: any) {

        if(err) {
            console.error(err)
            return;
        }

    // Run container
    container.start(function(err: any, data: any) {

        if(err) {
            console.error(err);
            return;
        }

        container.wait(function(err: any ) {
            if (err) {
                console.error(err);
                return;
            }

            // Delete container once code has run
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