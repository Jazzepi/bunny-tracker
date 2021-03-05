import { Application } from 'spectron';

export class NavBarOption {

  public static readonly ADD_BUNNY: NavBarOption = new NavBarOption('add-bunny-nav');
  public static readonly SEARCH_BUNNY: NavBarOption = new NavBarOption('search-bunnies-nav');

  constructor(public dataTestAttributeValue: string) {
  }

}

export default class NavBar {


  constructor(public app: Application) {
  }

  async waitUntilSelected(option: NavBarOption) {
    return await this.internal(option, true);
  }

  async waitUntilNotSelected(option: NavBarOption) {
    return await this.internal(option, false);
  }

  button(option: NavBarOption) {
    return this.navbarButton(option);
  }

  async navigateTo(option: NavBarOption) {
    this.button(option).click();
    await this.app.client.waitUntilWindowLoaded();
  }

  private async internal(option: NavBarOption, shouldBeSelected: boolean) {
    return await this.app.client.waitUntil(async () => {
      const a = this.navbarButton(option);
      const b = await a.getAttribute('class');
      if (b != null) {
        // @ts-ignore
        // tslint:disable-next-line:no-non-null-assertion
        const index = b!.indexOf('mat-accent');
        return shouldBeSelected ? index >= 1 : index === -1;
      } else {
        return false;
      }
    });
  }

  private navbarButton(option: NavBarOption) {
    return this.app.client.$(`[data-test="${option.dataTestAttributeValue}"]`);
  }
}
