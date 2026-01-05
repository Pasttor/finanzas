"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    // Configuración: Actualizar cada 5 segundos (5000 ms)
    const interval = setInterval(() => {
      router.refresh(); // Esto recarga los datos del servidor sin recargar la página completa
    }, 3000);

    return () => clearInterval(interval);
  }, [router]);

  // Este componente es invisible, no renderiza nada
  return null;
}