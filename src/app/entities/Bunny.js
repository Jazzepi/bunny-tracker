"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var moment = require("moment");
var Bunny = /** @class */ (function () {
    function Bunny(name, gender, intakeDate, rescueType, intakeReason, bondedBunnyIds, dateOfBirthExplanation, id, surrenderName, dateOfBirth, description, spayDate, passedAwayDate, passedAwayReason, spayExplanation) {
        this.name = name;
        this.gender = gender;
        this.intakeDate = intakeDate;
        this.rescueType = rescueType;
        this.intakeReason = intakeReason;
        this.bondedBunnyIds = bondedBunnyIds;
        this.dateOfBirthExplanation = dateOfBirthExplanation;
        this.id = id;
        this.surrenderName = surrenderName;
        this.dateOfBirth = dateOfBirth;
        this.description = description;
        this.spayDate = spayDate;
        this.passedAwayDate = passedAwayDate;
        this.passedAwayReason = passedAwayReason;
        this.spayExplanation = spayExplanation;
    }
    Bunny.from = function (formGroup, id) {
        var hasBondedBunnyControl = formGroup.controls.bondedBunnies != null;
        return new Bunny(formGroup.controls.name.value, formGroup.controls.gender.value, formGroup.controls.intakeDate.value ? moment(formGroup.controls.intakeDate.value).startOf('day').toDate() : null, formGroup.controls.rescueType.value, formGroup.controls.intakeReason.value, hasBondedBunnyControl ? (formGroup.controls.bondedBunnies.value ? formGroup.controls.bondedBunnies.value.map(function (bunnyBondOption) {
            return Number.parseInt(bunnyBondOption, 10);
        }) : []) : [], formGroup.controls.dateOfBirth.value ? formGroup.controls.dateOfBirthExplanation.value : null, // Ignore the value unless the date was set
        id, formGroup.controls.surrenderName.value, formGroup.controls.dateOfBirth.value ? moment(formGroup.controls.dateOfBirth.value).startOf('day').toDate() : null, formGroup.controls.description.value, formGroup.controls.spayDate.value ? moment(formGroup.controls.spayDate.value).startOf('day').toDate() : null, formGroup.controls.passedAwayDate ? (formGroup.controls.passedAwayDate.value ? moment(formGroup.controls.passedAwayDate.value).startOf('day').toDate() : null) : null, formGroup.controls.passedAwayReason ? (formGroup.controls.passedAwayReason.value) : null, formGroup.controls.spayDate.value ? formGroup.controls.spayExplanation.value : null);
    };
    return Bunny;
}());
exports.default = Bunny;
//# sourceMappingURL=Bunny.js.map