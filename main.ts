import { app, BrowserWindow, ipcMain, Menu, MenuItem, MenuItemConstructorOptions, screen, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import * as moment from 'moment';
import Bunny from './src/app/entities/Bunny';
import * as sqlite from 'sqlite';
import { Database } from 'sqlite';
import * as log from 'electron-log';
import SQL from 'sql-template-strings';
import IPC_EVENT from './src/app/ipcEvents';
import GENDER from './src/app/entities/Gender';
import RESCUE_TYPE from './src/app/entities/RescueType';
import DATE_OF_BIRTH_EXPLANATION from './src/app/entities/DateOfBirthExplanation';
import SPAY_EXPLANATION from './src/app/entities/SpayExplanation';

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = '1';

log.info('Application starting');

process.on('uncaughtException', (error: Error) => {
  log.error('Uncaught exception on the main thread.');
  log.error(error);
});


let win, serve;
const args = process.argv.slice(1);
// This is basically a surrogate for 'dev' environment
serve = args.some(val => val === '--serve');

// const template = [
//   // // { role: 'appMenu' }
//   // ...(process.platform === 'darwin' ? [{
//   //   label: app.getName(),
//   //   submenu: [
//   //     {role: 'about'},
//   //     {type: 'separator'},
//   //     {role: 'services'},
//   //     {type: 'separator'},
//   //     {role: 'hide'},
//   //     {role: 'hideothers'},
//   //     {role: 'unhide'},
//   //     {type: 'separator'},
//   //     {role: 'quit'}
//   //   ]
//   // }] : []),
//   // // { role: 'fileMenu' }
//   // {
//   //   label: 'File',
//   //   submenu: [
//   //     is.macOS() ? {role: 'close'} : {role: 'quit'}
//   //   ]
//   // },
//   // // { role: 'editMenu' }
//   // {
//   //   label: 'Edit',
//   //   submenu: [
//   //     {role: 'undo'},
//   //     {role: 'redo'},
//   //     {type: 'separator'},
//   //     {role: 'cut'},
//   //     {role: 'copy'},
//   //     {role: 'paste'},
//   //     ...(is.macOS() ? [
//   //       {role: 'pasteAndMatchStyle'},
//   //       {role: 'delete'},
//   //       {role: 'selectAll'},
//   //       {type: 'separator'},
//   //       {
//   //         label: 'Speech',
//   //         submenu: [
//   //           {role: 'startspeaking'},
//   //           {role: 'stopspeaking'}
//   //         ]
//   //       }
//   //     ] : [
//   //       {role: 'delete'},
//   //       {type: 'separator'},
//   //       {role: 'selectAll'}
//   //     ])
//   //   ]
//   // },
//   // // { role: 'viewMenu' }
//   // {
//   //   label: 'View',
//   //   submenu: [
//   //     {role: 'reload'},
//   //     {role: 'forcereload'},
//   //     {role: 'toggledevtools'},
//   //     {type: 'separator'},
//   //     {role: 'resetzoom'},
//   //     {role: 'zoomin'},
//   //     {role: 'zoomout'},
//   //     {type: 'separator'},
//   //     {role: 'togglefullscreen'}
//   //   ]
//   // },
//   // // { role: 'windowMenu' }
//   // {
//   //   label: 'Window',
//   //   submenu: [
//   //     {role: 'minimize'},
//   //     {role: 'zoom'},
//   //     ...(is.macOS() ? [
//   //       {type: 'separator'},
//   //       {role: 'front'},
//   //       {type: 'separator'},
//   //       {role: 'window'}
//   //     ] : [
//   //       {role: 'close'}
//   //     ])
//   //   ]
//   // },
//   {
//     role: 'help'
//     // submenu: [
//     //   {
//     //     label: 'Github',
//     //     click() {
//     //       require('electron').shell.openExternalSync('https://github.com/Jazzepi/bunny-tracker')
//     //     }
//     //   }
//     // ]
//   }
// ];

const template: Array<(MenuItemConstructorOptions) | (MenuItem)> = [
  {
    role: 'quit'
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Source Code',
        click() {
          shell.openExternalSync('https://github.com/Jazzepi/bunny-tracker');
        }
      },
      {
        role: 'toggledevtools'
      }
    ]
  },
  {
    role: 'zoomin'
  },
  {
    role: 'resetzoom'
  }
];


