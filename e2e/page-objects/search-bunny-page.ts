import { SpectronClient } from 'spectron';

export default class SearchBunnyPage {


  constructor(private client: SpectronClient) {
  }

  async waitUntilSelected(option: NavBarOption) {
    return await this.internal(option, true);
  }

  async waitUntilNotSelected(option: NavBarOption) {
    return await this.internal(option, false);
  }

  button(option: NavBarOption) {
    return this.getNavbarButton(option);
  }

  private async internal(option: NavBarOption, shouldBeSelected: boolean) {
    return await this.client.waitUntil(async () => {
      const a = this.getNavbarButton(option);
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

  private getNavbarButton(option: NavBarOption) {
    return this.client.$(`[data-test="${option.dataTestAttributeValue}"]`);
  }
}

export class NavBarOption {

  public static readonly ADD_BUNNY: NavBarOption = new NavBarOption('add-bunny-nav');
  public static readonly SEARCH_BUNNY: NavBarOption = new NavBarOption('search-bunnies-nav');

  constructor(public dataTestAttributeValue: string) {
  }

}

