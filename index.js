const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get, child} = require("firebase/database");
const { Client, Intents } = require('discord.js');
const discord = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
var admin = require("firebase-admin");


const firebaseConfig = {
  
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
var serviceAccount = require("./cugbot-firebase-adminsdk-2pg4e-f6c4ac1444.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://cugbot-default-rtdb.firebaseio.com"
});

// Initialize da databases
const database = getDatabase();
const dbRef = ref(getDatabase());

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

let prefix = "c "

// Update cugs per second 
setInterval(()=>{
    get(child(dbRef, 'users/')).then(snapshot => {
        let users = Object.keys(snapshot.val())
        console.log(users)
        for (let i=0;i<users.length;i++) {
            get(child(dbRef, `users/${users[i]}/cugs`)).then(snapshot => {
                get(child(dbRef, `users/${users[i]}/cps`)).then(snapshow => {
                    set(ref(database, `users/${users[i]}/cugs`), snapshot.val() + snapshow.val());
                });
            });
            
        }
    })
}, 1000);
client.on("messageCreate", (m) => {
    let content = m.content.toLowerCase();

    if (!content.toLowerCase().startsWith(prefix)) return;

    console.log()
    if (content === `${prefix}commands`) {
        m.reply({embeds: [new discord.MessageEmbed()
            .addFields([{name: `${prefix}start`, value: "Start generating cugs"}, {name: `${prefix}boost`, value: "Temporary boost your cugs per second using your temporary boosts."}, {name: `${prefix}store`, value: "Search cug boosts"}, {name: `${prefix}buy {boost ID}`, value: "Buy cug boosts"}, {name: `${prefix}money`, value: "See how much money you have"}, {name: `${prefix}status`, value: "View your current status (boosts, balance, ETC)"}, {name: `${prefix}curse {cugs} {user}`, value: "Curse any user with a random curse. The more cugs you spend, the deadlier the curse."}]).setColor('#e03b21').setTitle('Cugbot commands').setDescription("Cugs are magical things.").setFooter("This is the footer.")]})
    } else if (content === `${prefix}start`) {
        get(child(dbRef, `users/${m.author.id}/`)).then((snapshot) => {
            if (snapshot.exists()) {
              m.reply('Your generator is already running.');
              return;
            } else {
                set(ref(database, `users/${m.author.id}/`), {
                    cps: 1,
                    cugs: 0,
                    items: ['sgift', 'oneboost']
                }) 
                m.reply({embeds: [new discord.MessageEmbed()
                .setDescription("<:cug:901501121716174868> You are now generating one cug per second.")
                .setColor('#2ca821')]
                });
            }
          }).catch((error) => {
            console.error(error);
          });
    } 
    
let blib = false;

    if (content === `${prefix}money` || content === `${prefix}cugs`) {
        get(child(dbRef, `users/${m.author.id}/cugs`)).then(snapshot => {
            if (snapshot.val() === null) {
                m.channel.send("You need to run " + prefix + "start to run this command.")
                return;
            }
            m.reply({embeds: [new discord.MessageEmbed()
                .setColor("#2ca821")
                .setDescription(`You have ${snapshot.val()} <:cug:901501121716174868>cugs.`)
                ]});
        }).catch(error => {
            m.channel.send("You need to run " + prefix + "start to run this command.")
        });

    } else if (content === `${prefix}status`) {
        get(child(dbRef, `users/900856940077412362/`)).then(snapshot => {
            let cugs = snapshot.val()["cugs"];
            let cps = snapshot.val()["cps"];
            let items = snapshot.val()["items"];
            console.log(cugs);
            console.log(snapshot.val()["items"])
            if (cugs.length() || cps === undefined || items === undefined) {
                console.log("hello world")
                m.reply("You need to run " + prefix + 'start to run other commands!')
                return;
            }
            m.reply({embeds: [new discord.MessageEmbed()
                .setColor("#2ca821")
                .addFields([{
                    name: "Cugs",
                    value: `${cugs}` //user.cugs
                }, {
                    name: "Cugs per Second",
                    value: `${cps}` //user.cps
                }, {
                    name: "Boosts",
                    value: `${items.join(', ')}`
                },
                {
                    name: "Curses",
                    value: "Placeholder"
                }])
            ]})
        }).catch(error => {
            m.channel.send(error)
        });

        
    }
});


client.login('');
