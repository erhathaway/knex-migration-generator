// tslint:disable

import {DEFAULT_EXT, DEFAULT_TABLE_NAME} from './constants';
import {resolveClientNameWithAliases} from './helpers';

const fs = require('fs');

/**
 * ********************************************************************
 * From: https://github.com/tgriesser/knex/blob/master/bin/utils/cli-config-utils.js
 * ********************************************************************
 */

function mkConfigObj(opts) {
    if (!opts.client) {
        const path = resolveDefaultKnexfilePath();
        throw new Error(
            `No default configuration file '${path}' found and no commandline connection parameters passed`
        );
    }

    const envName = opts.env || process.env.NODE_ENV || 'development';
    const resolvedClientName = resolveClientNameWithAliases(opts.client);
    const useNullAsDefault = resolvedClientName === 'sqlite3';
    return {
        ext: DEFAULT_EXT,
        [envName]: {
            useNullAsDefault,
            client: opts.client,
            connection: opts.connection,
            migrations: {
                directory: opts.migrationsDirectory,
                tableName: opts.migrationsTableName || DEFAULT_TABLE_NAME
            }
        }
    };
}

function resolveKnexFilePath() {
    const jsPath = resolveDefaultKnexfilePath('js');
    if (fs.existsSync(jsPath)) {
        return {
            path: jsPath,
            extension: 'js'
        };
    }

    const tsPath = resolveDefaultKnexfilePath('ts');
    if (fs.existsSync(tsPath)) {
        return {
            path: tsPath,
            extension: 'ts'
        };
    }

    console.warn(
        `Failed to find configuration at default location of ${resolveDefaultKnexfilePath('js')}`
    );
}

function resolveDefaultKnexfilePath(extension) {
    return process.cwd() + `/knexfile.${extension}`;
}

export {mkConfigObj, resolveKnexFilePath};

// tslint:enable
