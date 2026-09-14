import { Global, Module } from '@nestjs/common'
import { Pool } from 'pg'
import { PG_POOL } from '../common/constants/injection-tokens.js'
import { databaseConfig } from './database.config.js'

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () => new Pool(databaseConfig()),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
