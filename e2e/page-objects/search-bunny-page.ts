import { SpectronClient } from 'spectron';
import { NavBarOption } from './navbar';
import { Client } from 'webdriverio';
import RawResult = WebdriverIO.RawResult;
import Element = WebdriverIO.Element;
import DATE_OF_BIRTH_EXPLANATION from '../../src/app/entities/DateOfBirthExplanation';
import SPAY_EXPLANATION from '../../src/app/entities/SpayExplanation';
import GENDER from '../../src/app/entities/Gender';
import RESCUE_TYPE from '../../src/app/entities/RescueType';

export default class SearchBunnyPage {


  constructor(private client: SpectronClient) {
  }

  async waitUntilSelected(option: NavBarOption) {
    return await this.internal(option, true);
  }

  async waitUntilNotSelected(option: NavBarOption) {
    return await this.internal(option, false);
  }

  private async internal(option: NavBarOption, shouldBeSelected: boolean) {
    return await this.client.waitUntil(async () => {
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
    return this.client.$(`[data-test="${option.dataTestAttributeValue}"]`);
  }

  public searchField(): SearchField {
    return new SearchField(this.client);
  }

  public name(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="name"] input');
  }

  public async setNameTo(name: string) {
    await this.name().click();
    this.client.keys(name);
  }

  public dateOfBirthExplanation(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="date-of-birth-explanation"] .mat-select-value');
  }

  public dateOfBirthExplanationSelected(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="date-of-birth-explanation"] .mat-select-value-text > span');
  }

  public async setDateOfBirthExplanationTo(dateOfBirthExplanation: DATE_OF_BIRTH_EXPLANATION) {
    await this.dateOfBirthExplanation().click();
    await this.client.$(`//span[text()=" ${dateOfBirthExplanation} "]`).click();
  }

  public spayDateExplanation(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="spay-date-explanation"] .mat-select-value');
  }

  public spayDateExplanationSelected(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="spay-date-explanation"] .mat-select-value-text > span');
  }

  public async setSpayDateExplanationTo(spayDateExplanation: SPAY_EXPLANATION) {
    await this.spayDateExplanation().click();
    await this.client.$(`//span[text()=" ${spayDateExplanation} "]`).click();
  }

  public dateOfBirth(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="birth-date"] input');
  }

  public async setDateOfBirthTo(dateOfBirth: string) {
    await this.dateOfBirth().click();
    const currentFieldValue = await this.dateOfBirth().getValue();
    this.client.keys('\u0008'.repeat(currentFieldValue.length));
    await this.dateOfBirth().setValue(dateOfBirth);
  }

  public intakeDate(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="intake-date"] input');
  }

  public async setIntakeDateTo(intakeDate: string) {
    await this.intakeDate().click();
    const currentFieldValue = await this.intakeDate().getValue();
    this.client.keys('\u0008'.repeat(currentFieldValue.length));
    await this.intakeDate().setValue(intakeDate);
  }

  public spayDate(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="spay-date"] input');
  }

  public async setSpayDateTo(spayDate: string) {
    const currentFieldValue = await this.spayDate().getValue();
    this.client.keys('\u0008'.repeat(currentFieldValue.length));
    await this.spayDate().setValue(spayDate);
  }

  public intakeReason(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="intake-reason"] textarea');
  }

  public async setIntakeReasonTo(intakeReason: string) {
    await this.intakeReason().click();
    this.client.keys(intakeReason);
  }

  public physicalDescription(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="physical-description"] textarea');
  }

  public async setPhysicalDescriptionTo(physicalDescription: string) {
    await this.physicalDescription().click();
    this.client.keys(physicalDescription);
  }

  public surrenderName(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="surrender-name"] input');
  }

  public async setSurrenderNameTo(surrenderName: string) {
    await this.surrenderName().click();
    this.client.keys(surrenderName);
  }

  public gender(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="gender"] .mat-select-value');
  }

  public genderSelected(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="gender"] .mat-select-value-text > span');
  }

  public async setGenderTo(gender: GENDER) {
    await this.gender().click();
    await this.client.$(`//span[text()=" ${gender} "]`).click();
  }

  public rescueType(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="rescue-type"] .mat-select-value');
  }

  public rescueTypeSelected(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="rescue-type"] .mat-select-value-text > span');
  }

  public async setRescueTypeTo(rescueType: RESCUE_TYPE) {
    await this.rescueType().click();
    await this.client.$(`//span[text()=" ${rescueType} "]`).click();
  }

  public saveBunnyButton(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="save-bunny"]');
  }
}

export class SearchField {

  constructor(private client: SpectronClient) {}

  public async type(text: string) {
    return await this.client.$('[data-test="search-bunny"] input').setValue(text);
  }

  public async getText() {
    return await this.client.$('[data-test="search-bunny"] input').getValue();
  }

  public async getSuggestions(minimumCount: number): Promise<string> {
    await this.client.waitUntil(async () => {
      return (await this.client.$$('.mat-autocomplete-panel .mat-option-text')).length >= minimumCount;
    });
    return this.client.getText('.mat-autocomplete-panel .mat-option-text');
  }

  public suggestion(indexOfSuggestion: number) {
    return this.client.$(`mat-option:nth-child(${indexOfSuggestion + 1})`);
  }
}
