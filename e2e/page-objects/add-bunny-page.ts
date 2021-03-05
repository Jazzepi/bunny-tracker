import { SpectronClient } from 'spectron';
import { Client } from 'webdriverio';
import RawResult = WebdriverIO.RawResult;
import Element = WebdriverIO.Element;
import GENDER from '../../src/app/entities/Gender';
import RESCUE_TYPE from '../../src/app/entities/RescueType';
import DATE_OF_BIRTH_EXPLANATION from '../../src/app/entities/DateOfBirthExplanation';
import SPAY_EXPLANATION from '../../src/app/entities/SpayExplanation';

export default class AddBunnyPage {


  constructor(private client: SpectronClient) {
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

  public addNewBunnyButton(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="add-new-bunny"]');
  }
}
