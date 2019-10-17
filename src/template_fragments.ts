import {MigrationFileExtension} from './types';

export const warningHeader = (libName: string) => `
/**********************************************
 *
 * DO NOT EDIT THIS FILE
 *
 * Generated from ${libName}
 *
 ******************************************** */
`;

export const importStatements = (extension: MigrationFileExtension) =>
    extension === 'ts' ? "import * as Knex from 'knex'" : '';

export const upMigrationDeclaration = (extension: MigrationFileExtension) =>
    extension === 'js'
        ? 'exports.up = async function(knex) {'
        : 'export async function up(knex: Knex): Promise<any> {';

export const downMigrationDeclaration = (extension: MigrationFileExtension) =>
    extension === 'js'
        ? 'exports.down = async function(knex) {'
        : 'export async function down(knex: Knex): Promise<any> {';