import { sheets_v4 } from 'googleapis';
import { Cell } from '../types/cell';

/**
 * Writes the given content to the cell of a given spreadsheet.
 * @param  client  The authorized Google client to use.
 * @param  id      The spreadsheet's ID.
 * @param  options Options regarding which cell to edit and what color to use.
 */
export async function read(client: sheets_v4.Sheets, id: string, options: Cell) {
  // In Google's API, when setting a range, the starting range is inclusive and
  // ending range is exclusive, so we'll add one to the ending values so only
  // one cell is affected when writing.

  const startColumnIndex: number = options.row;
  const endColumnIndex: number = options.row + 1;
  const startRowIndex: number = options.column;
  const endRowIndex: number = options.column + 1;

  const range: sheets_v4.Schema$GridRange = { startRowIndex, endRowIndex, startColumnIndex, endColumnIndex };

  // Return await client.spreadsheets.values.get({
  //   spreadsheetId: id,
  //   range,
  // });
}
