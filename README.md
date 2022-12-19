# TrackApp React Native

## Architecture
1. Node version: v16.17.0

### Overview

### Folder Structure
| Folder           | Description                                                                                                       |
| ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `./`             | This folder is reserved for config files, Git files and JSON files. No other file should be stored at this level. |
| `./android`      | Natives files for Android                                                                                         |
| `./src`          | Folder to store all the TypeScript source code files                                                              |
| `./node_modules` | NPM modules of the project                                                                                        |

### App Folder
The [`./src`](./src) folder structure is divided into the following subfolders to achieve domain driven design and to avoid huge directories. The folders are:

1. Assets
2. Components
3. Hooks
4. Constants
5. Navigation
6. Screens
7. Services
8. Shared-state
9. Utils


#### Components
The [`./src/components`] folder stores all reusable UI elements. The components under this folder are isolated from any logic and are usable in many screens. It should be **generic** enough and free from logic specific to only one business requirement.

#### Assets
The [`./src/assets`] folder stores all image 2x 3x and font family

#### Hooks
The [`./src/hooks`] folder stores some hooks function

#### Constants
The [`./src/assets`] folder store define file constant about font, colors, events

#### Navigation
The [`./src/navigation`] folder stores file config router navigation

#### Screens
The [`./src/screens`] folder stores all main screen on mobile

#### Services
The [`./src/services`] folder stores all config about api, event to communicate between mobile and webview, socket

#### Shared-state
The [`./src/shared-state`] folder stores config data local, define context

#### Utils
The [`./src/utils`] folder stores utils function

## How-Tos

### How to Debug with Android
1. Clone the repository
2. Check out to `main` branch
3. Launch terminal and `cd ` to the project
4. Exec `yarn` to install NPM dependencies & Pod
5. Exec `yarn start` to launch Metro Bundler
6. Open new terminal console and exec: `yarn android` .
7. Enjoy :tada:

### How to Release
1. Clone the repository
2. Check out to `main` branch
3. Launch terminal and `cd ` to the project
4. Exec `yarn` to install NPM dependencies & Pod
5. Install the latest EAS CLI:
    - Exec: npm install -g eas-cli
6. Log in to your Expo account:
    - exec: eas login
7. Configure the project:
    - exec: eas build:configure
8. Run a build:
    - For Android: eas build --platform android
9. Wait for the build to complete:
    - If you are a member of an organization and your build is on its behalf, you will find the build details on the build dashboard for that account.