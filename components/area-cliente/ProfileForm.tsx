"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import {
  profileSchema,
  type ProfileFormData
} from "@/lib/schemas/profileSchema";
import { updateMyProfile } from "@/lib/queries/updateMyProfile";

type Props = {
  initialData: ProfileFormData;
};

export function ProfileForm({ initialData }: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialData
  });

  async function onSubmit(data: ProfileFormData) {
    try {
      const success = await updateMyProfile(data);

      if (!success) {
        toast.error("Não foi possível atualizar o perfil.", {
          position: "top-center"
        });

        return;
      }

      toast.success("Perfil atualizado com sucesso.", {
        position: "top-center"
      });

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error("Não foi possível atualizar o perfil.", {
        position: "top-center"
      });
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>

        <p className="mt-2 text-muted-foreground">
          Consulte e atualize os dados associados à sua conta.
        </p>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Dados pessoais</CardTitle>

          <CardDescription>
            Estes dados identificam o responsável pelos negócios associados à
            conta.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>

              <div className="relative">
                <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="name"
                  placeholder="O seu nome"
                  className="pl-10"
                  autoComplete="name"
                  {...register("fullName")}
                />
              </div>

              {errors.fullName && (
                <p className="text-sm text-destructive">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="email"
                  type="email"
                  className="pl-10"
                  readOnly
                  {...register("email")}
                />
              </div>

              <p className="text-sm text-muted-foreground">
                O email principal está associado ao início de sessão e não pode
                ser alterado nesta fase.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telemóvel</Label>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Telefone"
                  className="pl-10"
                  autoComplete="tel"
                  {...register("phone")}
                />
              </div>

              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="flex justify-end border-t pt-6">
              <Button type="submit" disabled={isSubmitting || !isDirty}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Spinner />A guardar...
                  </span>
                ) : (
                  "Guardar alterações"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
