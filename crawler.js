import { getSpreadsheetData } from "./filedata.js";

const getArrayFromColumn = async (spreadsheetId, sheetName, columnName) => {
    const range = `${sheetName}!${columnName}:${columnName}`;
    const data = await getSpreadsheetData(spreadsheetId, range);
    if (data.values && data.values.length > 0) {
      return data.values.map(row => row[0]);
    }
    return [];
};

const crawler = async (spreadsheetId, sheetName, triggerColumn) => {
  // Get array of trigger values in column
  const triggerArray = await getArrayFromColumn(spreadsheetId, sheetName, triggerColumn);
        
  // Find row numbers where trigger value is резерв
  const rowNumbers = triggerArray
    .map((value, index) => value === "reserve" ? index + 1 : null)
    .filter(value => value !== null);    
    if (rowNumbers.length > 0) {
      return false;
    } else {
      return true;
    }
};
  
const crawlerRaw = async (spreadsheetId, sheetName, triggerColumn) => {
  // Get array of trigger values in column
  const triggerArray = await getArrayFromColumn(spreadsheetId, sheetName, triggerColumn);
  
  // Find row numbers where trigger value is резерв
  const rowNumbers = triggerArray
    .map((value, index) => value === "reserve" ? index + 1 : null)
    .filter(value => value !== null);
    
  // Get row data for each row number
  const rowPromises = rowNumbers.map(rowNumber => {
    const range = `${sheetName}!A${rowNumber}:I${rowNumber}`;
    return getSpreadsheetData(spreadsheetId, range);
  });
  
  const rowDataArray = await Promise.all(rowPromises);
  
  // Print row data to console
  rowDataArray.forEach(rowData => {
    if (rowData.values && rowData.values.length > 0) {
      //console.log(rowData.values[0].join("\t"));
    }
  });
};

const crawlerStatusNew = async (spreadsheetId, sheetName, triggerColumn) => {
  // Get array of trigger values in column
  const triggerArray = await getArrayFromColumn(spreadsheetId, sheetName, triggerColumn);
        
  // Find row numbers where trigger value is резерв
  const rowNumbers = triggerArray
    .map((value, index) => value === "new" ? index + 1 : null)
    .filter(value => value !== null);    
    if (rowNumbers.length > 0) {
      return false;
    } else {
      return true;
    }
};

//  search value in specified cell
const getCellValue = async (spreadsheetId, sheetName, columnName, rowNumber) => {
  const range = `${sheetName}!${columnName}${rowNumber}`;
  const data = await getSpreadsheetData(spreadsheetId, range);
  if (data.values && data.values.length > 0) {
    return data.values[0][0];
  }
  return "";
};

const googleFindMessageId = async (rowNumber) => {
  const spreadsheetId = "1G_J_SOhLkYeO4UbLyWqqfFMYXc_N06_wPrxdaFL7_WQ";
  const sheetName = "post";
  const columnName = "L";
  const cellValue = await getCellValue(spreadsheetId, sheetName, columnName, rowNumber);
  //console.log(`googleFindMessageId: ${cellValue}`);
  return cellValue;
};

export {
  crawler,
  crawlerRaw,
  getArrayFromColumn,
  getSpreadsheetData,
  crawlerStatusNew,
  googleFindMessageId
};