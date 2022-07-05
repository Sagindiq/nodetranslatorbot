const TelegramBot = require('node-telegram-bot-api');
const translate = require('@vitalets/google-translate-api');

require('dotenv').config()

const Token = process.env.TOKEN

// const Token = "5416103021:AAFDhxfRDMh0_z9LKJ932Q2NaiQCm9S3gh0";
const {
  read,
  write
} = require('./utils/fs');

const bot = new TelegramBot(Token, {
  polling: true
});

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {

  const chatId = msg.chat.id;
  const resp = match[1];

  bot.sendMessage(chatId, resp);
});


bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;
  const message_id = msg.message_id;
  const nickName = msg.chat.first_name;
  const username = msg.chat.username;

  const slash = message.split('/')[1];

  const readData = read('users.json');
  const foundUser = readData.find(el => el.id == chatId)

  const languages = read('languages.json');
  const filterLanguage = languages.find(el => el.name == slash);

  async function myFunc(word) {

    const myData = readData.find(el => el.id == chatId);

    let response = await translate(word, {
      from: 'auto',
      to: myData.toTranslate
    })

    return bot.sendMessage(chatId, response.text)

  }

  if (!foundUser) {

    readData.push({
      id: chatId,
      toTranslate: null
    })

    write('users.json', readData)
    // return bot.sendMessage(chatId, `Assalomu aleykum ${nickName}`, {
    //   parse_mode: 'Markdown'
    // })

    return bot.sendPhoto(chatId, 'https://t.me/allMyMediaData/2', {
      caption: `Assalomu aleykum ${nickName} botimizga hush kelibsiz.\n\nSiz bu bot orqali google translate dan telegram bot orqali foydalanishingiz mumkin.\n\nKiritish tili auto tarjima qilish tilini /til_tanlash sozlamasi orqali sozlashingiz mumkin.`
    });
  }


  if (message == '/start' && foundUser) {
    return bot.sendPhoto(chatId, 'https://t.me/allMyMediaData/2', {
      caption: `Assalomu aleykum ${nickName}\nSizni botimizda qayta ko'rganimizdan hursandmiz.\n\nTil sozlamalarini o'zgartirish uchun /til_tanlash buyruqidan foydalanshingiz mumkin.`
    });

  } 
  
  else if (filterLanguage) {

    const findIndex = readData.findIndex(el => el.id == chatId);
    const doesTranslate = readData.find(el => el.toTranslate == slash)
    let count = 0;

    if (doesTranslate && count == 0) {
      bot.sendMessage(chatId, 'Sizning tarjima qilish tilingiz allaqachon ingliz tilida edi')
    }

    if (!doesTranslate) {
      const changeData = {
        ...readData[findIndex],
        toTranslate: slash
      }

      count = 1;

      readData.splice(findIndex, 1, changeData);
      write('users.json', readData);

      bot.sendMessage(chatId, `Tarjima qilish tili ingliz tiliga o'zgardi`, {
        parse_mode: 'Markdown'
      })
    }

  }

  else if(message == '/til_tanlash') {

    bot.sendMessage(chatId, `Til sozlamalari:\n ${
      languages.map(el =>  {
        return `til: ${el.full_name} /${el.name} \n`
      })
    }`)
  }
  
  else {
    myFunc(message);
  }

});
