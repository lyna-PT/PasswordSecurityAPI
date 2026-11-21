
const crypto = require("crypto");

// Local wordlist: 256 distinct words
const WORDS = `
acorn amber anchor animal apple apron april arch
arrow artist autumn avenue awake badge bamboo banner
basket beach beacon bear beauty beetle bicycle bird
biscuit blanket blossom blue boat body border bottle
breeze bridge brook brush bubble bucket cabin cactus
camera candle canyon captain carpet carrot castle cedar
chain chair chalk chance change channel charm cherry
circle citrus city clay clean clock cloud coast
cocoa comet compass coral cotton country cousin craft
crane creek crown crystal culture dance danger dawn
day denim desert diamond dinner doctor dolphin door
dragon dream drift drum duck eagle earth echo
edge elbow elder element ember engine evening fabric
falcon family farmer feather field figure fire fish
flame flower forest fossil fountain fox frame freedom
friend frost fruit galaxy garden garlic gate gentle
gift ginger glass globe glove gold grape grass green
guitar habit harbor harmony harvest hazel heart hill
honey hope horizon horse hotel house island ivory
jacket jasmine jazz jewel journey judge jungle kettle
key kitten kiwi ladder lake lantern laptop leaf
lemon letter library light lily limit lion liquid
lizard llama lobster local logic lotus lucky lunar
machine magic magnet maple marble market meadow memory
melon metal meteor midnight milk mirror model moment
monkey moon morning mountain mouse movie museum music
mystery nation nature needle nest nickel night noble
noodle north novel oak ocean olive onion opera
orange orbit orchid origin owl oxygen oyster palace
panda paper parent park party peach pearl pencil
pepper person piano picnic picture pillow pilot pine
planet plastic plum pocket poem polar pond
`.trim().split(/\s+/);

// Generate a secure passphrase
function generatePassphrase(options = {}) {

    const {
        wordCount = 10,
        separator = "-"
    } = options;

    // Validate number of words
    if (
        !Number.isInteger(wordCount) ||
        wordCount < 6 ||
        wordCount > 12
    ) {
        throw new Error(
            "Word count must be between 6 and 12."
        );
    }

    // Validate separator
    if (
        typeof separator !== "string" ||
        separator.length > 1 ||
        !["-", "_", ".", " "].includes(separator)
    ) {
        throw new Error(
            "Separator must be -, _, . or a space."
        );
    }

    // Select words using cryptographically secure randomness
    const selectedWords = [];

    for (let i = 0; i < wordCount; i++) {

        const index = crypto.randomInt(0, WORDS.length);

        selectedWords.push(WORDS[index]);
    }

    // Calculate theoretical entropy
    const entropy = wordCount * Math.log2(WORDS.length);

    return {
        passphrase: selectedWords.join(separator),
        wordCount,
        wordlistSize: WORDS.length,
        estimatedEntropyBits: Number(entropy.toFixed(2))
    };
}

module.exports = {
    generatePassphrase
};
