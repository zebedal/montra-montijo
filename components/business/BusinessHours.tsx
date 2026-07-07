import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BusinessHour {
  day: string;
  open_time: string | null;
  close_time: string | null;
  is_closed: boolean;
}

interface Props {
  hours: BusinessHour[];
}

function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : "";
}

export function BusinessHours({ hours }: Props) {
  const hasOpeningHours = hours.some(
    (hour) => !hour.is_closed && hour.open_time && hour.close_time
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horário</CardTitle>
      </CardHeader>

      <CardContent>
        {!hasOpeningHours ? (
          <div className="flex h-40 items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">
              Este negócio ainda não definiu o seu horário de funcionamento.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hours.map((hour) => (
              <div
                key={hour.day}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <span className="font-medium">{hour.day}</span>

                {hour.is_closed ? (
                  <span className="text-sm text-muted-foreground">
                    Encerrado
                  </span>
                ) : (
                  <span className="text-sm">
                    {formatTime(hour.open_time)} – {formatTime(hour.close_time)}
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
