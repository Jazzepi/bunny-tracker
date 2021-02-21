import { expect } from 'chai';
import { SpectronClient } from 'spectron';
import commonSetup from './common-setup';
import NavBar, { NavBarOption } from './page-objects/navbar';
import SearchBunnyPage from './page-objects/search-bunny-page';
import AddBunnyPage from './page-objects/add-bunny-page';
import RESCUE_TYPE from '../src/app/entities/RescueType';
import GENDER from '../src/app/entities/Gender';

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

  it('lets me add bunnies', async function () {
    await navBar.navigateTo(NavBarOption.ADD_BUNNY);

    await addBunnyPage.setNameTo('my nugget');
    expect(await addBunnyPage.name().getValue()).to.equal('my nugget');

    await addBunnyPage.setGenderTo(GENDER.FEMALE);
    expect(await addBunnyPage.genderSelected().getText()).to.equal(GENDER.FEMALE);

    await addBunnyPage.setRescueTypeTo(RESCUE_TYPE.dropOff);
    expect(await addBunnyPage.rescueTypeSelected().getText()).to.equal(RESCUE_TYPE.dropOff);
  });

  // it('should show add bunny page', async function () {
  //   // await client.waitForVisible('[data-test="add-bunny-nav"]');
  //   // await client.waitForEnabled('[data-test="add-bunny-nav"]');
  //   // await client.waitForVisible('#blah');
  //   await client.$('#bar').click();
  //   // test.click();
  //   // return client.click('#blah').then(() => {
  //   //   console.log('Click without $ callback');
  //   //   client.$('#blah').click().then(() => {
  //   //     console.log('waiting callback');
  //   //     return client.pause(3000).then(() => {
  //   //       return () => console.log('done');
  //   //     });
  //   //   });
  //   // });
  //   // await client.waitUntil(() => {
  //   //
  //   // })
  //   // console.log('Waiting');
  //   // await client.pause(3000);
  //   // await (await client.$('[data-test="add-bunny-nav"]').click());
  //   // await client.click('[data-test="add-bunny-nav"]');
  //   // console.log('Waiting');
  //   // await client.pause(3000);
  //   // await client.click('[data-test="add-bunny-nav"] span');
  //   // console.log('Waiting');
  //   // await client.pause(3000);
  //   // await client.$('[data-test="add-bunny-nav"]').click();
  //   // console.log('Waiting');
  //   // await client.pause(3000);
  //   // // await client.click('[data-test="add-bunny-nav"] div.mat-button-ripple');
  //   // // await client.click('[data-test="add-bunny-nav"] div.mat-button-focus-overlay');
  //   //
  //   // // button[data-test="add-bunny-nav"]
  //   // // button[data-test="add-bunny-nav"] span
  //   // // button[data-test="add-bunny-nav"] div.mat-button-ripple
  //   // // button[data-test="add-bunny-nav"] div.mat-button-focus-overlay
  //   // // tslint:disable-next-line:no-non-null-assertion
  //   // await client.waitUntil(async () => {
  //   //   const a = client.$('[data-test="add-bunny-nav"]');
  //   //   const b = await a.getAttribute('class');
  //   //   if (b !== null) {
  //   //     // @ts-ignore
  //   //     // tslint:disable-next-line:no-non-null-assertion
  //   //     return b!.indexOf('mat-accent') >= 0;
  //   //   } else {
  //   //     return false;
  //   //   }
  //   // });
  //   // console.log(await client.waitForValue().getHTML('[data-test="add-bunny-nav"]'));
  //   // await client.click('[data-test="add-bunny-nav"]');
  //   // await client.waitForSelected('[data-test="add-bunny-nav"]');
  //   // const result: any = await client.execute(() => {
  //   //   const element: HTMLElement = document.querySelectorAll(
  //   //     '[data-test="add-bunny-nav"]'
  //   //   )[0] as HTMLElement;
  //   //   element.click();
  //   //   const name = document.querySelectorAll('[formcontrolname="name"]').length > 0;
  //   //   const surrenderName = document.querySelectorAll('[formcontrolname="surrenderName"]').length > 0;
  //   //   const gender = document.querySelectorAll('[formcontrolname="gender"]').length > 0;
  //   //   const intakeDate = document.querySelectorAll('[formcontrolname="intakeDate"]').length > 0;
  //   //   const description = document.querySelectorAll('[formcontrolname="description"]').length > 0;
  //   //   const spayDate = document.querySelectorAll('[formcontrolname="spayDate"]').length > 0;
  //   //
  //   //   return { name, surrenderName, gender, intakeDate, description, spayDate };
  //   // });
  //   // console.log($('[data-test="add-bunny-nav"]').getText());
  //   // const searchBunniesText = await client.getText('[data-test="search-bunnies-nav"]');
  //   // expect(searchBunniesText).to.equal('Search Bunnies');
  //   // const searchBunniesIsEnabled = await client.isSelected('[data-test="search-bunnies-nav"]');
  //   // expect(searchBunniesIsEnabled).to.equal(true);
  // });
  //
  // it('creates initial window', async function () {
  //   const count = await client.getWindowCount();
  //   await expect(count).to.equal(1);
  // });
});
