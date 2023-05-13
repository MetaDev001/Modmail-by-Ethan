const { CommandInteraction, EmbedBuilder, } = require("discord.js")
const moduses = require('../../Schemas/modmailuses');
const modschema = require('../../Schemas/modmailschema');
const { createTranscript } = require("discord-html-transcripts");

module.exports = {
  name: "interactionCreate",
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  async execute(interaction, client) {
    if (interaction.customId === 'deletemodmail') {

      const closeembed = new EmbedBuilder()
        .setColor("#ecb6d3")

        .setAuthor({ name: `Modmail System Closed` })
        .setTimestamp()
        .setTitle('> Your modmail was Closed')
        .addFields({ name: `• Server`, value: `> ${interaction.guild.name}` })

      const delchannel = await interaction.guild.channels.cache.get(interaction.channel.id);

      const userdata = await moduses.findOne({ Channel: delchannel.id });

      await delchannel.send('❌ **Deleting** this **modmail**..')

      setTimeout(async () => {
        if (userdata) {
          const executor = await interaction.guild.members.cache.get(userdata.User)
          if (executor) {
            await executor.send({ embeds: [closeembed] });
            await moduses.deleteMany({ User: userdata.User });
          }
        }

        try {
          // Send the transcript as a file to the logs channel
          const modmailData = await modschema.findOne({ Guild: interaction.guild.id });
          
          if (!modmailData) return;
          
          const logsChannel = await interaction.guild.channels.cache.get(modmailData.Logs);
          
          if (!logsChannel) return;
          const embed = new EmbedBuilder()
            .setColor("#ecb6d3")
            .setAuthor({ name: `Modmail Logged`})
            .setTimestamp()
            .setTitle(`> ${delchannel.name} was logged`)
            .addFields({ name: `• Time Deleted`, value: `> <t:${Math.round(Date.now() / 1000)}:R>`})
            .addFields({ name: `• Deleted by`, value: `> ${interaction.user.username}`})

          const attachment = await createTranscript(delchannel, {
            limit: -1,
            returnType: "attachment",
            saveImages: true,
            minify: true,
            fileName: `${delchannel.name}-transcript.html`,
          });
          
          await logsChannel.send({
            content: "Modmail transcript:",
            files: [attachment],
            embeds: [embed]
          });

          await delchannel.delete();
        } catch (err) {
          console.log(err);
          return;
        }
      }, 100)

    }

    if (interaction.customId === 'closemodmail') {

      const closeembed = new EmbedBuilder()
        .setColor("#ecb6d3")

        .setAuthor({ name: `Modmail System Closed` })
        .setTimestamp()
        .setTitle('> Your modmail was Closed')
        .addFields({ name: `• Server`, value: `> ${interaction.guild.name}` })

      const clchannel = await interaction.guild.channels.cache.get(interaction.channel.id);
      const userdata = await moduses.findOne({ Channel: clchannel.id });

      if (!userdata) return await interaction.reply({ content: `🔒 You have **already** closed this **modmail**.`, ephemeral: true })

      await interaction.reply('🔒 **Closing** this **modmail**..')

      setTimeout(async () => {

        const executor = await interaction.guild.members.cache.get(userdata.User)
        if (executor) {

          try {
            await executor.send({ embeds: [closeembed] });
          } catch (err) {
            return;
          }

        }

        interaction.editReply(`🔒 **Closed!** <@${userdata.User}> can **no longer** view this **modmail**, but you can!`)

        await moduses.deleteMany({ User: userdata.User });

      }, 100)

    }
  }
}