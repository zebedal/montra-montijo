"use client";

import { Control, Controller, useWatch } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import type { BusinessFormData } from "@/lib/schemas/businessFormSchema";

type Props = {
  control: Control<BusinessFormData>;
};

export function OpeningHours({ control }: Props) {
  const hours = useWatch({
    control,
    name: "openingHours"
  });

  if (!hours) return null;

  return (
    <div className="space-y-4">
      {hours.map((hour, index) => {
        const closed = hour.closed;

        return (
          <div
            key={hour.day}
            className="grid gap-4 rounded-lg border p-4 md:grid-cols-[120px_1fr_auto] md:items-center"
          >
            {/* DIA */}
            <Label className="font-medium">{hour.day}</Label>

            {/* HORAS */}
            <div className="flex flex-wrap items-center gap-3">
              <Controller
                control={control}
                name={`openingHours.${index}.open`}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="time"
                    disabled={closed}
                    className="w-full sm:w-36"
                  />
                )}
              />

              <span className="hidden md:block text-sm text-muted-foreground">
                às
              </span>

              <Controller
                control={control}
                name={`openingHours.${index}.close`}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="time"
                    disabled={closed}
                    className="w-full sm:w-36"
                  />
                )}
              />
            </div>

            {/* ENCERRADO */}
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name={`openingHours.${index}.closed`}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) =>
                      field.onChange(checked === true)
                    }
                  />
                )}
              />

              <Label>Encerrado</Label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
