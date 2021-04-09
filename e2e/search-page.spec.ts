import { SpectronClient } from 'spectron';
import commonSetup from './common-setup';
import NavBar, { NavBarOption } from './page-objects/navbar';
import SearchBunnyPage from './page-objects/search-bunny-page';
import * as path from 'path';
import Database from '../src/database/database';
import GENDER from '../src/app/entities/Gender';
import RESCUE_TYPE from '../src/app/entities/RescueType';
import { expect } from 'chai';
import * as log from 'electron-log';

describe('search page', function () {
  commonSetup.apply(this);

  let client: SpectronClient;
  let navBar: NavBar;
  let searchBunnyPage: SearchBunnyPage;
  let database: Database;

  beforeEach(async function () {
    client = this.app.client;
    navBar = new NavBar(this.app);
    searchBunnyPage = new SearchBunnyPage(client);
  });

  it('should autosuggest bunny names', async function() {
    await this.app.electron.remote.app.getPath('userData').then((value) => {
      database = new Database(path.join(value, 'database.sqlite'), false, false);
    });
    await database.ready();
    await database.addBunny({
      name: 'Bunny name',
      intakeReason: 'Reason for being intaken',
      intakeDate: new Date('2020-12-17T01:00:00'),
      gender: GENDER.MALE,
      rescueType: RESCUE_TYPE.dropOff,
      bondedBunnyIds: []
    });
    // Switch the tabs to force the database values to get reloaded into the UI
    await navBar.navigateTo(NavBarOption.ADD_BUNNY);
    await navBar.navigateTo(NavBarOption.SEARCH_BUNNY);

    await searchBunnyPage.searchField().type('Bunny');
    expect(await searchBunnyPage.searchField().getText()).to.equal('Bunny');
    expect(await searchBunnyPage.searchField().getSuggestions(1)).to.equal('Bunny name 2020');
    expect(await searchBunnyPage.searchField().suggestion(0).getText()).to.equal('Bunny name 2020');
  });

});
