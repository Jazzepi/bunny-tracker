import { SpectronClient } from 'spectron';
import { Client } from 'webdriverio';
import RawResult = WebdriverIO.RawResult;
import Element = WebdriverIO.Element;
import GENDER from '../../src/app/entities/Gender';
import RESCUE_TYPE from '../../src/app/entities/RescueType';

export default class AddBunnyPage {


  constructor(private client: SpectronClient) {
  }

  public name(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="name"] input');
  }

  public async setNameTo(myNugget: string) {
    await this.name().click();
    this.client.keys(myNugget);
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
    return this.client.$('[data-test="rescueType"] .mat-select-value');
  }

  public rescueTypeSelected(): Client<RawResult<Element>> & RawResult<Element> {
    return this.client.$('[data-test="rescueType"] .mat-select-value-text > span');
  }

  public async setRescueTypeTo(rescueType: RESCUE_TYPE) {
    await this.rescueType().click();
    await this.client.$(`//span[text()=" ${rescueType} "]`).click();
  }

}
