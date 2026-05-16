export const IST_TIMEZONE = 'Asia/Kolkata';

export interface IDateProvider {
  now(): Date;
  istDateString(now?: Date): string;
}

export class SystemDateProvider implements IDateProvider {
  now(): Date {
    return new Date();
  }

  istDateString(now?: Date): string {
    const date = now ?? this.now();
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: IST_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
