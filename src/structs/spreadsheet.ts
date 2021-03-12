import { sheets_v4 } from 'googleapis';
import { GaxiosResponse } from 'gaxios';

import { raise } from '../util/raise';
import { Cell } from '../types/cell';
import { config } from '../structs/config';

export class Spreadsheet {
  /**
   * The spreadsheet's ID.
   */
  readonly ID: string = config.id;

  /**
   * An authorized client with Google Spreadsheet's API.
   */
  public readonly client: sheets_v4.Sheets;

  /**
   * Represents the spreadsheet.
   */
  public spreadsheet!: GaxiosResponse<sheets_v4.Schema$Spreadsheet>;

  /**
   * Represents the sheet that we'll update data to.
   */
  public sheet!: sheets_v4.Schema$Sheet;

  /**
   * Represents about data from each cell within the sheet.
   */
  public rows: sheets_v4.Schema$RowData[] | undefined;

  /**
   * Represents the list of headers within the sheet.
   */
  public headers: (string | null | undefined)[] | undefined;

  /**
   * Initializes a new Spreadsheet instance.
   * @param client An authorized client with Google Spreadsheet's API.
   */
  constructor(client: sheets_v4.Sheets) {
    this.client = client;
  }

  /**
   * Represents if the spreadsheet is empty, essentially checking if any cell
   * within the spreadsheet has any type of data.
   */
  get empty(): boolean {
    return this.rows ? this.rows.length === 0 : true;
  }

  /**
   * As you can't have a constructor as an async method, we'll use a method as
   * an initializor for the instance.
   * @return        Nothing.
   */
  async update(): Promise<Spreadsheet> {
    // Using the client, we'll initialize a reference for the spreadsheet the
    // user wants to post data to.
    const spreadsheet = (this.spreadsheet = await this.client.spreadsheets.get({ spreadsheetId: config.id, includeGridData: true }).catch((e: Error) => raise(e)));

    // Once a spreadsheet is found, we'll try to find the sheet that the user
    // wants to post data to.
    const sheet: sheets_v4.Schema$Sheet | undefined = spreadsheet.data.sheets?.find((document) => document.properties?.title === config.title);

    if (!sheet) {
      raise(`The title '${config.title}' on the document '${config.id}' couldn't be found`);
    }

    this.sheet = sheet;

    // Represents an array consisting of data of every existing row in the
    // sheet.
    this.rows = sheet.data ? sheet.data[0].rowData : undefined;

    // As, usually, users put headers for columns as the first row, we'll
    // extract the first row into it's own variable.
    this.headers = this.rows ? this.rows[0]?.values?.map((cell: sheets_v4.Schema$CellData) => cell.effectiveValue?.stringValue) : undefined;

    return this;
  }

  /**
   * Writes the given content to the cell of a given spreadsheet.
   * @param  options Options regarding which cell to edit.
   */
  async write(options: Cell & { content: any }): Promise<void> {
    // In Google's API, when setting a range, the starting range is inclusive
    // and ending range is exclusive, so we'll add one to the ending values so
    // only one cell is affected when writing.

    const startColumnIndex = options.row;
    const endColumnIndex = options.row + 1;
    const startRowIndex = options.column;
    const endRowIndex = options.column + 1;

    const range: sheets_v4.Schema$GridRange = { startRowIndex, endRowIndex, startColumnIndex, endColumnIndex };

    // Next, we set an additional two values, one will be a string value
    // representing the object that we will edit, in dot notation.

    const fields: string = 'userEnteredValue.stringValue';

    // The other value will represent an actual object representation the value
    // that will be edited, which is the background color in this case.

    const data: sheets_v4.Schema$RowData = { values: [{ userEnteredValue: { stringValue: options.content } }] };

    await this.client.spreadsheets.batchUpdate({
      spreadsheetId: this.ID,
      requestBody: {
        requests: [
          {
            updateCells: { range, fields, rows: [data] },
          },
        ],
      },
    });

    // After a change has been made to the spreadsheet, we'll update the
    // properties of this instance to reflect the changes.
    await this.update();
  }
}
