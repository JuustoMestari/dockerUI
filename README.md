# dockerUI

### Features
With this version, you can :
* Create containers using your images and specify the container start parameters
* Start/Stop/Restart/Delete your container
* Configure exposed and host ports
* Search and download images available from https://registry.hub.docker.com/

### Configure

* Run the command on line 3 on your docker server to make the API available ( docker -H tcp://0.0.0.0:4243 -api-enable-cors -H unix:///var/run/docker.sock -d & )
* Edit the js/services.js file (line 5 & 6) with your docker's API address and the API version

> Feel free to contact me for more info !
