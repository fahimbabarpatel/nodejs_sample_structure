"use strict";

import config from 'config';
import cluster from 'cluster';
import os from 'os';
import express from "express";
import  bodyParser from "body-parser";
import https from "https";


class WebServerApi {

    constructor(app) {
        //// console.log("inside web server api constructor");
        this.configureExpressRoute();
        this.webServerPort = config.get("webServerPort");
        this.configureMiddleware(app);
        this.configureBodyParser(app);
        this.configureRoutes(app);
        this.app = app;
    }

    configureExpressRoute() {
        //// console.log("inside ConfigureExpressRoute");
        this.router = express.Router();
    }
    configureBodyParser(app) {
        //// console.log("Inside Body-Parser");
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: false }));
    }

    configureMiddleware(app) {
        //// console.log("inside configureMiddleware");
        app.use(this.allowCrossDomain);
    }

    configureRoutes(app) {
        //// console.log("Inside ConfigureRoutes");
        app.use("/api/", this.router);
        // this.objDashboardRouter = new DashboardRouter(this.router);
    }
    run() {
        if (config.has("HTTPSKeyPath") && config.has("HTTPSCertPath")) {
            var options = {
                key: fs.readFileSync(config.get("HTTPSKeyPath")),
                cert: fs.readFileSync(config.get("HTTPSCertPath")),
                secureProtocol: 'SSLv23_server_method',
                secureOptions: constants.SSL_OP_NO_SSLv3 | constants.SSL_OP_NO_TLSv1,
                requestCert: false,
                rejectUnauthorized: false,
                ca: []
            }

            if (config.has("HTTPSCaPath")) {
                options.ca.push(fs.readFileSync(config.get("HTTPSCaPath")));
            }

            https.createServer(options, this.app).listen(this.webServerPort, function () {
                if (_logEnabled) console.log(`HTTPS:  is running on port : ${this.webServerPort}`);
            }.bind({ webServerPort: this.webServerPort }));
        } else {
            this.app.listen(this.webServerPort, function () {
            console.log("HTTP is running on port : " + this.webServerPort);
            }.bind({ webServerPort: this.webServerPort }));
        }
        this.app.on('connection', (socket) => {
            (socket ).setTimeout(60000);
        });
    }

    allowCrossDomain(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
        res.header("Access-Control-Allow-Headers", "Content-Type,Authorization,Cache-Control,Pragma,Expires");
        next();
    }
}


const numCPUs = os.cpus().length;

let workers = [];
let clusterNodes = 0;
const defaultNodes = 1;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    clusterNodes = config.has("clusterNodes") ? config.get("clusterNodes") : defaultNodes;
    // sanitize cluster nodes
    clusterNodes = (clusterNodes <= 0 || clusterNodes > numCPUs) ? defaultNodes : clusterNodes;
    console.log(`Master cluster setting up ${clusterNodes} workers`);

    // iterate on number of cores need to be utilized by an application
    for (let i = 0; i < clusterNodes; i++) {
        // creating workers and pushing reference in an array
        // these references can be used to receive messages from workers
        workers.push(cluster.fork());

        // to receive messages from worker process
        workers[i].on('message', function (message) {
            console.log(message);
        });
    }

    // process is clustered on a core and process id is assigned
    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is listening');
    });

    // if any of the worker process dies then start a new one by simply forking another one
    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        workers.push(cluster.fork());
        // to receive messages from worker process
        workers[workers.length - 1].on('message', function (message) {
            console.log(message);
        });
    });
} else {
    const app = express();
    let api = new WebServerApi(app);
    api.run();
}


