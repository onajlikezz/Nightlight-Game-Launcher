const fs = require('fs');
const path = require('path');

const ACHIEVEMENT_DIR = path.join(
    process.env.LOCALAPPDATA,
    'nightlight-launcher',
    'achievement_pipe'
);

const LOG_FILE = path.join(
    process.env.LOCALAPPDATA,
    'nightlight-launcher',
    'achievements.log'
);

const SAVED_FILE = path.join(
    process.env.LOCALAPPDATA,
    'nightlight-launcher',
    'achievements.json'
);

function ensureDirectories() {

    if (!fs.existsSync(ACHIEVEMENT_DIR)) {
        fs.mkdirSync(ACHIEVEMENT_DIR, {
            recursive: true
        });
    }

    if (!fs.existsSync(SAVED_FILE)) {
        fs.writeFileSync(
            SAVED_FILE,
            JSON.stringify([], null, 2)
        );
    }
}

function startAchievementListener() {

    ensureDirectories();

    console.log('[NL] Achievement listener started');

    setInterval(() => {

        const files =
            fs.readdirSync(ACHIEVEMENT_DIR);

        for (const file of files) {

            if (!file.endsWith('.json'))
                continue;

            const fullPath =
                path.join(
                    ACHIEVEMENT_DIR,
                    file
                );

            try {

                const raw =
                    fs.readFileSync(
                        fullPath,
                        'utf8'
                    );

                const achievement =
                    JSON.parse(raw);

                processAchievement(
                    achievement
                );

                fs.unlinkSync(fullPath);

            } catch (e) {

                console.error(
                    '[NL] Achievement parse error:',
                    e
                );
            }
        }

    }, 1000);
}

function processAchievement(achievement) {

    console.log(
        '[NL Achievement]',
        achievement.title
    );

    logAchievement(achievement);

    saveAchievement(achievement);

    // HERE:
    // your future popup system
    // overlay system
    // XP system
}

function logAchievement(achievement) {

    const line =
        `[${new Date().toISOString()}] `
        + `${achievement.id} `
        + `${achievement.title}\n`;

    fs.appendFileSync(
        LOG_FILE,
        line
    );
}

function saveAchievement(achievement) {

    let achievements = [];

    try {

        achievements = JSON.parse(
            fs.readFileSync(
                SAVED_FILE,
                'utf8'
            )
        );

    } catch {}

    const alreadyExists =
        achievements.find(
            x => x.id === achievement.id
        );

    if (alreadyExists)
        return;

    achievements.push({
        ...achievement,
        unlockedAt: Date.now()
    });

    fs.writeFileSync(
        SAVED_FILE,
        JSON.stringify(
            achievements,
            null,
            2
        )
    );

    console.log(
        '[NL] Saved achievement:',
        achievement.title
    );
}

module.exports = {
    startAchievementListener
};