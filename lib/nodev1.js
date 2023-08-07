const express = require('express'),
    path = require('path'),
    commander = require('commander');
const utils = require('./utils');

class ExpressApp {
    constructor(context) {
        this.options = context.options;
        this.express = express;
        this.app = express();
        this.router = express.Router();
        this.defaultRoute = this.options.defaultRoute || '/';
        this.app.use(this.express.json({
            limit: '10Mb'
        }))
        this.app.use(this.express.urlencoded({
            limit: '10Mb',
            extended: true
        }));

        this.appName = this.options.appName || path.basename(process.argv[1], '.js');
    }

    run() {
        this.initExpress();
        this.startExpressApp();
        return this;
    }



    initExpress() {
        const app = this.app,
            router = this.router;

        this.registerRoutes();
        app.use(this.defaultRoute, router);
        this.registerErrorRoutes(app);
    }

    /**
    * Override this method to register routes.
    */
    registerRoutes() {
    }

    registerErrorRoutes(app) {
        // 1. to handle any app level error
        app.use((err, req, res, next) => {
            const errorData = { error: err.message || 'Unexpected Error' }
            res.status(500).json(errorData);
        })

        // 2. to handle any wildcard route
        app.use('*', (req, res) => {
            res.status(404).json({ message: 'Wrong Page' });
        })
    }

    startExpressApp() {
        const { app, options } = this;
        let server = app;

        app.server = server.listen(options.port, () => {
            console.log(`Running on'http'://*:${options.port}/`);
        }).on('error', (e) => {
            console.error(`Could not start Express server, code: ${e.code}`, e, {});
            process.exit(1);
        })

        let timeout = options.serverSocketTimeout;
        if (timeout) {
            app.server.timeout = timeout * 1000;
        }
        console.error(`Server socket inactivity timeout is ${app.server.timeout / 1000} seconds for incoming connections`);
    }
}


const initDefaultOptions = (defaultPort = 0) => {
    const cmd = new commander.Command(),
        port = defaultPort;
    const expressService = (defaultPort !== 0);
    if (expressService) {
        cmd.option('--port [port]', `Port number [${port}]`, utils.parseInteger, `${port}`)
    }
    addStandardAppOptions(cmd);
    cmd.usage('[options]');
    return cmd;
}



const addStandardAppOptions = (cmd) => {
    return cmd
        .option('--app-name <app-name>', 'Application name')
        .option('--default-route <mount-path>', 'Path to prefix all URLs', '/')

}

const initialze = async (options) => {
    let context = { options: options || {} }
    return context;
}


const initValidateOptions = (...mandatoryOptions) => {
    return (context) => {
        const options = context.options || {};
        const missingFields = mandatoryOptions.filter(option => !options[option]);
        if (missingFields.length > 0) {
            return Promise.reject(`Command line options missing : ${missingFields.join(',')}`);
        }
        return context;
    }
}



module.exports = {
    ExpressApp,
    initialze,
    initDefaultOptions,
    initValidateOptions
}