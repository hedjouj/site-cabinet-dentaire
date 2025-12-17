import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarDays,
  ShieldCheck,
  Clock,
  MapPin,
  Phone,
  Check,
  ExternalLink,
  PencilLine,
  Save,
  RotateCcw,
  Info,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";

import { api } from "@/lib/api";

function useSiteContentState({ content, setContent }) {
  const update = React.useCallback(
    (updater) => {
      setContent((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        return next;
      });
    },
    [setContent],
  );

  const save = React.useCallback(async () => {
    try {
      await api.put("/site-content", { content });
      toast.success("Sauvegardé", {
        description: "Contenu enregistré sur le serveur.",
      });
    } catch (e) {
      console.error(e);
      toast.error("Sauvegarde impossible", {
        description: "Vérifiez la connexion au serveur.",
      });
    }
  }, [content]);

  const reset = React.useCallback(async () => {
    try {
      const res = await api.get("/site-content");
      setContent(res.data.content);
      toast.message("Contenu rechargé", {
        description: "Dernière version récupérée depuis le serveur.",
      });
    } catch (e) {
      console.error(e);
      toast.error("Impossible de recharger", {
        description: "Vérifiez la connexion au serveur.",
      });
    }
  }, [setContent]);

  return { update, save, reset };
}

const contactSchema = z.object({
  fullname: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Téléphone requis"),
  message: z.string().min(10, "Message trop court"),
  consent: z.boolean().refine((v) => v === true, {
    message: "Consentement requis",
  }),
});

