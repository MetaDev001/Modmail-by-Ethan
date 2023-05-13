const { CommandInteraction,EmbedBuilder } = require("discord.js")
const moduses = require('../../Schemas/modmailuses');
const modschema = require('../../Schemas/modmailschema');

module.exports = {
  name: "messageCreate",
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  async execute(message, client) {
        if (message.author.bot) return;
    if (!message.guild) return;

    const data = await modschema.findOne({ Guild: message.guild.id });
    if (!data) return;

    const sendchanneldata = await moduses.findOne({ Channel: message.channel.id });
    if (!sendchanneldata) return;

    const sendchannel = await message.guild.channels.cache.get(sendchanneldata.Channel);
    const member = await message.guild.members.cache.get(sendchanneldata.User);
    if (!member) return await message.reply(`⚠ <@${sendchanneldata.User} is **not** in your **server**!`)

    const msgembed = new EmbedBuilder()
    .setColor("#ecb6d3")
    .setAuthor({ name: `${message.author.username}`, iconURL: `${message.author.displayAvatarURL()}`})
    .setFooter({ text: `Modmail Received - ${message.author.id}`})
    .setTimestamp()
    .setDescription(`${message.content || `**No message provided.**`}`)

    if (message.attachments.size > 0) {

        try {
            msgembed.setImage(`${message.attachments.first()?.url}`);
        } catch (err) {
            return message.react('❌')
        }

    }

    try {
        await member.send({ embeds: [msgembed] });
    } catch (err) {
        message.reply(`⚠ I **couldn't** message **<@${sendchanneldata.User}>**!`)
        return message.react('❌')
    }
            
    message.react('📧')
  }
}