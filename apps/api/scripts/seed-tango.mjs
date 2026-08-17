/**
 * Carga el diccionario Tango y varios términos en el EMULATOR.
 * No corre contra Firebase de producción: exige FIRESTORE_EMULATOR_HOST.
 *
 *   pnpm seed:tango
 */
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId =
  process.env.FIREBASE_PROJECT_ID ?? "diccionario-multidisciplina";
const emulator = process.env.FIRESTORE_EMULATOR_HOST;

if (!emulator) {
  console.error(
    "Abortado: falta FIRESTORE_EMULATOR_HOST. Usá `pnpm seed:tango` para no escribir en producción.",
  );
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ projectId });
}

const db = getFirestore();
const now = new Date().toISOString();

const dictionary = {
  title: "Tango",
  slug: "tango",
  description: "Figuras y pasos del tango argentino.",
  published: true,
};

const terms = [
  {
    lemma: "boleo",
    slug: "boleo",
    videoUrl: "https://www.youtube.com/watch?v=lhmgLWnc2hA",
    definition: `Látigo de la pierna libre que nace del **pivote** del torso, no de una patada.

- la pierna de apoyo queda firme
- la libre va y vuelve sin transferir peso
- puede ser alto o bajo, al frente o atrás
`,
  },
  {
    lemma: "gancho",
    slug: "gancho",
    definition: `La pierna libre se **engancha** alrededor de la pierna de la pareja, como un gancho.

Se suele marcar desde un ocho o una parada. El eje se mantiene; no es un salto ni un golpe.
`,
  },
  {
    lemma: "sacada",
    slug: "sacada",
    videoUrl: "https://www.youtube.com/watch?v=6ff1uXuut3A",
    definition: `Un pie **desplaza** al de la pareja y ocupa ese espacio. No se patea: se llega al mismo tiempo que el otro sale.

Muy frecuente dentro de ochos adelante.
`,
  },
  {
    lemma: "ocho",
    slug: "ocho",
    definition: `Caminata en **ocho**: pivote + paso adelante o atrás, cruzando el eje de la pareja.

Hay ochos adelante y ochos atrás. Son la base de muchas figuras (boleo, gancho, sacada).
`,
  },
  {
    lemma: "ocho cortado",
    slug: "ocho-cortado",
    definition: `Un ocho adelante que se **corta** a mitad de camino y vuelve al cruce.

Es de las figuras más habituales en la milonga: ocupa poco espacio.
`,
  },
  {
    lemma: "sandwich",
    slug: "sandwich",
    definition: `Los dos pies de quien marca **envuelven** un pie de la pareja, como un sándwich.

Suele resolverse con una parada, un boleo o un cambio de peso.
`,
  },
  {
    lemma: "barrida",
    slug: "barrida",
    definition: `Un pie **barre** al otro por el piso, sin levantarlo. Contacto suave, ambos en el suelo.

También se llama *arrastre*.
`,
  },
  {
    lemma: "parada",
    slug: "parada",
    definition: `Se **detiene** el paso de la pareja bloqueando con el pie (sin pisar).

Desde ahí salen boleos, ganchos o un simple cambio de dirección.
`,
  },
  {
    lemma: "colgada",
    slug: "colgada",
    definition: `Los dos ejes se inclinan hacia afuera y el abrazo **sostiene** el contrapeso.

Si falta conexión en la espalda, se pierde el equilibrio. No es una caída.
`,
  },
  {
    lemma: "volcada",
    slug: "volcada",
    definition: `Quien es llevado se **inclina** hacia quien marca; el eje queda compartido hacia adentro.

Es el contrapunto de la colgada. Se marca con el torso, no tirando de los brazos.
`,
  },
  {
    lemma: "enrosque",
    slug: "enrosque",
    definition: `Pivote en el que las piernas quedan **enroscadas**: una gira sobre el eje y la otra se cruza.

Típico al centro de un giro o molinete.
`,
  },
  {
    lemma: "molinete",
    slug: "molinete",
    definition: `Giro de quien es llevado alrededor del eje de quien marca: atrás, costado, adelante, costado.

Quien marca suele hacer **disociación** (pecho hacia la pareja, cadera más quieta).
`,
  },
];

function lemmaLower(lemma) {
  return lemma.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

async function upsertDictionary() {
  const snap = await db
    .collection("dictionaries")
    .where("slug", "==", dictionary.slug)
    .limit(1)
    .get();

  if (snap.empty) {
    const ref = db.collection("dictionaries").doc();
    await ref.set({
      ...dictionary,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Diccionario creado: ${ref.id} (${dictionary.slug})`);
    return ref;
  }

  const ref = snap.docs[0].ref;
  await ref.update({
    title: dictionary.title,
    description: dictionary.description,
    published: true,
    updatedAt: now,
  });
  console.log(`Diccionario actualizado: ${ref.id} (${dictionary.slug})`);
  return ref;
}

async function upsertTerm(dictionaryRef, term) {
  const col = dictionaryRef.collection("terms");
  const snap = await col.where("slug", "==", term.slug).limit(1).get();

  const payload = {
    lemma: term.lemma,
    slug: term.slug,
    definition: term.definition.trim(),
    published: true,
    lemmaLower: lemmaLower(term.lemma),
    updatedAt: now,
  };

  if (term.videoUrl) {
    payload.videoUrl = term.videoUrl;
  }

  if (snap.empty) {
    const ref = col.doc();
    await ref.set({ ...payload, createdAt: now });
    console.log(`  + ${term.slug}${term.videoUrl ? " (video)" : ""}`);
    return;
  }

  await snap.docs[0].ref.update(payload);
  console.log(`  ~ ${term.slug}${term.videoUrl ? " (video)" : ""}`);
}

const dictRef = await upsertDictionary();
console.log("Términos:");
for (const term of terms) {
  await upsertTerm(dictRef, term);
}
console.log("Listo. Recargá http://localhost:3100/tango");
