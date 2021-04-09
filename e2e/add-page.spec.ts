import { SpectronClient } from 'spectron';
import commonSetup from './common-setup';
import NavBar, { NavBarOption } from './page-objects/navbar';
import AddBunnyPage from './page-objects/add-bunny-page';
import GENDER from '../src/app/entities/Gender';
import RESCUE_TYPE from '../src/app/entities/RescueType';
import { expect } from 'chai';
import SPAY_EXPLANATION from '../src/app/entities/SpayExplanation';
import DATE_OF_BIRTH_EXPLANATION from '../src/app/entities/DateOfBirthExplanation';
import SearchBunnyPage from './page-objects/search-bunny-page';

describe('search page', function () {
  commonSetup.apply(this);

  let client: SpectronClient;
  let navBar: NavBar;
  let addBunnyPage: AddBunnyPage;
  let searchBunnyPage: SearchBunnyPage;

  beforeEach(async function () {
    client = this.app.client;
    navBar = new NavBar(this.app);
    addBunnyPage = new AddBunnyPage(client);
    searchBunnyPage = new SearchBunnyPage(client);
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

});
