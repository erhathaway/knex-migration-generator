# knex-migration-generator

Give your package the ability to generate Knex SQL migrations that install in a downstream service

## Install

```
npm install --save knex-migration-generator
```

## About

This library will give your package the ability to 'install' migrations in a downstream service.

## Usage

### 1. Bin

This library should be used in a `bin` file that your package publishes. For example:

```typescript
#! /usr/bin/env node
# dist/bin.js

generator(...args);
```

### 2. Generator

To use, import the generator function. Pass it `command line args`, `absolute path of your libraries migrations folder` and the `library name`. Optionally, you may pass it a function to create a closure scope around the generator function - This is a convient way to pass in additional information into the generator templates.

```typescript
import {generator} from 'knex-migration-generator';
import yargs from 'yargs';
import path from 'path';
import {customTableAndColumnNames} from '../dist/my_custom_config';

const p = path.resolve(__dirname, './migrations');
generator(yargs.argv, p, 'graphql_node_version', fn => fn(customTableAndColumnNames));
```

Note:
The `args` have the type signature:

```typescript
export interface IArgs {
    [argName: string]: unknown;
    _: string[];
    $0: string;
}
```

It may be helpful to use the `yargs` lib to pass in valid `args`.

### 3. Templates

The generator consumes templates defined in you libs migration folder and spits out valid knex migrations into the down stream consuming service's migration folder.

The steps to defining a template are:

#### 3A. Folder layout

Define you migrations as `generator templates`. Each template should be its own file in a migration folder. The migrations should be ordered. For example, you could have a folder structure like:

```
src/
  migrations/
    001_create_version_table.ts
    002_alter_version_table_add_column_hello.ts
```

#### 3B. Migration file

Inside each migration file, you should return a `migration generator` function.

The types for this function are:

```typescript
export type MigrationFileExtension = 'js' | 'ts';

export type MigrationGenerator = (extension: MigrationFileExtension) => string;
```

For example:

```typescript
# ./migrations/001_add_initial_tables.ts

return (extension: MigrationFileExtension = 'js') =>
    ...knex migraiton code
`;
```

#### 3C. Template fragments

In the generator template function you can include template fragments. For example, you may want to use ones for customizing the migration headers if you are unsure if the migrations will be used in a typescript or javascript repo.

Example:

```typescript
return (extension: MigrationFileExtension = 'js') => `
    ${importStatements(extension)}
    ${upMigrationDeclaration(extension)}
    await knex.schema.createTable('event_implementor_type', t => {
        t.increments('id')
            .unsigned()
            .primary();
        t.string('type').notNullable();
    });

    return await knex.table('event_implementor_type').insert([
        {
            type: 'NODE_CHANGE',
            id: 1
        },
        {
            type: 'NODE_FRAGMENT_CHANGE',
            id: 2
        },
        {
            type: 'LINK_CHANGE',
            id: 3
        }
    ]);
}`;
```

#### 4. Publishing packages with templates

The package that consumes the migration generator should publish the migration files. For example, if your source directory is `src` and your distribution directory is `dist`, you would want a way to move the `src/migrations/` template files to `dist/migrations/`. And, if the templates are written in `typescript`, you would want a way to transpile them to good old `JS`.

Doing this publishing step with a build tool like Rollup would look like:

```typescript
{
    input: ['src/migrations/**/*.ts'],
    output: [
        {
            dir: 'dist',
            format: 'cjs'
        }
    ],
    plugins: [multiInput(), ...commonPlugins],
    ...common
}
```

> The generator is designed to ignore any `.d.ts` files it finds. So if another rollup step adds `dist/migrations/*.d.ts` files you don't need to do anything.

The `bin.ts` file that would work with the above published templates might look something like:

```typescript
#! /usr/bin/env node

import yargs from 'yargs';
import {generator} from 'knex-migration-generator';
import path from 'path';

const p = path.resolve(__dirname, './migrations'); <--------- the path relative to the `bin` file
generator(yargs.argv, p, 'graphql_node_version', fn => fn());
```
