const { SlashCommandBuilder, CommandInteraction,EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
  .setName("help")
  .setDescription("Shows help message."),
  /**
   * 
   * @param {CommandInteraction} interaction 
   */
  execute(interaction) {

        const embed = new EmbedBuilder()
      .setTitle("Modmail Bot Help")
      .setDescription("Here is a list of all the commands you can use with the modmail bot:")
      .addFields({ name: 'ping', value: 'Sends a pong response.'})
      .addFields({ name: 'modmail setup', value: 'Creates a new modmail channel.'})
      .addFields({ name: 'modmail disable', value: 'Disables the modmail bot'})
      .addFields({ name: 'modmail close', value: 'Closes the current modmail channel.'})
      .addFields({ name: 'help', value: 'Shows this help message.'})
      .setColor(000000)
      .setFooter({ text: 'Made by Ethan' })
    
    interaction.reply({embeds: [embed]})
    
  }
}