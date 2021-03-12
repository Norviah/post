import { path } from 'app-root-path';
import { join } from 'path';

/**
 * The absolute path for this project's root directory.
 */
export const root: string = path;

/**
 * The absolute path for the folder that holds config files.
 */
export const config: string = join(path, 'config');

export const backup: string = join(path, 'backup');
