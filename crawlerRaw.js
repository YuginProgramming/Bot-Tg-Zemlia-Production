import { getSpreadsheetData } from "./filedata.js";

  const searchForNew = async (spreadsheetId, range) => {
    const data = await getSpreadsheetData(spreadsheetId, range);
  
    if (data.values && data.values.length > 0) {
        const row = data.values[0]; // get the first row only
        for (let j = 0; j < row.length; j++) {
          const cell = row[j];
    
          if (cell.includes('new')) {
            return true;
          }
        }
      }
    
      return false;
    };


export { searchForNew };

// const spreadsheetId = "1ORjtAykJySO0pzbmXO7LX9DAog5GqBZ_2NYh_89SRKA";  
// const orderRaw = 5;
// const range = `post!L${orderRaw}:N${orderRaw}`;
// const hasNew = await searchForNew(spreadsheetId, range);
// console.log(hasNew);