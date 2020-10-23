import { expect } from 'chai';
import { SpectronClient } from 'spectron';
import commonSetup from './common-setup';

describe('bunny-tracker application', function () {
  commonSetup.apply(this);

  let client: SpectronClient;

  beforeEach(function () {
    client = this.app.client;
  });

  it('should display navigation bar', async function () {
    const addBunnyText = await client.getText('[data-test="add-bunny-nav"]');
    expect(addBunnyText).to.equal('Add Bunny');
    const addBunnyIsEnabled = await client.isEnabled(
      '[data-test="add-bunny-nav"]'
    );
    expect(addBunnyIsEnabled).to.equal(true);

    const searchBunniesText = await client.getText(
      '[data-test="search-bunnies-nav"]'
    );
    expect(searchBunniesText).to.equal('Search Bunnies');
    const searchBunniesIsEnabled = await client.isEnabled(
      '[data-test="search-bunnies-nav"]'
    );
    expect(searchBunniesIsEnabled).to.equal(true);
  });

  it('should show add bunny page', async function () {
    await client.waitUntilWindowLoaded();

    const result: any = await client.execute(() => {
      const element: HTMLElement = document.querySelectorAll(
        'body > app-root > app-navbar > mat-toolbar > mat-toolbar-row > button:nth-child(2)'
      )[0] as HTMLElement;
      element.click();
      const name = document.querySelectorAll('[formcontrolname="name"]').length > 0;
      const surrenderName = document.querySelectorAll('[formcontrolname="surrenderName"]').length > 0;
      const gender = document.querySelectorAll('[formcontrolname="gender"]').length > 0;
      const intakeDate = document.querySelectorAll('[formcontrolname="intakeDate"]').length > 0;
      const description = document.querySelectorAll('[formcontrolname="description"]').length > 0;
      const spayDate = document.querySelectorAll('[formcontrolname="spayDate"]').length > 0;

      return { name, surrenderName, gender, intakeDate, description, spayDate };
    });

    await expect(result.value.name).to.equal(true);
    await expect(result.value.surrenderName).to.equal(true);
    await expect(result.value.gender).to.equal(true);
    await expect(result.value.intakeDate).to.equal(true);
    await expect(result.value.description).to.equal(true);
    await expect(result.value.spayDate).to.equal(true);
  });

  it('creates initial window', async function () {
    const count = await client.getWindowCount();
    await expect(count).to.equal(1);
  });
});
