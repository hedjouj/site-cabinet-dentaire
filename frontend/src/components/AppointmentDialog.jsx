import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  Phone,
  Mail,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

import { api } from "@/lib/api";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const schema = z.object({
  fullname: z.string().min(2, "Nom requis"),
  phone: z.string().min(8, "Téléphone requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  reason: z.string().min(3, "Motif requis"),
  preferred_days: z.array(z.string()).min(1, "Choisissez au moins un jour"),
  preferred_time: z.string().optional(),
  notes: z.string().optional(),
  consent: z.boolean().refine((v) => v === true, {
    message: "Consentement requis",
  }),
});

export default function AppointmentDialog({
  open,
  onOpenChange,
  practicePhoneE164,
  practicePhoneDisplay,
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullname: "",
      phone: "",
      email: "",
      reason: "",
      preferred_days: ["Lundi"],
      preferred_time: "",
      notes: "",
      consent: false,
    },
    mode: "onTouched",
  });

  const submitting = form.formState.isSubmitting;

  const toggleDay = (day) => {
    const cur = form.getValues("preferred_days") || [];
    const next = cur.includes(day) ? cur.filter((d) => d !== day) : [...cur, day];
    form.setValue("preferred_days", next, { shouldValidate: true });
  };

  const submit = form.handleSubmit(async (values) => {
    try {
      const payload = {
        ...values,
        email: values.email || null,
        preferred_time: values.preferred_time || null,
        notes: values.notes || null,
      };
      await api.post("/appointment-requests", payload);
      toast.success("Demande envoyée", {
        description:
          "Le cabinet vous recontactera pour confirmer le rendez-vous (confirmation par téléphone).",
      });
      form.reset();
      onOpenChange(false);
    } catch (e) {
      console.error(e);
      toast.error("Envoi impossible", {
        description:
          "Merci de réessayer ou de contacter le cabinet par téléphone.",
      });
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Demande de rendez-vous
          </DialogTitle>
          <DialogDescription>
            Ce formulaire envoie une demande au cabinet. La confirmation du créneau
            se fait ensuite par téléphone.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[1fr_0.95fr] md:items-start">
          <form onSubmit={submit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ar_fullname">Nom et prénom</Label>
                <Input
                  id="ar_fullname"
                  placeholder="Votre nom"
                  {...form.register("fullname")}
                />
                {form.formState.errors.fullname ? (
                  <p className="text-xs text-rose-700">
                    {form.formState.errors.fullname.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ar_phone">Téléphone</Label>
                <Input
                  id="ar_phone"
                  placeholder="06…"
                  {...form.register("phone")}
                />
                {form.formState.errors.phone ? (
                  <p className="text-xs text-rose-700">
                    {form.formState.errors.phone.message}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ar_email">Email (optionnel)</Label>
              <Input
                id="ar_email"
                type="email"
                placeholder="vous@exemple.fr"
                {...form.register("email")}
              />
              {form.formState.errors.email ? (
                <p className="text-xs text-rose-700">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ar_reason">Motif</Label>
              <Input
                id="ar_reason"
                placeholder="Ex : contrôle, douleur, détartrage…"
                {...form.register("reason")}
              />
              {form.formState.errors.reason ? (
                <p className="text-xs text-rose-700">
                  {form.formState.errors.reason.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label>Préférences de jours</Label>
              <div className="grid gap-2 sm:grid-cols-3">
                {days.map((d) => {
                  const checked = (form.watch("preferred_days") || []).includes(d);
                  return (
                    <button
                      type="button"
                      key={d}
                      onClick={() => toggleDay(d)}
                      className={`rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                        checked
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.preferred_days ? (
                <p className="text-xs text-rose-700">
                  {form.formState.errors.preferred_days.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Créneau souhaité (optionnel)</Label>
                <Select
                  value={form.watch("preferred_time") || ""}
                  onValueChange={(v) =>
                    form.setValue("preferred_time", v, { shouldValidate: true })
                  }
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Choisir" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Matin">Matin</SelectItem>
                    <SelectItem value="Midi">Midi</SelectItem>
                    <SelectItem value="Après-midi">Après-midi</SelectItem>
                    <SelectItem value="Fin de journée">Fin de journée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ar_notes">Notes (optionnel)</Label>
                <Input
                  id="ar_notes"
                  placeholder="Contrainte d’horaire, contexte…"
                  {...form.register("notes")}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="ar_consent"
                  checked={form.watch("consent")}
                  onCheckedChange={(v) =>
                    form.setValue("consent", Boolean(v), {
                      shouldValidate: true,
                    })
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="ar_consent">RGPD</Label>
                  <p className="text-xs leading-relaxed text-slate-600">
                    J’accepte que mes informations soient utilisées pour me
                    recontacter au sujet de ma demande.
                  </p>
                  {form.formState.errors.consent ? (
                    <p className="text-xs text-rose-700">
                      {form.formState.errors.consent.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                className="h-11 bg-slate-900 px-6 text-white hover:bg-slate-800"
                disabled={submitting}
              >
                {submitting ? "Envoi…" : "Envoyer la demande"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <ClipboardList className="h-4 w-4" />
                Comment a fonctionne
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-700" />
                  Vous envoyez une demande avec vos préférences.
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-slate-700" />
                  Le cabinet vous rappelle pour confirmer le créneau.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-950 p-5 text-white">
              <div className="text-sm font-semibold">Besoin urgent ?</div>
              <div className="mt-2 text-sm text-white/80">
                En cas de douleur importante, privilégiez l’appel.
              </div>
              <div className="mt-4 grid gap-2">
                <Button
                  className="w-full justify-between bg-white text-slate-950 hover:bg-white/90"
                  asChild
                >
                  <a href={`tel:${practicePhoneE164}`}>
                    <span className="inline-flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Appeler
                    </span>
                    <span className="text-sm font-medium">
                      {practicePhoneDisplay}
                    </span>
                  </a>
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 bg-transparent text-white hover:bg-white/10"
                  asChild
                >
                  <a href="#contact">
                    <span className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Contact
                    </span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
