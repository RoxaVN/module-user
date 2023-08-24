import { Max, Min, validateByClass } from '@roxavn/core/base';
import { Type } from 'class-transformer';

const A_MINUTE = 60 * 1000;
const AN_HOUR = 60 * A_MINUTE;
const A_DAY = 24 * AN_HOUR;
const A_YEAR = 365 * A_DAY;

class EnvClass {
  @Min(A_MINUTE)
  @Type(() => Number)
  ACCESS_TOKEN_TIME_TO_LIVE = A_YEAR;

  @Min(A_MINUTE)
  @Type(() => Number)
  REFRESH_TOKEN_TIME_TO_LIVE = A_YEAR;

  @Max(AN_HOUR)
  @Min(A_MINUTE)
  @Type(() => Number)
  SHORT_TIME_TO_LIVE = AN_HOUR;
}

export const Env = validateByClass(EnvClass, process.env);
