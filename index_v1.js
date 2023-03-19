// v1 answers any question in the specified channel and roles and models can be changed via commands

//added via Replit Secrets
const API_KEY = process.env['API_KEY'] //from https://platform.openai.com/account/api-keys
const CHANNEL_ID = process.env['CHANNEL_ID'] //from https://discord.com/developers/applications/
const TOKEN = process.env['TOKEN'] //from https://discord.com/developers/applications/

const { Client, IntentsBitField } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');
const keepAlive = require('./server');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('ready', () => {
  console.log('The bot is online!');
});

const configuration = new Configuration({
  apiKey: API_KEY,
});
const openai = new OpenAIApi(configuration);

let conversationLog = [{ role: 'system', content: 'You are a friendly chatbot.' }];

let model = 'gpt-3.5-turbo'; // default model

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== CHANNEL_ID) return;
  
  // Process commands
  if (message.content.startsWith('!')) {
    // Change role command
    if (message.content.startsWith('!change ')) {
      let customRole = message.content.slice(12); // get the custom role
      conversationLog = [{ role: 'system', content: `${customRole}` }];
      message.reply(`Role changed to '${customRole} Chatbot'.`);
      return;
    }
    
    // Help command
    if (message.content === "!help") {
      const listOfCommands =
        `\`\`\`
!change <role>      : Change the chatbot's role to the specified role.
!chatgpt3           : Switch to GPT-3.5 Turbo model.
!chatgpt4           : Switch to GPT-4 model.
!help               : Show an overview of all available commands.
\`\`\``;
      message.reply(listOfCommands);
      return;
    }
    
    // Switch to GPT-3.5 Turbo model
    if (message.content === "!chatgpt3") {
      model = 'gpt-3.5-turbo';
      message.reply(`Switched to GPT-3.5 Turbo model.`);
      return;
    }
    
    // Switch to GPT-4 model
    if (message.content === "!chatgpt4") {
      model = 'gpt-4';
      message.reply(`Switched to GPT-4 model.`);
      return;
    }
  }

  // Add user's Discord username to the conversation log
  conversationLog.push({
    role: 'user',
    content: `<${message.author.username}> ${message.content}`,
  });
  
  try {
    await message.channel.sendTyping();

    //bot reads previous 15 messages for context
    let prevMessages = await message.channel.messages.fetch({ limit: 15 });
    prevMessages.reverse();

    //all messages bot will ignore when getting context, !, other bots, other authors
    prevMessages.forEach((msg) => {
      if (message.content.startsWith('!')) return;
      if (msg.author.id !== client.user.id && message.author.bot) return;
      if (msg.author.id !== message.author.id) return;

      conversationLog.push({
        role: 'user',
        content: msg.content,
      });
    });

    //set openai model and other parameters
    const result = await openai
      .createChatCompletion({
        model: model,
        messages: conversationLog,
        // max_tokens: 256, // limit token usage
      })
      .catch((error) => {
        console.log(`OPENAI ERR: ${error}`);
      });

    message.reply(result.data.choices[0].message);
  } catch (error) {
    console.log(`ERR: ${error}`);
  }
});


client.login(TOKEN);
keepAlive();

