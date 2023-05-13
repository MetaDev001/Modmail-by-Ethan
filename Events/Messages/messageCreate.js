const { CommandInteraction,EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle,ModalBuilder,TextInputBuilder,TextInputStyle } = require("discord.js")
const moduses = require('../../Schemas/modmailuses');

module.exports = {
  name: "messageCreate",
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  async execute(message, client) {
    
    if (message.guild) return;
    if (message.author.id === client.user.id) return;
    
    const usesdata = await moduses.findOne({ User: message.author.id });

    if (!usesdata) {

        message.react('👋')

        const modselect = new EmbedBuilder()
        .setColor("#ecb6d3")

        .setAuthor({ name: `Modmail System`})
        .setTimestamp()
        .setTitle('> Select a Server')
        .addFields({ name: `• Select a Modmail`, value: `> Please submit the Server's ID you are \n> trying to connect to in the modal displayed when \n> pressing the button bellow!`})
        .addFields({ name: `• How do I get the server's ID?`, value: `> To get the Server's ID you will have to enable \n> Developer Mode through the Discord settings, then \n> you can get the Server's ID by right \n> clicking the Server's icon and pressing "Copy Server ID".`})

        const button = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId('selectmodmail')
            .setLabel('• Select your Server')
            .setStyle(ButtonStyle.Secondary)
        )     

        const msg = await message.reply({ embeds: [modselect], components: [button] });
        const selectcollector = msg.createMessageComponentCollector();

        selectcollector.on('collect', async i => {

            if (i.customId === 'selectmodmail') {

                const selectmodal = new ModalBuilder()
                .setTitle('• Modmail Selector')
                .setCustomId('selectmodmailmodal')

                const serverid = new TextInputBuilder()
                .setCustomId('modalserver')
                .setRequired(true)
                .setLabel('• What server do you want to connect to?')
                .setPlaceholder('Example: "1078641070180675665"')
                .setStyle(TextInputStyle.Short);

                const subject = new TextInputBuilder()
                .setCustomId('subject')
                .setRequired(true)
                .setLabel(`• What's the reason for contacting us?`)
                .setPlaceholder(`Example: "I wanted to bake some cookies, but JASO0ON didn't let me!!!"`)
                .setStyle(TextInputStyle.Paragraph);

                const serveridrow = new ActionRowBuilder().addComponents(serverid)
                const subjectrow = new ActionRowBuilder().addComponents(subject)

                selectmodal.addComponents(serveridrow, subjectrow)

                i.showModal(selectmodal)

            }
        })

    } else {

        if (message.author.bot) return;

        const sendchannel = await client.channels.cache.get(usesdata.Channel);
        if (!sendchannel) {

            message.react('⚠')
            await message.reply('**Oops!** Your **modmail** seems **corrupted**, we have **closed** it for you.')
            return await moduses.deleteMany({ User: usesdata.User });

        } else {

            const msgembed = new EmbedBuilder()
            .setColor("#ecb6d3")
            .setAuthor({ name: `${message.author.username}`, iconURL: `${message.author.displayAvatarURL()}`})
            .setFooter({ text: `Modmail Message - ${message.author.id}`})
            .setTimestamp()
            .setDescription(`${message.content || `**No message provided.**`}`)

            if (message.attachments.size > 0) {

                try {
                    msgembed.setImage(`${message.attachments.first()?.url}`);
                } catch (err) {
                    return message.react('❌')
                }

            }

            const user = await sendchannel.guild.members.cache.get(usesdata.User)
            if (!user) {
                message.react('⚠️')
                message.reply(`⚠️ You have left **${sendchannel.guild.name}**, your **modmail** was **closed**!`)
                sendchannel.send(`⚠️ <@${message.author.id}> left, this **modmail** has been **closed**.`)
                return await moduses.deleteMany({ User: usesdata.User })
            }

            try {

                await sendchannel.send({ embeds: [msgembed] });

            } catch (err) {
                return message.react('❌')
            }
            
            message.react('📧')
        }
    }
  }
}