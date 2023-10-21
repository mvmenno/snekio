# SnekIO

## Install
First run ``` npm install ```

## Development
This project uses webpack simply run ```npm run watch``` in the root directory

## Running the client
The client can be run directly in the browser by visiting:
``` client/dist/index.html ```

## Running the server
Build the docker image first
``` docker build -t mvmenno/snekio-server server/. ```

Run the docker image
``` docker run -d -p 5000:5000 mvmenno/snekio-server ``` 

## Running the server without docker
run the following command ``` node server/dist/bundle.js ```
