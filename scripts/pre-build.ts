const prompts = require('prompts');
const fs = require('fs');

(async () => {
    const response = await prompts({
        type: 'confirm',
        name: 'value',
        message: 'build.gradle is updated with new version?'
    });

    if (!response.value) {
        console.error('build.gradle is not updated with new version, updating automatically .env and build.gradle');
        const actualVersion = {
            name: 'v0.0.0',
            code: 0
        };

        const envFile = fs.readFileSync('.env', 'utf-8');
        envFile.split('\n').forEach((line: string) => {
            if (line.startsWith('ANDROID_VERSION_NAME=')) {
                actualVersion.name = line.split('=')[1];
            }
            if (line.startsWith('ANDROID_VERSION_CODE=')) {
                actualVersion.code = parseInt(line.split('=')[1]);
            }
        });
        const newVersionPatch = parseVersion(actualVersion.name, 'patch');
        const newVersionMinor = parseVersion(actualVersion.name, 'minor');
        const newVersionMajor = parseVersion(actualVersion.name, 'major');

        const version = await prompts({
            type: 'select',
            name: 'releaseType',
            message: 'Select a release type',
            choices: [
                { title: `Patch: ${actualVersion.name} -> ${newVersionPatch}`, value: 'patch' },
                { title: `Minor: ${actualVersion.name} -> ${newVersionMinor}`, value: 'minor' },
                { title: `Major: ${actualVersion.name} -> ${newVersionMajor}`, value: 'major' }
            ],
            initial: 0
        });

        actualVersion.code += 1;
        actualVersion.name = parseVersion(actualVersion.name, version.releaseType);

        console.log('Updating .env file...');
        const a = envFile.replace(/ANDROID_VERSION_NAME=.*\n/, `ANDROID_VERSION_NAME=${actualVersion.name}\n`);
        const b = a.replace(/ANDROID_VERSION_CODE=.*\n/, `ANDROID_VERSION_CODE=${actualVersion.code}\n`);
        fs.writeFileSync('.env', b);
        console.log('Updated .env file!');

        console.log('Updating build.gradle file...');
        const buildGradleFile = fs.readFileSync('android/app/build.gradle', 'utf-8');
        const c = buildGradleFile.replace(/versionName ".*"/g, `versionName "${actualVersion.name}"`);
        const d = c.replace(/versionCode \d+/g, `versionCode ${actualVersion.code}`);
        fs.writeFileSync('android/app/build.gradle', d);
        console.log('Updated build.gradle file!');

        console.log('Success!');

        process.exit(0);
    }

    console.log('build.gradle is updated with new version, can continue');
    process.exit(0);
})();

function parseVersion(version: string, releaseType: 'patch' | 'minor' | 'major'): string {

    if (releaseType === 'patch') {
        return `${version.split('.').slice(0, -1).join('.')}.${Number(version.split('.').slice(-1)) + 1}`;
    }

    if (releaseType === 'minor') {
        return `${version.split('.').slice(0, -2).join('.')}.${Number(version.split('.').slice(-2, -1)) + 1}.0`;
    }

    if (releaseType === 'major') {
        return `${Number(version.split('v')[1].split('.').slice(0, -2)) + 1}.0.0`;
    }

    return version;
};
