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
    <main className="site-main">
      <p className="kicker">Backoffice</p>
      <h1 className="lemma">Entrar</h1>
      <p className="lede">
        Primera vez: email, contraseña de 6+ caracteres y{" "}
        <strong>Crear cuenta</strong>. Auth corre en el emulator.
      </p>

      <form onSubmit={onCreate} className="mt-10">
        <label className="field">
          Email
          <input
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="field">
          Contraseña
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <div className="actions">
          <button type="submit" disabled={busy} className="btn btn-primary">
            {busy ? "Esperá…" : "Crear cuenta"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              void run(() => signInWithEmailAndPassword(auth, email, password))
            }
            className="btn btn-secondary"
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
        className="btn btn-secondary mt-4"
      >
        Continuar con Google
      </button>

      {error ? (
        <p role="alert" className="alert">
          {error}
        </p>
      ) : null}

      {uid ? (
        <div className="panel">
          <p>
            uid: <code>{uid}</code>
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
          {probe?.status === 200 ? (
            <p className="mt-3">
              Listo: Nest te reconoce como admin. El panel de diccionarios
              viene en el próximo paso.
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}

