"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { FormEvent, useState } from "react";
import { auth } from "@/lib/firebase";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3101";

const fieldClass =
  "mt-1 w-full rounded-lg border-2 border-zinc-800 bg-white px-3 py-3 text-lg text-zinc-950";
const primaryBtn =
  "min-h-11 rounded-lg bg-zinc-950 px-4 py-3 text-base font-semibold text-white disabled:opacity-60";
const secondaryBtn =
  "min-h-11 rounded-lg border-2 border-zinc-950 bg-white px-4 py-3 text-base font-semibold text-zinc-950 disabled:opacity-60";

type Probe = {
  status: number;
  body: unknown;
};

function authCode(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code: unknown }).code;
    return typeof code === "string" ? code : "";
  }
  return "";
}

function authMessage(err: unknown): string {
  const code = authCode(err);
  switch (code) {
    case "auth/email-already-in-use":
      return "Ese email ya existe. Usá «Ya tengo cuenta».";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email o contraseña no coinciden. Si es la primera vez, usá «Crear cuenta».";
    case "auth/weak-password":
      return "La contraseña tiene que tener al menos 6 caracteres.";
    case "auth/invalid-email":
      return "El email no es válido.";
    case "auth/network-request-failed":
      return "No se pudo hablar con el Auth emulator (puerto 9099). ¿Están prendidos los emulators?";
    default:
      if (err instanceof Error && err.message) {
        return err.message;
      }
      return "No se pudo entrar. Mirá la consola del browser.";
  }
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [uid, setUid] = useState<string | null>(null);
  const [probe, setProbe] = useState<Probe | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function afterSignIn() {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("No hay usuario en Auth");
    }

    const token = await user.getIdToken();
    const res = await fetch(`${apiUrl}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json().catch(() => null);

    setUid(user.uid);
    setProbe({ status: res.status, body });
  }

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    setProbe(null);
    try {
      await action();
      await afterSignIn();
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  }

  function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run(() => createUserWithEmailAndPassword(auth, email, password));
  }

  return (
    <main className="mx-auto min-h-screen max-w-xl bg-white px-6 py-16 font-sans text-zinc-950">
      <h1 className="text-3xl font-semibold tracking-tight">Admin</h1>
      <p className="mt-2 text-lg text-zinc-800">
        Primera vez: completá email y contraseña y apretá{" "}
        <strong>Crear cuenta</strong>. Auth corre en el emulator, no en
        producción.
      </p>

      <form onSubmit={onCreate} className="mt-8 space-y-4">
        <label className="block text-base font-medium text-zinc-950">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block text-base font-medium text-zinc-950">
          Contraseña (mínimo 6 caracteres)
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={fieldClass}
          />
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={busy} className={primaryBtn}>
            {busy ? "Esperá…" : "Crear cuenta"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(() => signInWithEmailAndPassword(auth, email, password))
            }
            className={secondaryBtn}
          >
            Ya tengo cuenta
          </button>
        </div>
      </form>

      <button
        type="button"
        disabled={busy}
        onClick={() =>
          void run(() => signInWithPopup(auth, new GoogleAuthProvider()))
        }
        className={`${secondaryBtn} mt-4`}
      >
        Continuar con Google
      </button>

      {error ? (
        <p
          role="alert"
          className="mt-6 rounded-lg border-2 border-zinc-950 bg-amber-200 px-4 py-3 text-base text-zinc-950"
        >
          {error}
        </p>
      ) : null}

      {uid ? (
        <div className="mt-8 rounded-lg border-2 border-zinc-950 bg-zinc-50 p-4 text-base text-zinc-950">
          <p>
            uid: <code className="break-all">{uid}</code>
          </p>
          <p className="mt-2">GET /admin/me: {probe?.status}</p>
          <pre className="mt-2 overflow-x-auto">
            {JSON.stringify(probe?.body, null, 2)}
          </pre>
          {probe?.status === 403 ? (
            <p className="mt-3">
              Eso es normal la primera vez. En el emulator de Firestore →
              colección <code>admins</code> → documento con ID = ese uid (puede
              ir vacío). Después usá «Ya tengo cuenta».
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
