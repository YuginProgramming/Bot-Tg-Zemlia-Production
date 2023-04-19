import bot from "./app.js";
import { writeSpreadsheetData } from "./writegoog.js";
import { 
  sendToRawContact,
  sendToRawStatusReserve,
  sendToRawStatusDone
} from './writegoog.js'
import {sendNewRowsToTelegram} from "./checkNew.js";
import { changeMessage } from "./editChannel.js";
import { googleFindMessageId } from './crawler.js';
import { searchForNew } from './crawlerRaw.js';
import { getSpreadsheetData } from "./filedata.js";

const chatId = '-1001783798562';

let customerPhone;
let customerName;

const spreadsheetId = "1ORjtAykJySO0pzbmXO7LX9DAog5GqBZ_2NYh_89SRKA";
const data = [];

const phoneRegex = /^\d{10,12}$/;

const phrases = {
  greetings: 'Привіт, якщо ви хочете зробити замовлення, натисніть кнопку "Зробити замовлення".',
  contactRequest: 'Нам потрібні ваші контактні дані. Отримати з контактних даних телеграм?',
  dataConfirmation: `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`,
  thanksForOrder: `Замовлення успішно оформлено. Дякую ${customerName}`,
  wrongName: 'Невірне ім\'я. Будь ласка, введіть своє справжнє ім\'я:',
  wrongPhone: 'Невірний номер телефону. Будь ласка, введіть номер телефону ще раз:',
  phoneRules: 'Введіть ваш номер телефону без +. Лише цифри. І відправте повідомлення',
  nameRequest: 'Введіть своє ім\'я:',
};

const keyboards = {
  startingKeyboard: [['Зробити замовлення']],
  contactRequest: [
    [
      {
        text: 'Так',
        request_contact: true,
      }
    ],
    ['Ні, я введу номер вручну'],
    ['/start'],
  ],
  dataConfirmation: [
    ['Так, Оформити замовлення'],
    ['Ні, повторити введення'],
    ['/start'],
  ],
  enterPhone: [
    ['/start']
  ]
}

const anketa = () => {
    bot.onText(/\/start/ , (msg) => {
        customerPhone = undefined;
        customerName = undefined
    bot.sendMessage(msg.chat.id, phrases.greetings, {
        reply_markup: {
        keyboard: keyboards.startingKeyboard,
        resize_keyboard: true,
        one_time_keyboard: true
    }
  });
});
};

const anketaListiner = async() => {

//code working with buttons below lots

let selectedOrderRaw;
bot.on("callback_query", async (query) => {
  const callbackData = query.data;
  const chatId = query.message.chat.id;
  
  // Extract orderRaw from callbackData and store it in the global variable
  selectedOrderRaw = callbackData.split("_")[1];
  //console.log(selectedOrderRaw);

  const range = `post!L${selectedOrderRaw}:N${selectedOrderRaw}`;
  //await changeMessage(selectedOrderRaw);
      const statusNew = await searchForNew(spreadsheetId, range)
      const reservTemp = true;
      
      if (statusNew === false) {
        bot.sendMessage(chatId, 'є замовлення від іншого користувача');
    
      } else if (reservTemp === true) {
        sendToRawStatusReserve(selectedOrderRaw);
        bot.sendMessage(chatId, phrases.contactRequest, {
          reply_markup: {
          keyboard: keyboards.contactRequest,
          resize_keyboard: true,
          },
})
}
})

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const messageText = msg.text;

    if (messageText === 'Зробити замовлення') {
    await sendNewRowsToTelegram(spreadsheetId, 'post', 'N', chatId, bot);
    }
 
    else if (msg.contact) {  //тут іде по витяганню з контактів
      customerPhone = msg.contact.phone_number;
      customerName = msg.contact.first_name;
      //console.log(customerPhone)
      bot.sendMessage(chatId, `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?`, 
      {
        reply_markup: {
          keyboard: keyboards.dataConfirmation,
          resize_keyboard: true,
          one_time_keyboard: true
        },
      });
    } else if(messageText === 'Так, Оформити замовлення') {
      
      // переписати функції запису даних згідно рядка а не колонки
      await sendToRawContact(customerPhone, customerName, selectedOrderRaw);
      await sendToRawStatusDone(selectedOrderRaw);

      //====================
      const range = `post!A${selectedOrderRaw}:I${selectedOrderRaw}`;
      const data = await getSpreadsheetData(spreadsheetId, range);

      if (data.values && data.values.length > 0) {
      const message = data.values[0].join(' | ');
      const idToDelete = await googleFindMessageId(selectedOrderRaw)
      await changeMessage(idToDelete, message);
      }
      //=====================

      
      bot.sendMessage(chatId, `Замовлення успішно оформлено. Дякую ${customerName}`);

    } else if (messageText === 'Почати спочатку') {
      bot.sendMessage(chatId, '/start');
      //тут іде по самостійному введенню
    } else if(messageText === `Ні, я введу номер вручну` || messageText === 'Ні, повторити введення') {
      customerPhone = undefined;
      customerName = undefined;  
      bot.sendMessage(chatId, phrases.phoneRules, 
        {
          reply_markup: {
          keyboard: keyboards.enterPhone,
          resize_keyboard: true,
          },
        });
    } else if (phoneRegex.test(messageText)) {
      customerPhone = messageText;
      bot.sendMessage(chatId, phrases.nameRequest);
    } else if (customerPhone && customerName == undefined ) {
      if (messageText.length >= 2) {
      customerName = messageText;
      bot.sendMessage(chatId, `Ваш номер телефону: ${customerPhone}. Ваше імя ${customerName}. Дані вірні?` , {
        reply_markup: {
          keyboard: keyboards.dataConfirmation,
          resize_keyboard: true,
          one_time_keyboard: true
        },
      });
      }
    } 
});
};

export {
    anketa,
    anketaListiner,
  };