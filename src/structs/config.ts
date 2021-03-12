import { Types, load } from '@norviah/config';
import { join } from 'path';
import { Config } from '../types/config';

import * as paths from '../util/paths';

// In order to load the config file, we must first create a typing object to
// be able to check the typings of the config file during run time.
const typings: { [key in keyof Required<Config>]: Types | Types[] } = {
  adress: 'string',
  port: 'number',
  id: 'string',
  title: 'string',
};

export const config = load<Config>(typings, { path: join(paths.config, 'config.json') });
