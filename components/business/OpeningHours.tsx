"use client";

import {
  Control,
  Controller,
  UseFormClearErrors,
  UseFormSetValue,
  useFormState,
  useWatch
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

import type { BusinessFormData } from "@/lib/schemas/businessFormSchema";

type Props = {
  control: Control<BusinessFormData>;
  setValue: UseFormSetValue<BusinessFormData>;
  clearErrors: UseFormClearErrors<BusinessFormData>;
};

export function OpeningHours({
  control,
  setValue,
  clearErrors
}: Props) {
  const { errors } = useFormState({ control });
  const hours = useWatch({
    control,
    name: "openingHours"
  });

  if (!hours) return null;

  return (
    <div className="space-y-4">
      {hours.map((hour, index) => {
        const closed = hour.closed;
        const hasError = Boolean(errors.openingHours?.[index]);

        return (
          <div
            key={hour.day}
            className={`grid gap-4 rounded-lg border p-4 md:grid-cols-[120px_1fr_auto] md:items-start ${
              hasError ? "border-red-500" : ""
            }`}
          >
            {/* DIA */}
            <Label className="font-medium">{hour.day}</Label>

            {/* HORAS */}
            <div className="space-y-3">
              {!closed &&
                hour.periods.map((period, periodIndex) => (
                  <div
                    key={periodIndex}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <Controller
                      control={control}
                      name={`openingHours.${index}.periods.${periodIndex}.open`}
                      render={({ field, fieldState }) => (
                        <Input
                          {...field}
                          type="time"
                          aria-invalid={fieldState.invalid}
                          className="w-full sm:w-36"
                          onChange={(event) => {
                            field.onChange(event);
                            clearErrors("openingHours");
                          }}
                          onInput={() => clearErrors("openingHours")}
                        />
                      )}
                    />

                    <span className="text-sm text-muted-foreground">às</span>

                    <Controller
                      control={control}
                      name={`openingHours.${index}.periods.${periodIndex}.close`}
                      render={({ field, fieldState }) => (
                        <Input
                          {...field}
                          type="time"
                          aria-invalid={fieldState.invalid}
                          className="w-full sm:w-36"
                          onChange={(event) => {
                            field.onChange(event);
                            clearErrors("openingHours");
                          }}
                          onInput={() => clearErrors("openingHours")}
                        />
                      )}
                    />

                    {hour.periods.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remover período de ${hour.day}`}
                        onClick={() =>
                          setValue(
                            `openingHours.${index}.periods`,
                            hour.periods.filter(
                              (_, itemIndex) => itemIndex !== periodIndex
                            ),
                            {
                              shouldDirty: true,
                              shouldValidate: hasError
                            }
                          )
                        }
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}

              {!closed && hour.periods.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setValue(
                      `openingHours.${index}.periods`,
                      [...hour.periods, { open: "", close: "" }],
                      { shouldDirty: true }
                    )
                  }
                >
                  <Plus className="size-4" />
                  Adicionar período
                </Button>
              )}

              {hasError && (
                <p className="text-sm text-red-500">
                  Revê as horas deste dia. Preenche os dois campos e evita
                  períodos sobrepostos.
                </p>
              )}
            </div>

            {/* ENCERRADO */}
            <div className="flex items-center gap-2">
              <Controller
                control={control}
                name={`openingHours.${index}.closed`}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      const isClosed = checked === true;
                      field.onChange(isClosed);

                      if (isClosed) {
                        setValue(`openingHours.${index}.periods`, [], {
                          shouldDirty: true,
                          shouldValidate: true
                        });
                      } else if (hour.periods.length === 0) {
                        setValue(
                          `openingHours.${index}.periods`,
                          [{ open: "", close: "" }],
                          { shouldDirty: true, shouldValidate: true }
                        );
                      }
                    }}
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
