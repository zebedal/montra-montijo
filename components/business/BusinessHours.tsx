import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBusinessOpeningStatus } from "@/lib/business-opening-status";

interface BusinessHour {
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
  period_order?: number;
}

interface Props {
  hours: BusinessHour[];
  is24Hours: boolean;
}

function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : "";
}

const orderedDays = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo"
];

export function BusinessHours({ hours, is24Hours }: Props) {
  const hasOpeningHours = hours.some(
    (hour) => !hour.is_closed && hour.open_time && hour.close_time
  );

  const status = getBusinessOpeningStatus(hours);

  const groupedHours = orderedDays.map((day) => ({
    day,
    periods: hours
      .filter(
        (hour) =>
          hour.day === day &&
          !hour.is_closed &&
          hour.open_time &&
          hour.close_time
      )
      .sort((a, b) =>
        (a.open_time ?? "").localeCompare(b.open_time ?? "")
      )
  }));

  return (
    <Card id="horario" tabIndex={-1} className="scroll-mt-32 outline-none">
      <CardHeader>
        <CardTitle>Horário</CardTitle>
        {(is24Hours || hasOpeningHours) && (
          <div className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2">
            <div
              className={`h-3 w-3 rounded-full ${
                is24Hours || status.open ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <div className="text-sm">
              <span className="font-medium">
                {is24Hours
                  ? "Disponível 24 horas"
                  : status.open
                    ? "Aberto agora"
                    : "Encerrado agora"}
              </span>

              {!is24Hours && <span className="text-muted-foreground">
                {" · "}
                {status.message}
              </span>}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {is24Hours ? (
          <div className="flex h-28 items-center justify-center rounded-xl border border-green-200 bg-green-50 px-6 text-center">
            <p className="text-sm font-medium text-green-800">
              Este profissional está disponível 24 horas por dia, todos os dias.
            </p>
          </div>
        ) : !hasOpeningHours ? (
          <div className="flex h-40 items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Este negócio ainda não definiu o seu horário de funcionamento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedHours.map(({ day, periods }) => (
              <div
                key={day}
                className={`flex items-center justify-between rounded-lg px-2 py-2.5 ${
                  day === status.today
                    ? "bg-green-50 text-green-950"
                    : "border-b last:border-0"
                }`}
              >
                <span className="font-medium">
                  {day}
                  {day === status.today && (
                    <span className="ml-1.5 text-xs font-normal text-green-700">
                      Hoje
                    </span>
                  )}
                </span>

                {periods.length === 0 ? (
                  <span className="text-sm text-muted-foreground">
                    Encerrado
                  </span>
                ) : (
                  <span className="text-right text-sm">
                    {periods
                      .map(
                        (period) =>
                          `${formatTime(period.open_time)}–${formatTime(period.close_time)}`
                      )
                      .join(", ")}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