function EditableText({
  label,
  value,
  onChange,
  edit,
  multiline,
  placeholder,
}) {
  if (!edit) {
    return (
      <div className="space-y-1">
        {label ? (
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </div>
        ) : null}
        {multiline ? (
          <p className="text-sm leading-relaxed text-slate-700">{value}</p>
        ) : (
          <p className="text-sm text-slate-700">{value}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label ? (
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
      ) : null}
      {multiline ? (
        <Textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[96px] bg-white/70"
        />
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="bg-white/70"
        />
      )}
      <div className="text-xs text-slate-500">
        Modification locale (enregistrée dans votre navigateur).
      </div>
    </div>
  );
}

export default function Home({ content, setContent, onAppointment }) {
  const { update, save, reset } = useSiteContentState({ content, setContent });
  const [editMode, setEditMode] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [loadingMessages, setLoadingMessages] = React.useState(true);

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullname: "",
      email: "",
      phone: "",
      message: "",
      consent: false,
    },
    mode: "onTouched",
  });

  const address = content.practice.address;
  const phoneE164 = content.practice.phoneE164;

  const mapSrc = React.useMemo(() => {
    const q = encodeURIComponent(address);
    return `https://www.google.com/maps?q=${q}&output=embed`;
  }, [address]);

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      const res = await api.post("/contact-messages", data);
      setMessages((prev) => [res.data, ...prev].slice(0, 20));
      form.reset();
      toast.success("Message envoyé", {
        description: "Votre demande a bien été transmise au cabinet.",
      });
    } catch (e) {
      console.error(e);
      toast.error("Envoi impossible", {
        description: "Merci de réessayer ou d'appeler le cabinet.",
      });
    }
  });

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/contact-messages", { params: { limit: 20 } });
        if (!mounted) return;
        setMessages(res.data);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setMessages([]);
        toast.error("Impossible de charger les messages", {
          description: "Vérifiez la connexion au serveur.",
        });
      } finally {
        if (mounted) setLoadingMessages(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-10 md:px-6 md:pb-16 md:pt-14">
          <div className="grid gap-10 md:grid-cols-[1.15fr_0.85fr] md:items-start">
            <div className="space-y-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="border border-slate-200 bg-white/70 text-slate-700">
                  {content.practice.citySeo} (31600)
                </Badge>
                <Badge className="border border-slate-200 bg-white/70 text-slate-700">
                  Cabinet dentaire
                </Badge>
                <Badge className="border border-slate-200 bg-white/70 text-slate-700">
                  Accueil & prévention
                </Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-950 md:text-5xl">
                  {content.hero.title}
                </h1>
                <p className="max-w-xl text-pretty text-base leading-relaxed text-slate-700 md:text-lg">
                  {content.hero.subtitle}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-11 gap-2 bg-slate-900 px-6 text-white hover:bg-slate-800"
                  onClick={onAppointment}
                >
                  <CalendarDays className="h-4 w-4" />
                  Demande de rendez-vous
                </Button>
                <Button
                  variant="outline"
                  className="h-11 gap-2 px-6"
                  asChild
                >
                  <a href="#contact">
                    <Phone className="h-4 w-4" />
                    {content.hero.secondaryCta}
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-slate-600" />
                  Hygiène & protocoles
                </span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-slate-600" />
                  Explications claires
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-600" />
                  Horaires étendus
                </span>
              </div>

              <div className="text-sm text-slate-600">
                {content.hero.reassurance}
              </div>
            </div>

            {/* Info card (glass) */}
            <div className="relative">
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-b from-white/70 to-transparent blur-2xl" />
              <Card className="overflow-hidden border-slate-200 bg-white/70 backdrop-blur-xl">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-lg text-slate-900">
                    Informations rapides
                  </CardTitle>
                  <div className="text-sm text-slate-600">
                    Docteur Charlotte Gendre — Chirurgien-Dentiste
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-4 w-4 text-slate-600" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          Adresse
                        </div>
                        <div className="text-sm text-slate-600">{address}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="mt-0.5 h-4 w-4 text-slate-600" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          Téléphone
                        </div>
                        <a
                          className="text-sm text-slate-700 underline-offset-4 hover:underline"
                          href={`tel:${phoneE164}`}
                        >
                          {content.practice.phoneDisplay}
                        </a>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="text-sm font-medium text-slate-900">
                      Mode édition (démo)
                    </div>
                    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/60 px-4 py-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-slate-900">
                          Modifier les textes
                        </div>
                        <div className="text-xs text-slate-500">
                          Les changements sont sauvegardés localement.
                        </div>
                      </div>
                      <Switch
                        checked={editMode}
                        onCheckedChange={setEditMode}
                        aria-label="Activer le mode édition"
                      />
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => {
                          setEditMode(true);
                          toast.message("Mode édition activé", {
                            description:
                              "Vous pouvez modifier les champs dans les sections.",
                          });
                        }}
                      >
                        <PencilLine className="h-4 w-4" />
                        Éditer
                      </Button>
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={reset}
                      >
                        <RotateCcw className="h-4 w-4" />
                        Réinitialiser
                      </Button>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <span className="inline-flex items-start gap-2">
                        <Info className="mt-0.5 h-4 w-4" />
                        Les fonctionnalités de prise de rendez-vous et d’envoi email
                        sont à intégrer plus tard (backend).
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="cabinet" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  {content.aboutDoctor.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Présentation professionnelle — contenu modifiable.
                </p>
              </div>

              <EditableText
                label="Présentation"
                value={content.aboutDoctor.text}
                edit={editMode}
                multiline
                onChange={(v) =>
                  update((prev) => ({
                    ...prev,
                    aboutDoctor: { ...prev.aboutDoctor, text: v },
                  }))
                }
              />

              <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 backdrop-blur-xl">
                <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Zone réservée
                </div>
                <EditableText
                  value={content.aboutDoctor.reserved}
                  edit={editMode}
                  multiline
                  onChange={(v) =>
                    update((prev) => ({
                      ...prev,
                      aboutDoctor: { ...prev.aboutDoctor, reserved: v },
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  {content.aboutOffice.title}
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Un cadre rassurant, une approche claire.
                </p>
              </div>

              <EditableText
                label="Le cabinet"
                value={content.aboutOffice.text}
                edit={editMode}
                multiline
                onChange={(v) =>
                  update((prev) => ({
                    ...prev,
                    aboutOffice: { ...prev.aboutOffice, text: v },
                  }))
                }
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {content.aboutOffice.images.map((img) => (
                  <Card
                    key={img.src}
                    className="overflow-hidden border-slate-200 bg-white/70 backdrop-blur"
                  >
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={img.src}
                        alt={img.alt}
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                    <CardContent className="py-3">
                      <div className="text-sm font-medium text-slate-900">
                        {img.label}
                      </div>
                      <div className="text-xs text-slate-500">
                        Photo d’illustration (sobre, non-identifiante)
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="soins" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                {content.services.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {content.services.intro}
              </p>
            </div>
            <Button variant="outline" className="gap-2" onClick={save}>
              <Save className="h-4 w-4" />
              Sauvegarder
            </Button>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white/70 p-4 backdrop-blur-xl md:p-6">
            <Tabs defaultValue={content.services.categories[0]?.id}>
              <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent">
                {content.services.categories.map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className="data-[state=active]:bg-slate-900 data-[state=active]:text-white"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {content.services.categories.map((cat) => (
                <TabsContent key={cat.id} value={cat.id} className="mt-6">
                  <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-start">
                    <div>
                      <Accordion type="single" collapsible className="w-full">
                        {cat.items.map((it, idx) => (
                          <AccordionItem
                            key={`${cat.id}-${idx}`}
                            value={`${cat.id}-${idx}`}
                            className="border-slate-200"
                          >
                            <AccordionTrigger className="text-left text-slate-900">
                              {it.title}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-slate-700">
                              {editMode ? (
                                <Textarea
                                  value={it.description}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    update((prev) => {
                                      const nextCats = prev.services.categories.map(
                                        (c) => {
                                          if (c.id !== cat.id) return c;
                                          const nextItems = c.items.map(
                                            (x, i) =>
                                              i === idx
                                                ? { ...x, description: v }
                                                : x,
                                          );
                                          return { ...c, items: nextItems };
                                        },
                                      );
                                      return {
                                        ...prev,
                                        services: {
                                          ...prev.services,
                                          categories: nextCats,
                                        },
                                      };
                                    });
                                  }}
                                  className="min-h-[110px] bg-white/70"
                                />
                              ) : (
                                <p className="leading-relaxed">{it.description}</p>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>

                    <div className="space-y-4">
                      <Card className="border-slate-200 bg-slate-50">
                        <CardHeader>
                          <CardTitle className="text-base text-slate-900">
                            À personnaliser
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-slate-700">
                          <p>
                            Ajoutez ici : spécialités, techniques, équipements,
                            conseils post-soins, etc.
                          </p>
                          <p className="text-xs text-slate-500">
                            Zone réservée — facilement éditable.
                          </p>
                        </CardContent>
                      </Card>

                      <Button
                        className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800"
                        onClick={onAppointment}
                      >
                        <CalendarDays className="h-4 w-4" />
                        Demande de rendez-vous
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>
      </section>

      {/* Practical info */}
      <section id="infos" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-start">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  {content.practical.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  Accès, horaires, carte — optimisé pour la recherche locale
                  (Seysses).
                </p>
              </div>

              <Card className="border-slate-200 bg-white/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900">
                    Horaires d’ouverture
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {content.practical.hours.map((h) => (
                      <div
                        key={h.day}
                        className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white/60 px-4 py-2"
                      >
                        <span className="text-sm font-medium text-slate-900">
                          {h.day}
                        </span>
                        <span className="text-sm text-slate-700">{h.hours}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900">
                    Accès & informations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <EditableText
                    value={content.practical.accessNote}
                    edit={editMode}
                    multiline
                    onChange={(v) =>
                      update((prev) => ({
                        ...prev,
                        practical: { ...prev.practical, accessNote: v },
                      }))
                    }
                  />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      variant="outline"
                      className="justify-between"
                      asChild
                    >
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          address,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Itinéraire
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="justify-between"
                      asChild
                    >
                      <a href={`tel:${phoneE164}`}>
                        Appeler
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white/70 p-3 backdrop-blur-xl">
                <div className="aspect-[4/3] overflow-hidden rounded-xl">
                  <iframe
                    title="Carte du cabinet"
                    src={mapSrc}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="mt-3 px-1">
                  <div className="text-sm font-medium text-slate-900">
                    {address}
                  </div>
                  <div className="text-xs text-slate-500">
                    Google Maps intégré (iframe).
                  </div>
                </div>
              </div>

              <Card className="border-slate-200 bg-white/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900">
                    Questions fréquentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    {content.faq.items.map((it, idx) => (
                      <AccordionItem
                        key={idx}
                        value={`faq-${idx}`}
                        className="border-slate-200"
                      >
                        <AccordionTrigger className="text-left text-slate-900">
                          {it.q}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-slate-700">
                          {editMode ? (
                            <Textarea
                              value={it.a}
                              onChange={(e) => {
                                const v = e.target.value;
                                update((prev) => {
                                  const next = prev.faq.items.map((x, i) =>
                                    i === idx ? { ...x, a: v } : x,
                                  );
                                  return {
                                    ...prev,
                                    faq: { ...prev.faq, items: next },
                                  };
                                });
                              }}
                              className="min-h-[110px] bg-white/70"
                            />
                          ) : (
                            <p className="leading-relaxed">{it.a}</p>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_0.95fr] md:items-start">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
                  {content.contact.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {content.contact.formIntro}
                </p>
              </div>

              <Card className="border-slate-200 bg-white/70 backdrop-blur-xl">
                <CardContent className="p-6">
                  <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullname">Nom et prénom</Label>
                        <Input
                          id="fullname"
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
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
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
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
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
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Expliquez brièvement votre demande…"
                        className="min-h-[120px]"
                        {...form.register("message")}
                      />
                      {form.formState.errors.message ? (
                        <p className="text-xs text-rose-700">
                          {form.formState.errors.message.message}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/60 p-4">
                        <Checkbox
                          id="consent"
                          checked={form.watch("consent")}
                          onCheckedChange={(v) =>
                            form.setValue("consent", Boolean(v), {
                              shouldValidate: true,
                            })
                          }
                        />
                        <div className="space-y-1">
                          <Label htmlFor="consent">RGPD</Label>
                          <p className="text-xs leading-relaxed text-slate-600">
                            {content.contact.rgpdNotice}
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
                      >
                        Envoyer
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 px-6"
                        asChild
                      >
                        <a href={`tel:${phoneE164}`}>Appeler le cabinet</a>
                      </Button>
                    </div>

                    <div className="text-xs text-slate-500">
                      Formulaire fonctionnel côté navigateur — envoi email à intégrer
                      ultérieurement.
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-slate-200 bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900">
                    Coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Téléphone
                    </div>
                    <a
                      className="inline-flex items-center gap-2 text-sm text-slate-800 underline-offset-4 hover:underline"
                      href={`tel:${phoneE164}`}
                    >
                      <Phone className="h-4 w-4" />
                      {content.practice.phoneDisplay}
                    </a>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Adresse
                    </div>
                    <div className="inline-flex items-start gap-2 text-sm text-slate-700">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      {address}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    asChild
                  >
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                        address,
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Itinéraire
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-base text-slate-900">
                    Messages récents (démo)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loadingMessages ? (
                    <div className="text-sm text-slate-600">Chargement…</div>
                  ) : messages.length === 0 ? (
                    <div className="text-sm text-slate-600">
                      Aucun message pour l’instant.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {messages.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          className="rounded-xl border border-slate-200 bg-white/60 p-4"
                        >
                          <div className="text-sm font-medium text-slate-900">
                            {m.fullname}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {new Date(m.created_at).toLocaleString("fr-FR")}
                          </div>
                          <div className="mt-2 text-sm text-slate-700">
                            {m.message}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-slate-500">
                    Messages récupérés depuis le serveur (max 20).
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 px-6 py-10 text-white md:px-10 md:py-12">
            <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(900px_500px_at_20%_20%,rgba(14,165,233,0.35),transparent_60%),radial-gradient(700px_420px_at_70%_40%,rgba(37,99,235,0.25),transparent_60%)]" />
            <div className="relative z-10 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div className="space-y-2">
                <div className="text-sm font-medium text-white/80">
                  Cabinet dentaire à {content.practice.citySeo}
                </div>
                <h3 className="text-2xl font-semibold tracking-tight">
                  Un besoin, une question, un rendez-vous ?
                </h3>
                <p className="text-sm leading-relaxed text-white/80">
                  Contactez le cabinet ou configurez le lien de prise de
                  rendez-vous.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-11 gap-2 bg-white text-slate-950 hover:bg-white/90"
                  onClick={onAppointment}
                >
                  <CalendarDays className="h-4 w-4" />
                  Prendre rendez-vous
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-white/30 bg-transparent text-white hover:bg-white/10"
                  asChild
                >
                  <a href={`tel:${phoneE164}`}>
                    <Phone className="mr-2 h-4 w-4" />
                    Appeler
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
