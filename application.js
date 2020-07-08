"use strict";
import config from 'config';
import express from "express";

//uncaught exception
process.on("uncaughtException", (error) => {
    if (_logEnabled)
        console.log(error);
    Mongo.ContiMongo.Close();
    process.exit(1);
});

//Interrupt signal handling
process.on('SIGINT', function () {
    Mongo.ContiMongo.Close();
    process.exit(0);
});

//Termination signal handling
process.on('SIGTERM', function () {
    Mongo.ContiMongo.Close();
    process.exit(0);

});

//Debug end
process.once('SIGUSR2', function () {
    Mongo.ContiMongo.Close();
    process.kill(process.pid, 'SIGUSR2');
});

export class WebServerApi {

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


