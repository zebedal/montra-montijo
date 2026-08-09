export type OpeningHourEntry = {
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
};

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado"
] as const;

const englishWeekDays: Record<string, (typeof weekDays)[number]> = {
  Sunday: "Domingo",
  Monday: "Segunda",
  Tuesday: "Terça",
  Wednesday: "Quarta",
  Thursday: "Quinta",
  Friday: "Sexta",
  Saturday: "Sábado"
};

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getLisbonDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return {
    day: englishWeekDays[values.weekday],
    minutes: Number(values.hour) * 60 + Number(values.minute)
  };
}

function getPeriods(hours: OpeningHourEntry[], day: string) {
  return hours
    .filter(
      (hour) =>
        hour.day === day &&
        !hour.is_closed &&
        hour.open_time &&
        hour.close_time
    )
    .map((hour) => ({
      open: hour.open_time!,
      close: hour.close_time!,
      openMinutes: timeToMinutes(hour.open_time!),
      closeMinutes: timeToMinutes(hour.close_time!)
    }))
    .sort((a, b) => a.openMinutes - b.openMinutes);
}

export function getBusinessOpeningStatus(
  hours: OpeningHourEntry[],
  now = new Date()
) {
  const { day: today, minutes: currentMinutes } = getLisbonDateParts(now);
  const todayIndex = weekDays.indexOf(today);
  const previousDay = weekDays[(todayIndex + weekDays.length - 1) % weekDays.length];
  const previousPeriods = getPeriods(hours, previousDay);
  const todayPeriods = getPeriods(hours, today);

  const previousOvernightPeriod = previousPeriods.find(
    (period) =>
      period.closeMinutes <= period.openMinutes &&
      currentMinutes < period.closeMinutes
  );

  if (previousOvernightPeriod) {
    return {
      open: true,
      message: `Fecha às ${previousOvernightPeriod.close.slice(0, 5)}`,
      today
    };
  }

  for (const [index, period] of todayPeriods.entries()) {
    const closeMinutes =
      period.closeMinutes <= period.openMinutes
        ? period.closeMinutes + 24 * 60
        : period.closeMinutes;

    if (currentMinutes >= period.openMinutes && currentMinutes < closeMinutes) {
      return {
        open: true,
        message: `Fecha às ${period.close.slice(0, 5)}`,
        today
      };
    }

    if (currentMinutes < period.openMinutes) {
      return {
        open: false,
        message: `${index > 0 ? "Reabre" : "Abre"} às ${period.open.slice(0, 5)}`,
        today
      };
    }
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const nextDay = weekDays[(todayIndex + offset) % weekDays.length];
    const nextPeriod = getPeriods(hours, nextDay)[0];

    if (nextPeriod) {
      return {
        open: false,
        message: `${offset === 1 ? "Abre amanhã" : `Abre ${nextDay.toLocaleLowerCase("pt-PT")}`} às ${nextPeriod.open.slice(0, 5)}`,
        today
      };
    }
  }

  return { open: false, message: "Sem próxima abertura definida", today };
}
