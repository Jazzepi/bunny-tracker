import { expect } from 'chai';
import { SpectronClient } from 'spectron';
import commonSetup from './common-setup';
import NavBar, { NavBarOption } from './page-objects/navbar';
import SearchBunnyPage from './page-objects/search-bunny-page';
import AddBunnyPage from './page-objects/add-bunny-page';
import RESCUE_TYPE from '../src/app/entities/RescueType';
import GENDER from '../src/app/entities/Gender';
import DATE_OF_BIRTH_EXPLANATION from '../src/app/entities/DateOfBirthExplanation';
import SPAY_EXPLANATION from '../src/app/entities/SpayExplanation';

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

    await addBunnyPage.setNameTo('regular name');
    expect(await addBunnyPage.name().getValue()).to.equal('regular name');
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(false);

    await addBunnyPage.setSurrenderNameTo('surrender name');
    expect(await addBunnyPage.surrenderName().getValue()).to.equal('surrender name');
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(false);

    await addBunnyPage.setGenderTo(GENDER.FEMALE);
    expect(await addBunnyPage.genderSelected().getText()).to.equal(GENDER.FEMALE);
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(false);

    await addBunnyPage.setRescueTypeTo(RESCUE_TYPE.dropOff);
    expect(await addBunnyPage.rescueTypeSelected().getText()).to.equal(RESCUE_TYPE.dropOff);

    await addBunnyPage.setPhysicalDescriptionTo('physical description');
    expect(await addBunnyPage.physicalDescription().getValue()).to.equal('physical description');

    await addBunnyPage.setIntakeReasonTo('intake reason');
    expect(await addBunnyPage.intakeReason().getValue()).to.equal('intake reason');

    await addBunnyPage.setSpayDateTo('2/26/2021');
    expect(await addBunnyPage.spayDate().getValue()).to.equal('2/26/2021');
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(false);

    await addBunnyPage.setSpayDateExplanationTo(SPAY_EXPLANATION.actual);
    expect(await addBunnyPage.spayDateExplanation().getText()).to.equal(SPAY_EXPLANATION.actual);
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(true);

    const rightNow = new Date();
    expect(await addBunnyPage.intakeDate().getValue()).to.equal(`${rightNow.getMonth() + 1}/${rightNow.getDate()}/${rightNow.getFullYear()}`);
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(true);

    await addBunnyPage.setIntakeDateTo('2/1/2021');
    expect(await addBunnyPage.intakeDate().getValue()).to.equal('2/1/2021');
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(true);

    await addBunnyPage.setDateOfBirthTo('2/3/2021');
    expect(await addBunnyPage.dateOfBirth().getValue()).to.equal('2/3/2021');
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(false);

    await addBunnyPage.setDateOfBirthExplanationTo(DATE_OF_BIRTH_EXPLANATION.approximate);
    expect(await addBunnyPage.dateOfBirthExplanation().getText()).to.equal(DATE_OF_BIRTH_EXPLANATION.approximate);
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(true);

    await addBunnyPage.addNewBunnyButton().click();
    expect(await addBunnyPage.addNewBunnyButton().isEnabled()).to.equal(false);

    await navBar.navigateTo(NavBarOption.SEARCH_BUNNY);

    await searchBunnyPage.searchField().type('regular');
    expect(await searchBunnyPage.searchField().getText()).to.equal('regular');
    expect(await searchBunnyPage.searchField().getSuggestions(1)).to.equal('regular name 2021');
    expect(await searchBunnyPage.searchField().suggestion(0).getText()).to.equal('regular name 2021');

    await searchBunnyPage.searchField().suggestion(0).click();

    expect(await searchBunnyPage.name().getValue()).to.equal('regular name');
    expect(await searchBunnyPage.surrenderName().getValue()).to.equal('surrender name');
    expect(await searchBunnyPage.genderSelected().getText()).to.equal(GENDER.FEMALE);
    expect(await searchBunnyPage.rescueTypeSelected().getText()).to.equal(RESCUE_TYPE.dropOff);
    expect(await searchBunnyPage.physicalDescription().getValue()).to.equal('physical description');
    expect(await searchBunnyPage.intakeReason().getValue()).to.equal('intake reason');
    expect(await searchBunnyPage.spayDate().getValue()).to.equal('2/26/2021');
    expect(await searchBunnyPage.intakeDate().getValue()).to.equal('2/1/2021');
    expect(await searchBunnyPage.dateOfBirth().getValue()).to.equal('2/3/2021');
    expect(await searchBunnyPage.dateOfBirthExplanation().getText()).to.equal(DATE_OF_BIRTH_EXPLANATION.approximate);

    expect(await searchBunnyPage.saveBunnyButton().isEnabled()).to.equal(false);
  });

  // it('should autosuggest bunny names', async function() {
  //   searchBunnyPage.searchField().setValue('bunny search string');
  //   expect(await searchBunnyPage.searchField().getText()).to.equal('bunny search string');
  // });

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