Menu.setApplicationMenu(Menu.buildFromTemplate(template));

const createWindow = async () => {
  const migrationPath = path.join(__dirname, 'dist', 'assets', 'migrations');
  const databasePath = path.join(app.getPath('userData'), 'database.sqlite');

  log.info('__dirname path:' + __dirname);
  log.info('Migration path:' + migrationPath);
  log.info('Database path:' + databasePath);
  log.info(`Am I in dev mode? ${serve}`);

  const database: Database = await sqlite.open(databasePath);
  await database.migrate({
    // force: serve ? 'last' : undefined,
    migrationsPath: serve ? 'src/assets/migrations' : path.join(__dirname, 'dist', 'assets', 'migrations')
  });

  await database.run('PRAGMA foreign_keys = ON;');

  ipcMain.on(IPC_EVENT.getBunny, async (event: any, id: number) => {
    try {
      log.info(`Processing ${IPC_EVENT.getBunny} event from electron thread`);
      event.returnValue = await database.get<Bunny>(SQL`SELECT *
                                                        FROM bunnies
      WHERE id = ${id}`);
    } catch (err) {
      event.returnValue = err; // TODO: Fixup all the callers to deal with the return error correctly
      throw err;
    }
  });



  ipcMain.on(IPC_EVENT.getBunnies, async (event: any) => {
    interface BondedBunnyReturnValues {
      firstBunny: number,
      secondBunny: number
    }

    type QueryResult = Bunny & BondedBunnyReturnValues;
    try {
      log.info(`Processing ${IPC_EVENT.getBunnies} event from electron thread`);

      const queryResults: QueryResult[] = await database.all<QueryResult>(SQL`SELECT *
                                                            FROM Bunnies
                                                            LEFT OUTER JOIN BunnyBondedToBunny ON Bunnies.id = BunnyBondedToBunny.firstBunny OR Bunnies.id = BunnyBondedToBunny.secondBunny;
      `);
      // A bunny will appear in the answer set repeatedly if it's in a relationship with other bunnies.
      // If bunny X has a relationship with Y and Z then it will appear in the output twice.
      // We want to collapse these many rows into a single bunny javascript object with an array of ids pointing to the other bunnies
      const consolidatedResults: Bunny[] = queryResults.reduce<Bunny[]>((results: Bunny[], currentValue: QueryResult, _currentIndex, array): Bunny[] => {
        // Have I already recorded this bunny in the output array?
        const possibleBunnyAlreadyInResults: Bunny | undefined = results.find((value: Bunny) => {
          return value.id === currentValue.id;
        });
        if (possibleBunnyAlreadyInResults) {
          // Add the bunny that isn't this bunny into the bondedBunnyIds
          // For example you don't want bunny with id 5 to have bondedBunnyIds = [3, 10, 5] because that says its bonded to itself
          if (currentValue.firstBunny) {
            possibleBunnyAlreadyInResults.bondedBunnyIds.push(currentValue.firstBunny !== currentValue.id ? currentValue.firstBunny : currentValue.secondBunny);
          }
        } else {
          if (currentValue.firstBunny !== null && currentValue.firstBunny !== undefined) {
            currentValue.bondedBunnyIds = [currentValue.firstBunny !== currentValue.id ? currentValue.firstBunny : currentValue.secondBunny];
          } else {
            currentValue.bondedBunnyIds = [];
          }
          results.push(currentValue);
        }
        return results;
      }, []);
      log.info(`Found ${queryResults.length} bunnies`);
      log.info(`Consolidated them to ${consolidatedResults.length} bunnies`);
      event.returnValue = consolidatedResults;
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.addBunny, async (event: any, bunny: Bunny) => {
    try {
      log.info(`Processing ${IPC_EVENT.getBunny} event from electron thread with bunny name ${bunny.name}`);
      const sqlStatement = SQL`
INSERT INTO
bunnies(name,
        gender,
        rescueType,
        intakeDate,
        intakeReason,
        surrenderName,
        dateOfBirth,
        description,
        spayDate,
        dateOfBirthExplanation,
        spayExplanation)
VALUES (${bunny.name},
        ${bunny.gender},
        ${bunny.rescueType},
        ${bunny.intakeDate ? moment(bunny.intakeDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
        ${bunny.intakeReason},
        ${bunny.surrenderName},
        ${bunny.dateOfBirth ? moment(bunny.dateOfBirth).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
        ${bunny.description},
        ${bunny.spayDate ? moment(bunny.spayDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
        ${bunny.dateOfBirthExplanation},
        ${bunny.spayExplanation})`;
      log.info(`Running query ${sqlStatement.text}`);
      log.info(`Parameters ${sqlStatement.values}`);
      const statement = await database.run(sqlStatement);
      bunny.id = statement.lastID;
      event.returnValue = bunny;
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.updateBunny, async (event: any, bunny: Bunny) => {
    log.info('Updating bunny with the following values');
    log.info(bunny);
    try {
      log.info(`Processing ${IPC_EVENT.updateBunny} event from electron thread with bunny named ${bunny.name}`);
      await database.run(SQL`
UPDATE
Bunnies SET
  name=${bunny.name},
  gender=${bunny.gender},
  rescueType=${bunny.rescueType},
  intakeDate=${bunny.intakeDate ? moment(bunny.intakeDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  intakeReason=${bunny.intakeReason},
  surrenderName=${bunny.surrenderName},
  dateOfBirth=${bunny.dateOfBirth ? moment(bunny.dateOfBirth).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  description=${bunny.description},
  spayDate=${bunny.spayDate ? moment(bunny.spayDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  passedAwayDate=${bunny.passedAwayDate ? moment(bunny.passedAwayDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  passedAwayReason=${bunny.passedAwayReason},
  dateOfBirthExplanation=${bunny.dateOfBirthExplanation},
  spayExplanation=${bunny.spayExplanation}
WHERE Bunnies.id = ${bunny.id}`);

      // Delete all relationships with this bunny
      await database.run(SQL`
DELETE FROM BunnyBondedToBunny
WHERE BunnyBondedToBunny.firstBunny = ${bunny.id} OR
      BunnyBondedToBunny.secondBunny = ${bunny.id}
`);
      // Reinsert all relationships with this bunny
      if (bunny.bondedBunnyIds.length > 0) {
        log.info('re-inserting relationships');
        const sqlStatement = `
INSERT INTO
BunnyBondedToBunny(firstBunny,
                   secondBunny)
VALUES ${bunny.bondedBunnyIds.reduce((previousValue, currentValue, index, ids) => {
          return `${previousValue}(${bunny.id}, ${currentValue})${ids.length - 1 === index ? '' : ', '}`;
        }, '')}
`;
        log.info(`Running ${sqlStatement}`);
        await database.run(sqlStatement);

      }
      event.returnValue = null;
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getGenders, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getGenders} event from electron thread`);
      event.returnValue = await database.all<GENDER>(SQL`SELECT *
                                                         FROM Genders`);
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getRescueTypes, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getRescueTypes} event from electron thread`);
      event.returnValue = await database.all<RESCUE_TYPE>(SQL`SELECT *
                                                              FROM RescueTypes`);
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getDateOfBirthExplanationTypes, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getDateOfBirthExplanationTypes} event from electron thread`);
      event.returnValue = await database.all<DATE_OF_BIRTH_EXPLANATION>(SQL`SELECT *
                                                              FROM DateOfBirthExplanations`);
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getSpayExplanationTypes, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getSpayExplanationTypes} event from electron thread`);
      event.returnValue = await database.all<SPAY_EXPLANATION>(SQL`SELECT *
                                                              FROM SpayExplanations`);
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      zoomFactor: process.env.zoomFactor ? Number(process.env.zoomFactor) : 2.0
    },
  });

  console.log(`Zoom factor env is [${process.env.zoomFactor}]`);

  if (serve) {
    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  if (serve) {
    win.webContents.openDevTools();
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

};

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', createWindow);

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      log.info('Application closing.');
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  log.error('Application errored out. Logging error below.');
  log.error(e);
  throw e;
}
