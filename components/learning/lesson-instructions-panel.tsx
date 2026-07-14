import type { LessonInstructions } from "@/types/catalog";

export function LessonInstructionsPanel({
  instructions,
  redacted = false,
}: {
  instructions: LessonInstructions | null;
  redacted?: boolean;
}) {
  if (!instructions) {
    return (
      <p className="text-sm text-slate-600">Aucune instruction complémentaire pour cette leçon.</p>
    );
  }

  if (redacted) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
        Les exercices complets, étapes détaillées et ressources premium sont réservés aux
        abonnés actifs. Souscrivez pour 2&nbsp;000&nbsp;FCFA / 30 jours (Phase 3).
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {instructions.objective ? (
        <Block title="Objectif">{instructions.objective}</Block>
      ) : null}
      {instructions.summary ? <Block title="Résumé">{instructions.summary}</Block> : null}
      <ListBlock title="Points importants" items={instructions.keyPoints} />
      <ListBlock title="Instructions" items={instructions.steps} ordered />
      {instructions.expectedResult ? (
        <Block title="Résultat attendu">{instructions.expectedResult}</Block>
      ) : null}
      <ListBlock title="Erreurs fréquentes" items={instructions.commonMistakes} />
      <ListBlock title="Conseils" items={instructions.tips} />
    </div>
  );
}

function Block({ title, children }: { title: string; children: string }) {
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-700">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-700">{children}</p>
    </section>
  );
}

function ListBlock({
  title,
  items,
  ordered = false,
}: {
  title: string;
  items: string[];
  ordered?: boolean;
}) {
  if (items.length === 0) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <section>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-700">{title}</h3>
      <List className={`mt-2 space-y-1 text-sm text-slate-700 ${ordered ? "list-decimal pl-5" : "list-disc pl-5"}`}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    </section>
  );
}
