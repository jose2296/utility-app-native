# Posible Name
- OrbitHub

- Ichi Hub
- Zen Hub
- OneDock
- UnitDock
- ClarityHub
- UnitHub
- LifeHub


# Descriptions
- Despídete del caos digital. OrbitHub es tu aliado definitivo para organizar cualquier aspecto de tu vida. Desde la lista de la compra hasta tus series pendientes, pasando por notas importantes y proyectos colaborativos. Crea carpetas ilimitadas, comparte con amigos y accede a todo desde un dashboard personalizable. Si puedes pensarlo, puedes organizarlo en OrbitHub. Tu productividad, en órbita.

- Say goodbye to digital chaos. OrbitHub is your ultimate ally for organizing every aspect of your life. From your shopping list to your pending TV shows and movies, including important notes and collaborative projects. Create unlimited folders, share with friends, and access everything from one personalizable dashboard. If you can think it, you can organize it in OrbitHub. Your productivity, in orbit.


## After prebuild
- add android/app/build.gradle:
    - `apply plugin: 'com.google.gms.google-services'`
    - `
        signingConfigs {
            debug {
                storeFile file('debug.keystore')
                storePassword 'android'
                keyAlias 'androiddebugkey'
                keyPassword 'android'
            }
            release {
                storeFile file('orbithub.keystore')
                storePassword 'orbithub'
                keyAlias 'orbithub'
                keyPassword 'orbithub'
            }
        }
        buildTypes {
            debug {
                signingConfig signingConfigs.debug
            }

            release {
                // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.release
                shrinkResources (findProperty('android.enableShrinkResourcesInReleaseBuilds')?.toBoolean() ?: false)
                minifyEnabled enableProguardInReleaseBuilds
                proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
                crunchPngs (findProperty('android.enablePngCrunchInReleaseBuilds')?.toBoolean() ?: true)
            }
        }
    `
- add android/build.gradle:
    -`classpath('com.google.gms:google-services:4.4.2')`
