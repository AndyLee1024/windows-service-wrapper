const EventEmitter = require('events');
const execa = require('execa');
const wrapper = require('./wrapper');
const pRetry = require('p-retry');
const _ = require('lodash');

class Service extends EventEmitter {
    /**
     *
     Application
     AppParameters
     AppDirectory
     AppExit
     AppAffinity
     AppEnvironment
     AppEnvironmentExtra
     AppNoConsole
     AppPriority
     AppRestartDelay
     AppStdin
     AppStdinShareMode
     AppStdinCreationDisposition
     AppStdinFlagsAndAttributes
     AppStdout
     AppStdoutShareMode
     AppStdoutCreationDisposition
     AppStdoutFlagsAndAttributes
     AppStderr
     AppStderrShareMode
     AppStderrCreationDisposition
     AppStderrFlagsAndAttributes
     AppStopMethodSkip
     AppStopMethodConsole
     AppStopMethodWindow
     AppStopMethodThreads
     AppThrottle
     AppRotateFiles
     AppRotateOnline
     AppRotateSeconds
     AppRotateBytes
     AppRotateBytesHigh
     DependOnGroup
     DependOnService
     Description
     DisplayName
     ImagePath
     ObjectName
     Name
     Start
     Type
     *
     */
    constructor() {
        super();
        this.wrapper = new wrapper().executable();
    }

    async install({serviceName, executeFile, parameter} = {}) {
        const wrapper = this.wrapper;
        const run = async () => {
            const commands = [
                `${wrapper} install ${serviceName} ${executeFile}`,
                `${wrapper} set ${serviceName} AppParameters ${parameter}`
            ];

            for (const command of commands) {
                await execa.command(command)
            }

            this.emit('installed');
        };
        await run();
    }

    async set(serviceName, parameters = {}) {
        let commands = [];
        const wrapper = this.wrapper;

        for (let [key, value] of Object.entries(parameters)) {
            const command = `${wrapper} set ${serviceName} ${key} ${value}`
            commands.push(command);
        }

        for (const command of commands) {
            await execa.command(command)
        }
    }

    async start(serviceName) {
        await this.handle('start', serviceName);
    }

    async restart(serviceName) {
        await this.handle('restart', serviceName);
    }

    async stop(serviceName) {
        await this.handle('stop', serviceName);
    }

    async pause(serviceName) {
        await this.handle('pause', serviceName);
    }

    async continue(serviceName) {
        await this.handle('continue', serviceName);
    }

    async rotate(serviceName) {
        await this.handle('rotate', serviceName);
    }

    async remove(serviceName) {
        const cmd = async () => {
            const results = await execa(this.wrapper, ['remove', serviceName, 'confirm']);
            return results;
        };

        await pRetry(cmd, {
            onFailedAttempt: error => {
                console.log(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
            }, retries: 8
        });
    }

    async handle(operation, serviceName) {

        if (!_.includes(['start', 'restart', 'stop', 'pause', 'continue', 'rotate'], operation)) {
            throw new Error('Operation not allowed!')
        }

        const cmd = async () => {
            const results = await execa(this.wrapper, [operation, serviceName]);
            return results;
        };

        await pRetry(cmd, {
            onFailedAttempt: error => {
                console.log(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
            }, retries: 8
        });

        this.emit(operation);

    }
}

module.exports = Service;