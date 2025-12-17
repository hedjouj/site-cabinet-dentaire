import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Toaster, toast } from "@/components/ui/sonner";
import { SiteLayout } from "@/components/SiteLayout";
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

  const onAppointment = React.useCallback(() => {
    toast.message("Lien à configurer", {
      description:
        "Le bouton « Prendre rendez-vous » est prêt : il suffit d’ajouter l’URL (Doctolib ou autre) quand vous l’aurez.",
      action: {
        label: "Ok",
        onClick: () => {},
      },
    });
  }, []);

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <SiteLayout
                practiceName={content.practice.name}
                phoneE164={content.practice.phoneE164}
                phoneDisplay={content.practice.phoneDisplay}
                address={content.practice.address}
                onAppointment={onAppointment}
              />
            }
          >
            <Route
              path="/"
              element={<Home onAppointment={onAppointment} />}
            />
            <Route path="/mentions-legales" element={<Legal />} />
          </Route>
        </Routes>
      </BrowserRouter>

      <Toaster richColors />
    </div>
  );
}

export default App;
