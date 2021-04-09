import { SpectronClient } from 'spectron';
import commonSetup from './common-setup';
import NavBar, { NavBarOption } from './page-objects/navbar';
import SearchBunnyPage from './page-objects/search-bunny-page';
import AddBunnyPage from './page-objects/add-bunny-page';

describe('bunny-tracker application', function () {
  commonSetup.apply(this);

  let client: SpectronClient;
  let navBar: NavBar;
  let searchBunnyPage: SearchBunnyPage;
  let addBunnyPage: AddBunnyPage;

  beforeEach(async function () {
    client = this.app.client;
    navBar = new NavBar(this.app);
    searchBunnyPage = new SearchBunnyPage(client);
    addBunnyPage = new AddBunnyPage(client);
  });

  it('should display navigation bar with current location', async function () {
    await navBar.waitUntilSelected(NavBarOption.SEARCH_BUNNY);
    await navBar.waitUntilNotSelected(NavBarOption.ADD_BUNNY);

    await navBar.navigateTo(NavBarOption.ADD_BUNNY);

    await navBar.waitUntilNotSelected(NavBarOption.SEARCH_BUNNY);
    await navBar.waitUntilSelected(NavBarOption.ADD_BUNNY);
  });

});
