import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster, toast } from "@/components/ui/sonner";
import { SiteLayout } from "@/components/SiteLayout";
import AppointmentDialog from "@/components/AppointmentDialog";
import Home from "@/pages/Home";
import Legal from "@/pages/Legal";
import { api } from "@/lib/api";
import { DEFAULT_CONTENT } from "@/mock";

function App() {
  const [content, setContent] = React.useState(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/site-content");
        if (!mounted) return;
        setContent(res.data.content);
      } catch (e) {
        // Fallback to default content if backend is unreachable.
        console.error(e);
        setContent(DEFAULT_CONTENT);
        toast.error("Impossible de charger le contenu", {
          description:
            "Le site utilise un contenu de secours (mock). Vérifiez le backend.",
        });
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const [appointmentOpen, setAppointmentOpen] = React.useState(false);

  const onAppointment = React.useCallback(() => {
    setAppointmentOpen(true);
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6">
          <div className="rounded-2xl border border-slate-200 bg-white/70 p-8 backdrop-blur-xl">
            <div className="text-sm font-medium text-slate-900">Chargement…</div>
            <div className="mt-2 text-sm text-slate-600">
              Récupération du contenu du site.
            </div>
            <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-1/3 animate-pulse rounded-full bg-slate-900/20" />
            </div>
          </div>
        </div>
        <Toaster richColors />
      </div>
    );
  }

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <SiteLayout
                practiceName={content.practice?.name}
                phoneE164={content.practice?.phoneE164}
                phoneDisplay={content.practice?.phoneDisplay}
                address={content.practice?.address}
                onAppointment={onAppointment}
              />
            }
          >
            <Route
              path="/"
              element={<Home content={content} setContent={setContent} onAppointment={onAppointment} />}
            />
            <Route path="/mentions-legales" element={<Legal content={content} />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster richColors />
    </div>
  );
}

export default App;
