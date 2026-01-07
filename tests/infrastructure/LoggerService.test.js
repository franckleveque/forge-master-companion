// tests/infrastructure/LoggerService.test.js

import { LoggerService } from '../../src/infrastructure/LoggerService.js';

describe('LoggerService', () => {
    let logger;

    beforeEach(() => {
        logger = new LoggerService();
    });

    test('should add a log message', () => {
        logger.log('Test message');
        expect(logger.getLogs()).toEqual(['Test message']);
    });

    test('should return all log messages', () => {
        logger.log('Message 1');
        logger.log('Message 2');
        expect(logger.getLogs()).toEqual(['Message 1', 'Message 2']);
    });

    test('should clear all log messages', () => {
        logger.log('Message 1');
        logger.clear();
        expect(logger.getLogs()).toEqual([]);
    });
});
