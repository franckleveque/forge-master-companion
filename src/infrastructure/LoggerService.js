// src/infrastructure/LoggerService.js

export class LoggerService {
    constructor() {
        this.logs = [];
    }

    log(message) {
        this.logs.push(message);
    }

    getLogs() {
        return this.logs;
    }

    setLogs(logs) {
        this.logs = logs;
    }

    clear() {
        this.logs = [];
    }
}
