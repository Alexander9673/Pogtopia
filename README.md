# Pogtopia
A simple to use API for creating private servers for Growtopia with nodejs.

## Documentation
The documentation [here](https://pogtopia.js.org) matches the code on the **Github** repo and not on NPM.

## Installations
**Requirements**  
  - `node-gyp`  
  - Python **2.7** (3+ can be used)  
  - Windows Build Tools/Build Essential  
	- NodeJS v14+  
	- MongoDB  
	- Redis Server

**Installing the Requirements**
Simply run this as Administrator in Windows Powershell,  
`$ npm install windows-build-tools node-gyp -g`  

If on Linux, simply install `build-essential` first with,  
`$ sudo (yum/apt-get/etc...) install build-essential`  

After that, install node-gyp by doing  
`$ npm install node-gyp -g`  

After installing everything (windows or linux), simply run  
`$ npm install pogtopia` to install the latest version on NPM, or  
`$ npm install Alexander9673/Pogtopia` to install the version on Github.

## Example
```js
const Pogtopia = require("pogtopia");
const { readFileSync } = require("fs");
const server = new Pogtopia.Server({
	server: {
		port: 17091, // set port to 17091,
		cdn: { // CDN Options for the server, this will not be updated, you will have to find the CDN yourselves.
			host: "ubistatic-a.akamaihd.net",
			url: "0098/87996/cache/"
		},
		itemsDatFile: "/path/to/items.dat", // Path to items.dat
		serverDatFile: "/path/to/your/server.dat" // Optional. The path to the server.dat file
	}
});

// uncomment this line to enable the built-in HTTP Server
// Pogtopia.Http.start({ serverIP: "127.0.0.1", serverPort: 17091, httpsEnabled: false });

server.setHandler("connect", (peer) => peer.requestLoginInformation()); // request login information from the peer

server.setHandler("disconnect", (peer) => {}); // handle peer disconnections

server.setHandler("receive", (peer, packet) => {
	// handle packets here
});

server.start();
```  
Check the `js/tests/server.js` file for a much better example.  

## Custom Cache
You can implement a custom cache instead of redis.  
When implementing your own cache, you have to have these methods with these return types:  
```ts
public set: (key: string, val: string) => void
public get: (key: string) => any
public del: (key: string) => void
public keys: (pattern: string) => string[]
```  
If you are wondering why the return type for `get` is `any`, it's because the value can be anything from js objects, to js arrays. Anything that can be parsed from a JSON string is converted.

## Questions
Join our **[Discord Server](https://discord.gg/S7WKAeh)** about questions.