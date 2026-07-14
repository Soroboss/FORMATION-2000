import Link from "next/link";
import {
  updateManualPaymentConfigAction,
  updateSettingAction,
} from "@/server/actions/admin-ops";
import { listSettings, type AppSetting } from "@/server/repositories/admin-settings";
import {
  listRolePermissionMatrix,
  listStaffMembers,
} from "@/server/repositories/admin-members";
import { getSession } from "@/lib/auth/session";
import {
  canManageMemberRoles,
  PERMISSION_DESCRIPTIONS,
  ROLE_DESCRIPTIONS,
} from "@/lib/permissions/roles";
import {
  formatSettingValueForInput,
  getSettingMeta,
  MANUAL_PAYMENT_KEY,
  SETTING_GROUPS,
  type SettingGroupId,
  type SettingMeta,
} from "@/lib/admin/settings-meta";
import {
  resolveManualPaymentConfig,
  type ManualPaymentConfig,
} from "@/lib/payments/manual-config";
import { Button } from "@/components/ui/button";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";
import { roleLabel } from "@/lib/admin/labels";

function groupSettings(settings: AppSetting[]) {
  const byGroup = new Map<SettingGroupId, { setting: AppSetting; meta: SettingMeta }[]>();
  for (const group of SETTING_GROUPS) byGroup.set(group.id, []);

  for (const setting of settings) {
    const meta = getSettingMeta(setting.key);
    byGroup.get(meta.group)?.push({ setting, meta });
  }

  return SETTING_GROUPS.map((group) => ({
    ...group,
    items: byGroup.get(group.id) ?? [],
  })).filter((g) => g.items.length > 0 || g.id === "manual_payment");
}

