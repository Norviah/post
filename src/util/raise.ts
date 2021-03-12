import { logger } from '../structs/logger';

/**
 * Prints the given message and then quits the program, the reason why we use
 * the logging to print as well is to save the error to a file.
 * @param  error The reason why the program must end.
 */
export function raise(error: string | Error): never {
  // As either a string or an error can be given, we'll initialize a variable to
  // represent the reason for the error.
  const reason: string = error instanceof Error ? error.message : error;

  const stack: string | undefined = error instanceof Error ? error.stack?.replace(`Error: ${reason}\n`, '') : undefined;

  logger.error(`${reason}${stack ? `\n${stack}\n` : ''}`, { subDir: 'errors' });

  process.exit();
}
