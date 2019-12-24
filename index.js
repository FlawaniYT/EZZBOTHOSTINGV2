const { Client, RichEmbed, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");
const moment = require('moment')


const client = new Client({
    disableEveryone: true
});

client.commands = new Collection();
client.aliases = new Collection();

client.categories = fs.readdirSync("./commands/");

config({
    path: __dirname + "/.env"
});

["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

let userApplications = {}

client.on("message", function(message) {
  if (message.author.equals(client.user)) return;

  let authorId = message.author.id;

  if (message.content === "%apply") {
      console.log(`Złóż wniosek o autorId ${authorId}`);
      // User is not already in a registration process    
      if (!(authorId in userApplications)) {
          userApplications[authorId] = { "step" : 1}

          message.author.send("```Musimy zadać kilka pytań, abyśmy mogli poznać trochę siebie```");
          message.author.send("```Uruchomiona aplikacja - wpisz „#Anuluj”, aby anulować aplikację```");
          message.author.send("```Pytanie 1: Nazwa w grze?```");
      }

  } else {

      if (message.channel.type === "dm" && authorId in userApplications) {
          let authorApplication = userApplications[authorId];

          if (authorApplication.step == 1 ) {
              message.author.send("```Pytanie 2: Wiek?```");
              authorApplication.step ++;
          }
          else if (authorApplication.step == 2) {
              message.author.send("```Pytanie 3: Strefa czasowa? NA, AU, EU, NZ lub inne? (Jeśli inny, opisz swoją strefę czasową)```");
              authorApplication.step ++;
          }
          else if (authorApplication.step == 3) {
              message.author.send("```Pytanie 4: Czy masz schematica?```");
              authorApplication.step ++;
          }

          else if (authorApplication.step == 4) {
              message.author.send("```Dziękujemy za rejestrację. Wpisz %apply, aby zarejestrować się ponownie```");
              delete userApplications[authorId];
          }

      }
  }


});





client.on("ready", () => {
    console.log(`Jestem Gotowy, nazywam się ${client.user.username}`);

    setInterval(function() {
        let statuses = [
            `Subskrybuj Flawani YouTube`,
            `Miłego dnia!`,
            `Wesołych Świąt 🎅`,
            `Prefix: _`,
            `Dzisiaj jest ${moment(Date.now()).format('DD.MM.YYYYr.')}`, //DD.MM.YYYYr.
        ]
        let status = statuses[Math.floor(Math.random() * statuses.length)];
        client.user.setActivity(status, {
            type: "PLAYING"
        });
    }, 10000)
});

client.on ("guildMemberAdd", member => {

    var role = member.guild.roles.find ("name", "BezWeryfikacji");
    member.addRole (role);
});



client.on("message", async message => {
    const prefix = "_";

    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    if (!message.member) message.member = await message.guild.fetchMember(message);

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    
    if (cmd.length === 0) return;
    
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));

    if (command) 
        command.run(client, message, args);
});


client.login(process.env.TOKEN);
