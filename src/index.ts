import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

import { google, sheets_v4 } from 'googleapis';
import { inspect } from 'util';

import { authorize } from './util/authorize';
import { config } from './structs/config';
import { logger } from './structs/logger';
import { Spreadsheet } from './structs/spreadsheet';

import * as paths from './util/paths';

/**
 * Initializing the Express app.
 */
const app: express.Express = express();

/**
 * Here we ask the Express app to use Helmet to enhance the API's security.
 */
app.use(helmet());

/**
 * The main entry point for this program. As we must have await available, we'll
 * have to wrap the project witin an async function.
 */
async function main(): Promise<void> {
  // As we want to push any given members to a Google Spreadsheet, we'll have to
  // initialize a new Google client instance.
  const client: sheets_v4.Sheets = google.sheets({ version: 'v4', auth: await authorize(paths.config) });

  // Represents an instance referencing data from the spreadsheet that the user
  // wants to edit information in.
  const spreadsheet: Spreadsheet = new Spreadsheet(client);

  // After an instance is initialized, we'll need to have it update to get
  // information regarding the spreadsheet.
  await spreadsheet.update();

  app.post('/users', async (req, res) => {
    // Before we do anything, we'll check if any data was given.
    if (!Object.keys(req.query).length) {
      return res.sendStatus(200);
    }

    // Just in case anything happens, we'll first save the given data to a file.
    logger.log(`received POST data:\n${inspect(req.query)}\n`, { subDir: 'backups', noPrint: true });

    // If the document is empty, representing that no data exists within it,
    // we'll first populate the headers. Each given key within the query acts as
    // a header, and so we'll ensure each given key exists as a header.
    if (spreadsheet.empty) {
      /**
       * Represents the list of keys given within the query of the PUSH event,
       * each key is treated as a header within the Google Spreadsheet.
       */
      const headers: string[] = Object.keys(req.query);

      for (let i = 0; i < headers.length; i++) {
        await spreadsheet.write({ column: 0, row: i, content: headers[i] });
      }
    }

    // Whenever a POST is made, the given query is treated as the data that we
    // push to the spreadsheet. Each key within the query is treated as the
    // column header with the value representing, well, the value.

    // Before we continue, we'll need to ensure that each given key within the
    // query exists as a header.
    for (const key in req.query) {
      if (!spreadsheet.headers!.includes(key)) {
        // If the key doesn't exist as a header, we'll simply create it.
        await spreadsheet.write({ column: 0, row: spreadsheet.headers!.length, content: key });
      }
    }

    // As the spreadsheet instance updates itself after any changes has been
    // made, we'll keep a separate copy of the existing rows to determine where
    // to write values.
    const rows: sheets_v4.Schema$RowData[] = [...spreadsheet.rows!];

    // Now that we know each given key exists as a header, we'll write each
    // value within the query under the column for its header.
    for (const [key, value] of Object.entries(req.query)) {
      await spreadsheet.write({ column: rows!.length, row: spreadsheet.headers!.indexOf(key), content: value });
    }

    logger.log(`successfully saved data to column ${rows!.length}:\n${inspect(req.query, { depth: 1 })}\n`, { subDir: 'posts' });

    res.sendStatus(200);
  });

  app.listen(config.port, () => {
    logger.success(`listening on port: ${config.port}\n`);
  });
}

main();
