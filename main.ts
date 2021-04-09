import { app, BrowserWindow, ipcMain, Menu, MenuItem, MenuItemConstructorOptions, screen, shell } from 'electron';
import * as path from 'path';
import * as url from 'url';
import Bunny from './src/app/entities/Bunny';
import * as log from 'electron-log';
import IPC_EVENT from './src/app/ipcEvents';
import Database from './src/database/database';

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
  const databasePath = path.join(app.getPath('userData'), 'database.sqlite');

  log.info(`current working directory path [${process.cwd()}]`);
  log.info(`__dirname path for main.ts [${__dirname}]`);
  log.info(`Am I in dev mode? [${serve}]`);

  const database: Database = new Database(databasePath, serve);
  await database.ready();

  ipcMain.on(IPC_EVENT.getBunny, async (event: any, id: number) => {
    try {
      log.info(`Processing ${IPC_EVENT.getBunny} event from electron thread`);
      event.returnValue = await database.getBunny(id);
    } catch (err) {
      event.returnValue = err; // TODO: Fixup all the callers to deal with the return error correctly
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getBunnies, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getBunnies} event from electron thread`);
      event.returnValue = await database.getAllBunnies();
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.addBunny, async (event: any, bunny: Bunny) => {
    try {
      log.info(`Processing ${IPC_EVENT.getBunny} event from electron thread with bunny name ${bunny.name}`);
      event.returnValue = await database.addBunny(bunny);
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.updateBunny, async (event: any, bunny: Bunny) => {
    log.info('Updating bunny with the following values');
    log.info(bunny);
    try {
      event.returnValue = await database.updateBunny(bunny);
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getGenders, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getGenders} event from electron thread`);
      event.returnValue = await database.getGenders();
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getRescueTypes, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getRescueTypes} event from electron thread`);
      event.returnValue = await database.getRescueTypes();
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getDateOfBirthExplanationTypes, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getDateOfBirthExplanationTypes} event from electron thread`);
      event.returnValue = await database.getDateOfBirthExplanations();
    } catch (err) {
      event.returnValue = err;
      throw err;
    }
  });

  ipcMain.on(IPC_EVENT.getSpayExplanationTypes, async (event: any) => {
    try {
      log.info(`Processing ${IPC_EVENT.getSpayExplanationTypes} event from electron thread`);
      event.returnValue = await database.getSpayExplanations();
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
