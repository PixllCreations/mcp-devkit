import chalk from 'chalk';

export class Logger {
  constructor(private verbose: boolean = false) {}

  debug(message: string, ...args: unknown[]): void {
    if (this.verbose) {
      console.log(chalk.gray('[DEBUG]'), message, ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    console.log(chalk.blue('[INFO]'), message, ...args);
  }

  warn(message: string, ...args: unknown[]): void {
    console.log(chalk.yellow('[WARN]'), message, ...args);
  }

  error(message: string, error?: unknown): void {
    console.error(chalk.red('[ERROR]'), message);
    
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (this.verbose && error.stack) {
        console.error(chalk.gray(error.stack));
      }
    } else if (error) {
      console.error(chalk.red(String(error)));
    }
  }

  success(message: string, ...args: unknown[]): void {
    console.log(chalk.green('[SUCCESS]'), message, ...args);
  }
}

export const logger = new Logger();