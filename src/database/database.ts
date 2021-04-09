import * as sqlite from 'sqlite';
import * as path from 'path';
import Bunny from '../app/entities/Bunny';
import SQL from 'sql-template-strings';
import { Database as SDatabase } from 'sqlite';
import * as log from 'electron-log';
import * as moment from 'moment';
import IPC_EVENT from '../app/ipcEvents';
import GENDER from '../app/entities/Gender';
import RESCUE_TYPE from '../app/entities/RescueType';
import DATE_OF_BIRTH_EXPLANATION from '../app/entities/DateOfBirthExplanation';
import SPAY_EXPLANATION from '../app/entities/SpayExplanation';

// TODO: I need to add transaction crap here
export default class Database {
  private database: SDatabase;

  public getSpayExplanations(): Promise<SPAY_EXPLANATION[]> {
    return this.database.all<SPAY_EXPLANATION>(SQL`SELECT * FROM SpayExplanations`);
  }

  public getDateOfBirthExplanations(): Promise<DATE_OF_BIRTH_EXPLANATION[]> {
    return this.database.all<DATE_OF_BIRTH_EXPLANATION>(SQL`SELECT * FROM DateOfBirthExplanations`);
  }

  public getRescueTypes(): Promise<RESCUE_TYPE[]> {
    return this.database.all<RESCUE_TYPE>(SQL`SELECT * FROM RescueTypes`);
  }

  public getGenders(): Promise<GENDER[]> {
    return this.database.all<GENDER>(SQL`SELECT * FROM Genders`);
  }

  public async updateBunny(bunny: Bunny): Promise<void> {
    log.info(`Processing ${IPC_EVENT.updateBunny} event from electron thread with bunny named ${bunny.name}`);
    await this.database.run(SQL`
UPDATE
Bunnies SET
  name=${bunny.name},
  gender=${bunny.gender},
  rescueType=${bunny.rescueType},
  intakeDate=${bunny.intakeDate ? moment(bunny.intakeDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  intakeReason=${bunny.intakeReason},
  surrenderName=${bunny.surrenderName},
  dateOfBirth=${bunny.dateOfBirth ? moment(bunny.dateOfBirth).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  description=${bunny.description},
  spayDate=${bunny.spayDate ? moment(bunny.spayDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  passedAwayDate=${bunny.passedAwayDate ? moment(bunny.passedAwayDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
  passedAwayReason=${bunny.passedAwayReason},
  dateOfBirthExplanation=${bunny.dateOfBirthExplanation},
  spayExplanation=${bunny.spayExplanation}
WHERE Bunnies.id = ${bunny.id}`);

    // Delete all relationships with this bunny
    await this.database.run(SQL`
DELETE FROM BunnyBondedToBunny
WHERE BunnyBondedToBunny.firstBunny = ${bunny.id} OR
      BunnyBondedToBunny.secondBunny = ${bunny.id}
`);
    // Reinsert all relationships with this bunny
    if (bunny.bondedBunnyIds.length > 0) {
      log.info('re-inserting relationships');
      const sqlStatement = `
INSERT INTO
BunnyBondedToBunny(firstBunny,
                   secondBunny)
VALUES ${bunny.bondedBunnyIds.reduce((previousValue, currentValue, index, ids) => {
        return `${previousValue}(${bunny.id}, ${currentValue})${ids.length - 1 === index ? '' : ', '}`;
      }, '')}
`;
      log.info(`Running ${sqlStatement}`);
      await this.database.run(sqlStatement);
    }
  }

  public async addBunny(bunny: Bunny): Promise<Bunny> {
    const sqlStatement = SQL`
      INSERT INTO
      bunnies(name,
              gender,
              rescueType,
              intakeDate,
              intakeReason,
              surrenderName,
              dateOfBirth,
              description,
              spayDate,
              dateOfBirthExplanation,
              spayExplanation)
      VALUES (${bunny.name},
              ${bunny.gender},
              ${bunny.rescueType},
              ${bunny.intakeDate ? moment(bunny.intakeDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
              ${bunny.intakeReason},
              ${bunny.surrenderName},
              ${bunny.dateOfBirth ? moment(bunny.dateOfBirth).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
              ${bunny.description},
              ${bunny.spayDate ? moment(bunny.spayDate).format('YYYY/MM/DD HH:mm:ss.SSS') : null},
              ${bunny.dateOfBirthExplanation},
              ${bunny.spayExplanation})`;
    log.info(`Running query [${sqlStatement.text}]`);
    log.info(`Parameters [${sqlStatement.values}]`);
    const statement = await this.database.run(sqlStatement);
    bunny.id = statement.lastID;
    return bunny;
  }

  public async getAllBunnies(): Promise<Bunny[]> {
    //       log.info(`Found ${queryResults.length} bunnies`);
    //       log.info(`Consolidated them to ${consolidatedResults.length} bunnies`);

    interface BondedBunnyReturnValues {
      firstBunny: number,
      secondBunny: number
    }

    type QueryResult = Bunny & BondedBunnyReturnValues;

    return this.database.all<QueryResult>(
      SQL`SELECT *
          FROM Bunnies
                 LEFT OUTER JOIN BunnyBondedToBunny ON Bunnies.id = BunnyBondedToBunny.firstBunny OR
                                                       Bunnies.id = BunnyBondedToBunny.secondBunny;
      `)
      .then((queryResults: QueryResult[]) => {
        return queryResults.reduce<Bunny[]>((results: Bunny[], currentValue: QueryResult, _currentIndex, array): Bunny[] => {
          // Have I already recorded this bunny in the output array?
          const possibleBunnyAlreadyInResults: Bunny | undefined = results.find((value: Bunny) => {
            return value.id === currentValue.id;
          });
          if (possibleBunnyAlreadyInResults) {
            // Add the bunny that isn't this bunny into the bondedBunnyIds
            // For example you don't want bunny with id 5 to have bondedBunnyIds = [3, 10, 5] because that says its bonded to itself
            if (currentValue.firstBunny) {
              possibleBunnyAlreadyInResults.bondedBunnyIds.push(currentValue.firstBunny !== currentValue.id ? currentValue.firstBunny : currentValue.secondBunny);
            }
          } else {
            if (currentValue.firstBunny !== null && currentValue.firstBunny !== undefined) {
              currentValue.bondedBunnyIds = [currentValue.firstBunny !== currentValue.id ? currentValue.firstBunny : currentValue.secondBunny];
            } else {
              currentValue.bondedBunnyIds = [];
            }
            results.push(currentValue);
          }
          return results;
        }, []);
      });
  }

  public async ready(): Promise<void> {
    log.info(`Opening database connection for database at [${this.databasePath}]`);
    this.database = await sqlite.open(this.databasePath);
    if (this.shouldBeMigrated) {
      const migrationsPath = this.serve ? 'src/assets/migrations' : path.join(__dirname, '..', '..', 'dist', 'assets', 'migrations');
      log.info(`Applying migrations from [${migrationsPath}]`);
      await (this.database.migrate({
        // force: serve ? 'last' : undefined,
        migrationsPath
      }).then(value => {
        log.info(value);
      }).catch(reason => {
        log.error(reason);
      }));
    }
    log.info('Enabling foreign key check.');
    await this.database.run('PRAGMA foreign_keys = ON;');
  }

  public getBunny(id: number): Promise<Bunny> {
    return this.database.get<Bunny>(SQL`SELECT *
                                        FROM bunnies
    WHERE id = ${id}`);
  }

  constructor(public databasePath: string, private serve: boolean, private shouldBeMigrated: boolean = true) {
  }
}
