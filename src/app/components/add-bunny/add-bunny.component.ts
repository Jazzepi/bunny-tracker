import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { DatabaseService } from '../../providers/DatabaseService';
import Bunny from '../../entities/Bunny';
import GENDER from '../../entities/Gender';
import RESCUE_TYPE from '../../entities/RescueType';
import { AlertService } from '../../providers/AlertService';
import DATE_OF_BIRTH_EXPLANATION from '../../entities/DateOfBirthExplanation';
import SPAY_EXPLANATION from '../../entities/SpayExplanation';

export interface GenderOption {
  value: GENDER;
}

export interface RescueTypeOption {
  value: RESCUE_TYPE;
}

export interface DateOfBirthExplanationOption {
  value: DATE_OF_BIRTH_EXPLANATION;
}

export interface SpayExplanationOption {
  value: SPAY_EXPLANATION;
}

@Component({
  selector: 'app-add-bunny',
  templateUrl: './add-bunny.component.html',
  styleUrls: ['./add-bunny.component.scss']
})
export class AddBunnyComponent implements OnInit {

  generalMinDate = moment().subtract(15, 'years').startOf('day');
  todaysDate = moment().startOf('day');

  allRescueTypes: RescueTypeOption[];
  allGenders: GenderOption[];
  allDateOfBirthExplanations: DateOfBirthExplanationOption[];
  allSpayExplanations: SpayExplanationOption[];

  data = new FormGroup({
    name: new FormControl(''),
    surrenderName: new FormControl(''),
    gender: new FormControl(''),
    intakeDate: new FormControl(moment().startOf('day')),
    intakeReason: new FormControl(''),
    description: new FormControl(''),
    spayDate: new FormControl(),
    spayExplanation: new FormControl({disabled: true, value: ''}),
    dateOfBirth: new FormControl(),
    dateOfBirthExplanation: new FormControl({disabled: true, value: ''}),
    rescueType: new FormControl()
  });

  constructor(private databaseService: DatabaseService, private alertService: AlertService) {
    this.data.controls.spayDate.valueChanges.subscribe(value => {
      value !== null ? this.data.controls.spayExplanation.enable() : this.data.controls.spayExplanation.disable();
      this.data.controls.spayExplanation.markAsTouched();
    });

    this.data.controls.dateOfBirth.valueChanges.subscribe(value => {
      value !== null ? this.data.controls.dateOfBirthExplanation.enable() : this.data.controls.dateOfBirthExplanation.disable();
      this.data.controls.dateOfBirthExplanation.markAsTouched();
    });

    databaseService.getGenders().subscribe({
      next: (genders: GenderOption[]) => {
        this.allGenders = genders;
      }
    });
    databaseService.getDateOfBirthExplanations().subscribe({
      next: (dateOfBirthExplanations: DateOfBirthExplanationOption[]) => {
        this.allDateOfBirthExplanations = dateOfBirthExplanations;
      }
    });
    this.databaseService.getSpayExplanations().subscribe({
      next: (spayExplanationOptions: SpayExplanationOption[]) => {
        this.allSpayExplanations = spayExplanationOptions;
      }
    });
    databaseService.getRescueTypes().subscribe({
      next: (rescueTypeOptions: RescueTypeOption[]) => {
        this.allRescueTypes = rescueTypeOptions;
      }
    });
  }

  ngOnInit() {

  }

  onSubmit() {
    this.databaseService.addBunny(Bunny.from(this.data, null)).subscribe({
      next: (value: Bunny) => {
        this.alertService.databaseSuccessSavingBunny(this.data.value.name);
        this.data.reset();
        this.data.get('intakeDate').setValue(moment().startOf('day'));
      },
      error: (error: any) => {
        this.alertService.databaseErrorSavingBunny(this.data.value.name, error);
      }
    });
  }

}
