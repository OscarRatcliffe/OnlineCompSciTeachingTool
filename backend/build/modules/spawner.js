import Docker from 'dockerode';
const docker = new Docker();
function spawnContainer(code, containerID, currentContainerIDs) {
    //Container Properties
    docker.createContainer({
        Image: 'python',
        AttachStdout: true,
        AttachStderr: true,
        AttachStdin: true,
        name: containerID.toString(),
        Cmd: ['python', '-c', code]
    }, async function (err, container) {
        // Run container
        await container.start();
        // Wait for container to finish running
        await container.wait();
        //Record container output
        const logs = await container.logs({ stdout: true, stderr: true });
        return logs.toString();
        // Delete container once code has run
        await container.remove();
        currentContainerIDs = currentContainerIDs.filter((item) => item !== containerID); //Remove ID from current running containers
    });
}
export default spawnContainer;
