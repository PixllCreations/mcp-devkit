import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger } from '../logger.js';

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('verbose mode', () => {
    it('should log debug messages when verbose is true', () => {
      const logger = new Logger(true);
      
      logger.debug('Test debug message', 'arg1', 'arg2');
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG]'),
        'Test debug message',
        'arg1',
        'arg2'
      );
    });

    it('should not log debug messages when verbose is false', () => {
      const logger = new Logger(false);
      
      logger.debug('Test debug message');
      
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('info logging', () => {
    it('should log info messages', () => {
      const logger = new Logger(false);
      
      logger.info('Test info message', 'extra arg');
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test info message',
        'extra arg'
      );
    });
  });

  describe('warn logging', () => {
    it('should log warning messages', () => {
      const logger = new Logger(false);
      
      logger.warn('Test warning message');
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[WARN]'),
        'Test warning message'
      );
    });
  });

  describe('error logging', () => {
    it('should log error messages with Error objects', () => {
      const logger = new Logger(false);
      const testError = new Error('Test error');
      
      logger.error('Something went wrong', testError);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Something went wrong'
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Test error')
      );
    });

    it('should log error messages with string errors', () => {
      const logger = new Logger(false);
      
      logger.error('Something went wrong', 'Simple error string');
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        'Something went wrong'
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Simple error string')
      );
    });

    it('should log error stack trace in verbose mode', () => {
      const logger = new Logger(true);
      const testError = new Error('Test error');
      testError.stack = 'Test stack trace';
      
      logger.error('Something went wrong', testError);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Test stack trace')
      );
    });

    it('should not log stack trace in non-verbose mode', () => {
      const logger = new Logger(false);
      const testError = new Error('Test error');
      testError.stack = 'Test stack trace';
      
      logger.error('Something went wrong', testError);
      
      expect(consoleSpy.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Test stack trace')
      );
    });
  });

  describe('success logging', () => {
    it('should log success messages', () => {
      const logger = new Logger(false);
      
      logger.success('Operation completed', 'successfully');
      
      expect(consoleSpy.log).toHaveBeenCalledWith(
        expect.stringContaining('[SUCCESS]'),
        'Operation completed',
        'successfully'
      );
    });
  });

  describe('default verbose setting', () => {
    it('should default to non-verbose mode', () => {
      const logger = new Logger();
      
      logger.debug('Test debug message');
      
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });
});