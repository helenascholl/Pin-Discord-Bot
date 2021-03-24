import * as Discord from 'discord.js';
import * as dotenv from 'dotenv';

dotenv.config();

const POLL_TIME = 5 * 60 * 1000;
const MIN_VOTES = 3;

const token = process.env['NODE_ENV'] === 'development' ?
  process.env['DISCORD_DEV_TOKEN'] :
  process.env['DISCORD_PROD_TOKEN'];
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user!.tag}`);

  client.user!.setActivity('to !pin', { type: 'LISTENING' })
    .catch(console.error);
});

client.on('message', async message => {
  if (message.content === '!pin' && message.reference && message.reference.messageID) {
    const originalMessage = await message.channel.messages.fetch(message.reference.messageID);

    if (originalMessage) {
      const poll = await message.channel.send('Pin it?');
      await poll.react('📌');

      const collected = await poll.awaitReactions(r => r.emoji.name === '📌', { time: POLL_TIME });

      if (collected.get('📌') && (collected.get('📌')!.count ?? 0 > MIN_VOTES)) {
        await originalMessage.pin();
      }
    }
  }
});

client.login(token).catch(console.error);
