const db_module = require("@dieugene/key-value-db");
const I = require("@dieugene/utils");

const db = db_module.init('TELEGRAM_MESSAGES_CACHE');

function get_cache_id(ctx) {
    return I.hash(I.tg.get.bot.id(ctx), I.tg.get.user.id(ctx));
}

async function add(ctx, {message_id, text} = {}) {
    let id = get_cache_id(ctx),
        cache = await db.get(id),
        item = {
            message_id: message_id ?? I.tg.get.message.id(ctx),
            text: text ?? I.tg.get.message.text(ctx)
        };
    if (!cache) cache = await db.set(id, []);
    cache.push(item);
    await db.set(id, cache);
    return item;
}

async function edit(ctx, message_id, text) {
    let id = get_cache_id(ctx),
        cache = await db.get(id);
    message_id = message_id ?? I.tg.get.message.id(ctx);
    text = text ?? I.tg.get.message.text(ctx);
    if (!!cache) {
        cache.filter(item => item.message_id === message_id).forEach(item => item.text = text);
        await db.set(id, cache);
        console.log('TG MESSAGE EDIT DONE :: ', JSON.stringify(cache));
    }
}

async function del(ctx, message_id) {
    let id = get_cache_id(ctx);
    if (!message_id) return await db.del(id);
    let cache = await get(ctx);
    if (!!cache) await db.set(id, cache.filter(item => item.message_id !== message_id))
}

async function get(ctx, _exclude_placeholder = false) {
    let cache = (await db.get(get_cache_id(ctx))) ?? [];
    if (_exclude_placeholder) cache = exclude_placeholder(cache);
    return cache;
}

function exclude_placeholder(cache = []) {
    return cache.filter(item => item.text !== '<<confirmation message>>');
}

async function del_placeholder(ctx, message_id) {
    console.log('DEL_PLACEHOLDER ::', message_id);
    if (!!message_id) {
        try {
            await ctx.deleteMessage(message_id);
        } catch (e) {
            console.log('TG MESSAGES CACHE :: ERROR WHILE DELETE CONFIRMATION :: MESSAGE :: ', e.message, ':: STACK :: ', e?.stack);
        }
    } else {
        let cache = await get(ctx);
        if (!!cache && cache.length > 0 && cache[cache.length - 1].text === '<<confirmation message>>') {
            let confirm = cache.pop();
            await del(ctx, confirm.message_id);
            try {
                ctx.deleteMessage(confirm.message_id);
            } catch (e) {
                console.log('TG MESSAGES CACHE :: ERROR WHILE DELETE CONFIRMATION :: MESSAGE :: ', e.message, ':: STACK :: ', e?.stack);
            }
        }
    }
}

async function get_placeholder_message_id(ctx, cache) {
    cache = cache ?? (await get(ctx));
    let placeholder_message_id;
    if (!!cache && cache.length > 0 && cache[cache.length - 1].text === '<<confirmation message>>')
        placeholder_message_id = cache.pop().message_id;
    return placeholder_message_id;
}

async function cache_and_show_progress(ctx, {show_placeholder = true, placeholder_text, message_id, text, placeholder_message_id} = {}) {
    if (
        show_placeholder &&
        !placeholder_message_id
    ) placeholder_message_id = await put_placeholder(ctx, placeholder_text);
    let id = get_cache_id(ctx),
        cache = await get(ctx);
    console.log('<< ====== CACHE_AND_SHOW_PROGRESS :: ID ::', id, ':: INITIAL READING CACHE ::', JSON.stringify(cache));

    if (!cache) cache = [];
    message_id = message_id ?? I.tg.get.message.id(ctx);

    // delete confirmation
    if (!!cache && cache.length > 0 && cache[cache.length - 1].text === '<<confirmation message>>') {
        let confirm = cache.pop();
        //await del(ctx, confirm.message_id);
        try {
            ctx.deleteMessage(confirm.message_id);
        } catch (e) {
            console.log('TG MESSAGES CACHE :: ERROR WHILE DELETE CONFIRMATION :: MESSAGE :: ', e.message);
            console.log('TG MESSAGES CACHE :: ERROR WHILE DELETE CONFIRMATION :: STACK :: ', e?.stack);
        }
    }

    // add items
    if (Array.isArray(text)) text.forEach(t => cache.push({message_id, text: t}));
    else cache.push({message_id, text: text ?? I.tg.get.message.text(ctx)});
    if (!!placeholder_message_id) cache.push({
        message_id: placeholder_message_id,
        text: '<<confirmation message>>'
    });
    await db.set(id, cache);
}

async function put_placeholder(ctx, text = "✍") {
    let msg = await ctx.reply(text);
    return msg.message_id;
}



module.exports = {
    add, get, del, edit,

    cache_and_show_progress,
    del_placeholder,
    put_placeholder,
    get_placeholder_message_id,
    exclude_placeholder
};