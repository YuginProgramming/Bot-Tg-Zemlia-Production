import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
dotenv.config();
const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });
export default bot;

import { sendToBaseMessageId } from './writegoog.js'
import { getSpreadsheetData } from "./filedata.js";
import { anketa, anketaListiner } from './anketa.js';
anketa();
anketaListiner();
const chatIdTest = '-1001938112685'; // поки використовується як чат для логів
const chatId = '-1001783798562'; // ID каналу
export const spreadsheetId = "1ORjtAykJySO0pzbmXO7LX9DAog5GqBZ_2NYh_89SRKA";
  
//============ це код відправки рядка в канал
//перевірка чи цифра і вичитка рядка цифри
bot.on('message', async (message) => {
  try {
    // Check if message contains a valid number
    const rowNumber = parseInt(message.text);
    if (isNaN(rowNumber)) {
      throw new Error('Invalid row number');
    }

    const range = `post!A${rowNumber}:I${rowNumber}`;
    const data = await getSpreadsheetData(spreadsheetId, range);

    if (data.values && data.values.length > 0) {
      const message = data.values[0].join(' | ');
      const button = {
        text: 'Скористайтеся ботом, щоб зробити замовлення',
        url: 'https://t.me/api_gog_bot'
      };
      const keyboard = {
        inline_keyboard: [[button]]
      };

      const sentMessage = await bot.sendMessage(chatId, message, { reply_markup: keyboard });
      await sendToBaseMessageId(sentMessage.message_id, rowNumber);
    } else {
      throw new Error('Row not found');
    }
  } catch (error) {
    if (error.message === 'Invalid row number') {
      //await bot.sendMessage(chatIdTest, 'Sorry, please enter a valid row number');
    } else if (error.message === 'Row not found') {
      //await bot.sendMessage(chatIdTest, 'Sorry, the specified row was not found');
    } else {
      console.error(error);
      //await bot.sendMessage(chatIdTest, 'Sorry, there was an error processing your request');
    }
  }
});