function SettingField({
  setting,
  meta,
}: {
  setting: AppSetting;
  meta: SettingMeta;
}) {
  const inputValue = formatSettingValueForInput(setting.value, meta.kind);
  const rows = meta.kind === "json" ? 8 : meta.kind === "textarea" ? 4 : undefined;

  return (
    <li className="rounded-soft border border-canvas-border bg-canvas/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-display font-semibold text-ink">{meta.label}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{meta.description}</p>
        </div>
        <StatusBadge
          value={setting.isPublic ? "active" : "draft"}
          label={setting.isPublic ? "Public" : "Privé"}
        />
      </div>

      <form action={updateSettingAction} className="mt-3 space-y-2">
        <input type="hidden" name="key" value={setting.key} />
        {meta.kind === "number" ? (
          <div className="flex items-center gap-2">
            <input
              name="value"
              type="number"
              min={0}
              required
              defaultValue={inputValue}
              className="w-full max-w-xs rounded-soft border border-canvas-border px-3 py-2 text-sm text-ink"
            />
            {meta.unit ? (
              <span className="text-sm font-medium text-ink-muted">{meta.unit}</span>
            ) : null}
          </div>
        ) : meta.kind === "text" ? (
          <input
            name="value"
            type="text"
            required
            defaultValue={inputValue}
            className="w-full rounded-soft border border-canvas-border px-3 py-2 text-sm text-ink"
          />
        ) : (
          <textarea
            name="value"
            rows={rows}
            required
            defaultValue={inputValue}
            className="w-full rounded-soft border border-canvas-border px-3 py-2 font-mono text-xs text-ink"
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-ink-muted">
            Modifié le {new Date(setting.updatedAt).toLocaleString("fr-FR")}
          </p>
          <Button type="submit" size="sm">
            Enregistrer
          </Button>
        </div>
      </form>
    </li>
  );
}

function ManualPaymentForm({
  config,
  updatedAt,
  isPublic,
}: {
  config: ManualPaymentConfig;
  updatedAt?: string;
  isPublic: boolean;
}) {
  const slots = [0, 1, 2].map((i) => config.contacts[i] ?? { label: "", number: "", name: "" });
  const defaults = [
    { labelHint: "Orange Money", nameHint: "Learnoon Academy" },
    { labelHint: "MTN MoMo", nameHint: "Learnoon Academy" },
    { labelHint: "Wave", nameHint: "Learnoon Academy" },
  ];

  return (
    <form action={updateManualPaymentConfigAction} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-ink">
          <input type="checkbox" name="enabled" defaultChecked={config.enabled} />
          Activer le paiement manuel
        </label>
        <StatusBadge
          value={isPublic ? "active" : "draft"}
          label={isPublic ? "Visible côté apprenant" : "Privé"}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm sm:col-span-1">
          <span className="font-medium text-ink">Numéro WhatsApp (avec indicatif)</span>
          <input
            name="whatsapp"
            defaultValue={config.whatsapp}
            placeholder="2250700000000"
            className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
          />
          <span className="mt-1 block text-xs text-ink-muted">
            Sans + ni espaces. Ex. 22507…
          </span>
        </label>
        <div className="sm:col-span-1 flex items-end">
          <Link
            href="/admin/paiements-manuels"
            className="text-sm font-semibold text-brand-600 hover:underline"
          >
            Voir les demandes en attente →
          </Link>
        </div>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-ink">Message WhatsApp prérempli</span>
        <textarea
          name="whatsappMessage"
          rows={3}
          required
          defaultValue={config.whatsappMessage}
          className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">Consignes affichées à l’apprenant</span>
        <textarea
          name="instructions"
          rows={4}
          required
          defaultValue={config.instructions}
          className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
        />
      </label>

      <div>
        <p className="font-display font-semibold text-ink">Numéros Mobile Money</p>
        <p className="mt-1 text-sm text-ink-muted">
          Jusqu’à 3 destinataires (Orange, MTN, Wave…). Laissez une ligne vide pour ignorer.
        </p>
        <ul className="mt-3 space-y-3">
          {slots.map((contact, i) => (
            <li
              key={i}
              className="grid gap-2 rounded-soft border border-dashed border-canvas-border bg-white/70 p-3 sm:grid-cols-3"
            >
              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Réseau
                </span>
                <input
                  name={`contact_${i}_label`}
                  defaultValue={contact.label}
                  placeholder={defaults[i]?.labelHint}
                  className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Numéro
                </span>
                <input
                  name={`contact_${i}_number`}
                  defaultValue={contact.number}
                  placeholder="07 XX XX XX XX"
                  className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
              </label>
              <label className="block text-sm">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                  Nom du bénéficiaire
                </span>
                <input
                  name={`contact_${i}_name`}
                  defaultValue={contact.name ?? ""}
                  placeholder={defaults[i]?.nameHint}
                  className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2 text-sm"
                />
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-canvas-border pt-4">
        <p className="text-xs text-ink-muted">
          {updatedAt
            ? `Modifié le ${new Date(updatedAt).toLocaleString("fr-FR")}`
            : "Pas encore enregistré en base"}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/paiement/manuel"
            className="inline-flex h-9 items-center rounded-brand border border-canvas-border px-3 text-xs font-semibold text-ink hover:bg-canvas"
          >
            Aperçu apprenant
          </Link>
          <Button type="submit" size="sm">
            Enregistrer le paiement manuel
          </Button>
        </div>
      </div>
    </form>
  );
}

export default async function AdminParametresPage() {
  const [settings, staff, roleMatrix, session] = await Promise.all([
    listSettings(),
    listStaffMembers(),
    listRolePermissionMatrix(),
    getSession(),
  ]);
  const groups = groupSettings(settings);
  const manualSetting = settings.find((s) => s.key === MANUAL_PAYMENT_KEY);
  const manualConfig = resolveManualPaymentConfig(manualSetting?.value);
  const canManage = canManageMemberRoles(session?.roles ?? []);

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Paramètres"
        description="Application, paiement, et permissions de l’équipe d’administration."
        actions={
          <Link
            href="/admin/membres?view=staff"
            className="inline-flex h-10 items-center rounded-brand bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Gérer l’équipe
          </Link>
        }
      />

      <section className="ui-card space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              Équipe & permissions
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Les collaborateurs ont des accès restreints selon leur rôle. Créez-les depuis Membres.
            </p>
          </div>
          {canManage ? (
            <Link
              href="/admin/membres"
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              + Ajouter un collaborateur
            </Link>
          ) : null}
        </div>

        {staff.length === 0 ? (
          <p className="rounded-soft border border-dashed border-canvas-border p-4 text-sm text-ink-muted">
            Aucun collaborateur pour l’instant.
          </p>
        ) : (
          <ul className="divide-y divide-canvas-border rounded-soft border border-canvas-border">
            {staff.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    href={`/admin/membres/${m.id}`}
                    className="font-semibold text-brand-700 hover:underline"
                  >
                    {m.displayName ?? m.email}
                  </Link>
                  <p className="text-xs text-ink-muted">{m.email}</p>
                </div>
                <p className="text-xs text-ink-muted">
                  {m.roles.map(roleLabel).join(", ")}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="overflow-x-auto pt-2">
          <p className="mb-2 text-sm font-semibold text-ink">Matrice des permissions</p>
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="border-b border-canvas-border text-ink-muted">
              <tr>
                <th className="px-2 py-2">Rôle</th>
                <th className="px-2 py-2">Accès résumés</th>
              </tr>
            </thead>
            <tbody>
              {roleMatrix.map((row) => (
                <tr key={row.key} className="border-b border-canvas-border last:border-0">
                  <td className="px-2 py-3 align-top">
                    <p className="font-semibold text-ink">{roleLabel(row.key)}</p>
                    <p className="mt-0.5 text-ink-muted">
                      {ROLE_DESCRIPTIONS[row.key] ?? row.description}
                    </p>
                  </td>
                  <td className="px-2 py-3 align-top text-ink-muted">
                    {row.permissions.length === 0
                      ? "—"
                      : row.permissions
                          .map((p) => PERMISSION_DESCRIPTIONS[p] ?? p)
                          .join(" · ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {settings.length === 0 ? (
        <AdminEmptyState
          title="Aucun paramètre"
          description="Les clés de configuration apparaîtront ici après migration."
        />
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            if (group.id === "manual_payment") {
              return (
                <section key={group.id} className="ui-card space-y-4 p-5 sm:p-6">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-ink">{group.title}</h2>
                    <p className="mt-1 text-sm text-ink-muted">{group.description}</p>
                  </div>
                  <ManualPaymentForm
                    config={manualConfig}
                    updatedAt={manualSetting?.updatedAt}
                    isPublic={manualSetting?.isPublic ?? true}
                  />
                </section>
              );
            }

            const simpleItems = group.items.filter((i) => i.setting.key !== MANUAL_PAYMENT_KEY);
            if (simpleItems.length === 0) return null;

            return (
              <section key={group.id} className="ui-card space-y-4 p-5 sm:p-6">
                <div>
                  <h2 className="font-display text-lg font-semibold text-ink">{group.title}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{group.description}</p>
                </div>
                <ul className="space-y-3">
                  {simpleItems.map(({ setting, meta }) => (
                    <SettingField key={setting.key} setting={setting} meta={meta} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}
