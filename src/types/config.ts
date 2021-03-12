export interface Config {
  /**
   * The address that you only want requests from.
   */
  address: string;

  /**
   * The port number to use for the server.
   */
  port: number;

  /**
   * The ID of the Google Spreadsheet.
   */
  id: string;

  /**
   * The title of the sheet to push data to.
   */
  title: string;
}
