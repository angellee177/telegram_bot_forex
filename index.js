const Telegraf = require('telegraf');
const Markup = require("telegraf/markup");
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");

// currency converter code
const Converter = require("./api/currency-converter");

const token = "924991057:AAEQv0Z_ZeQfSr-8XeMS7JW9Z2u3oK5qQvk"
const bot = new Telegraf(token, { startPolling: true });

bot.start((ctx) => ctx.reply(42 / 0))
bot.launch()

// Respond to start the command
// Start Bot
bot.start("START", ctx => {
    ctx.reply(
        `How can I help you, ${ctx.from.first_name}?`,
        Markup.inlineKeyboard([
            Markup.callbackButton("💱 Convert Currency", "CONVERT_CURRENCY"),
            Markup.callbackButton("🤑 View Rates", "VIEW_RATES")
        ]).extra()
    );
});

// Go Back Menu after Action
bot.action("BACK", ctx => {
    ctx.reply(`Thank you for using our Bot`);
    ctx.reply(
        `Do you need something else, ${ctx.from.first_name}?`,
        Markup.inlineKeyboard([
            Markup.callbackButton("Convert Currency", "CONVERT_CURRENCY"),
            Markup.callbackButton("View Rates", "VIEW_RATES")
        ]).extra()
    );
});

// Currency Converter Wizard
const currencyConverter = new WizardScene(
    "currency_converter",
    ctx => {
        ctx.reply("Please, type in the currency to convert from (example: USD)")
        return ctx.wizard.next();
    },
    ctx => {
        ctx.wizard.state.currencySource = ctx.message.text;
        ctx.reply(
            `Got it, so we are convert from ${ctx.wizard.state.currencySource}
            to what currency? (example: IDR)`
        );
        return ctx.wizard.next();
    },
    ctx => {
        ctx.wizard.state.currencyDestination = ctx.message.text;
        ctx.reply(
            `Enter the amount to convert from ${ctx.wizard.state.currencySource} to ${ctx.wizard.state.currencyDestination}`
        );
        return ctx.wizard.next();
    },
    ctx => {
        const amt = (ctx.wizard.state.amount = ctx.message.text);
        const source = ctx.wizard.state.currencySource;
        const dest = ctx.wizard.state.currencyDestination;
        const rates = Converter.getRate(source, dest);
        rates.then(res => {
            let newAmount = Object.values(res.data)[0] * amt;
            newAmount = newAmount.toFixed(3).toString();
            ctx.reply(
                `${amt} ${source} is worth \n ${newAmount} ${dest}`,
                Markup.inlineKeyboard([
                    Markup.callbackButton("Back to Menu", "BACK"),
                    Markup.callbackButton(
                        "Convert another Currency",
                        "CONVERT_CURRENCY"
                    )
                ]).extra()
            );
        });
        return ctx.scene.leave();
    }
);


// scene registration
const stage = new Stage([currencyConverter], { default: "currency_converter" });
bot.use(session());
bot.use(stage.middleware());
bot.startPolling();



