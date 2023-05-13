const { CommandInteraction,EmbedBuilder,ActionRowBuilder,ButtonBuilder,ButtonStyle } = require("discord.js")
const moduses = require('../../Schemas/modmailuses');
const modschema = require('../../Schemas/modmailschema');

module.exports = {
  name: "interactionCreate",
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  async execute(interaction, client) {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'selectmodmailmodal') {

        const data = await moduses.findOne({ User: interaction.user.id });
        if (data) return await interaction.reply({ content: `You have **already** opened a **modmail**! \n> Do **/modmail close** to close it.`, ephemeral: true });
        else {

            const serverid = interaction.fields.getTextInputValue('modalserver');
            const subject = interaction.fields.getTextInputValue('subject');

            const server = await client.guilds.cache.get(serverid);
            if (!server) return await interaction.reply({ content: `**Oops!** It seems like that **server** does not **exist**, or I am **not** in it!`, ephemeral: true });
            
            const executor = await server.members.cache.get(interaction.user.id);
            if (!executor) return await interaction.reply({ content: `You **must** be a member of **${server.name}** in order to **open** a **modmail** there!`, ephemeral: true});

            const modmaildata = await modschema.findOne({ Guild: server.id });
            if (!modmaildata) return await interaction.reply({ content: `Specified server has their **modmail** system **disabled**!`, ephemeral: true});
            
            const channel = await server.channels.create({
                name: `modmail-${interaction.user.id}`,
                parent: modmaildata.Category,

            }).catch(err => {
                return interaction.reply({ content: `I **couldn't** create your **modmail** in **${server.name}**!`, ephemeral: true});
            })
    
            await channel.permissionOverwrites.create(channel.guild.roles.everyone, { ViewChannel: false });

            const embed = new EmbedBuilder()
            .setColor("#ecb6d3")

            .setAuthor({ name: `Modmail System Opened`})
            .setTimestamp()
            .setTitle(`> ${interaction.user.username}'s Modmail`)
            .addFields({ name: `• Subject`, value: `> ${subject}`})

            const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                .setCustomId('deletemodmail')
                .setEmoji('❌')
                .setLabel('Delete')
                .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                .setCustomId('closemodmail')
                .setEmoji('🔒')
                .setLabel('Close')
                .setStyle(ButtonStyle.Secondary)
            )
        
            await moduses.create({
                Guild: server.id,
                User: interaction.user.id,
                Channel: channel.id
            })
            
            await interaction.reply({ content: `Your **modmail** has been opened in **${server.name}**!`, ephemeral: true});
            const channelmsg = await channel.send({ embeds: [embed], components: [buttons] });
            channelmsg.createMessageComponentCollector();

        }
    }
  }
}