import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { loadContent } from "@/mock";

export default function Legal() {
  const content = React.useMemo(() => loadContent(), []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
            {content.legal.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {content.legal.intro}
          </p>
        </div>

        <Button variant="outline" className="gap-2" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Link>
        </Button>
      </div>

      <div className="space-y-4">
        {content.legal.sections.map((s) => (
          <Card
            key={s.title}
            className="border-slate-200 bg-white/70 backdrop-blur-xl"
          >
            <CardHeader>
              <CardTitle className="text-base text-slate-900">
                {s.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {s.content}
              </pre>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-xs text-slate-500">
        Important : ce modèle ne constitue pas un conseil juridique. Il devra être
        validé et complété.
      </div>
    </div>
  );
}
