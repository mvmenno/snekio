# SnekIO

## Install
First run ``` npm install ```

## Running the client
The client can be run directly in the browser by visiting:
``` client/dist/index.html ```

## Running the server
Build the docker image first
``` docker build -t mvmenno/snekio-server server/. ```
Run the docker image
``` docker run -d -p 5000:5000 mvmenno/snekio-server ``` 
