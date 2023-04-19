import { getSpreadsheetData } from "./filedata.js";
import { getArrayFromColumn } from "./crawler.js";
import bot from "./app.js";

// Send new rows to Telegram
const sendNewRowsToTelegram = async (spreadsheetId, sheetName, triggerColumn, chatId, bot) => {
    const rowTexts = [];
  
    // Get array of trigger values in column
    const triggerArray = await getArrayFromColumn(spreadsheetId, sheetName, triggerColumn);
  
    // Find row numbers where trigger value is "new"
    const newRows = triggerArray
      .map((value, index) => value === "new" ? index + 1 : null)
      .filter(value => value !== null);
  
    // Get row data for each row number
    const rowPromises = newRows.map(rowNumber => {
      const range = `${sheetName}!A${rowNumber}:I${rowNumber}`;
      return getSpreadsheetData(spreadsheetId, range);
    });
    const rowDataArray = await Promise.all(rowPromises);
  
    // Build row text for each row data
    rowDataArray.forEach((rowData, index) => {
      if (rowData.values && rowData.values.length > 0) {
        const rowNumber = newRows[index];
        const rowText = `Купити ділянку № ${rowNumber} | ${rowData.values[0].join(" | ")}`;
        rowTexts.push(rowText);
  
        // Send row text to Telegram
        bot.sendMessage(chatId, rowText, {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "Купити ділянку",
                  callback_data: `buy_${rowNumber}`
                }
              ]
            ]
          }
        });
  
        // Log the callback data to the console
        //console.log(`Callback data for row ${rowNumber}: buy_${rowNumber}`);
      }
    });
  };
      
export {
    sendNewRowsToTelegram,
}
  