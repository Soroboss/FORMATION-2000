import { updateSettingAction } from "@/server/actions/admin-ops";
import { listSettings } from "@/server/repositories/admin-settings";
import { Button } from "@/components/ui/button";
import { AdminEmptyState, AdminPageHeader, StatusBadge } from "@/components/admin/ui";

export default async function AdminParametresPage() {
  const settings = await listSettings();

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Paramètres"
        description="Configuration applicative (`app_settings`)."
      />

      {settings.length === 0 ? (
        <AdminEmptyState
          title="Aucun paramètre"
          description="Les clés de configuration apparaîtront ici après migration."
        />
      ) : (
        <ul className="space-y-4">
          {settings.map((setting) => (
            <li key={setting.key} className="ui-card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-sm font-semibold text-ink">{setting.key}</p>
                <StatusBadge
                  value={setting.isPublic ? "active" : "draft"}
                  label={setting.isPublic ? "Public" : "Privé"}
                />
              </div>
              <form action={updateSettingAction} className="mt-3 space-y-2">
                <input type="hidden" name="key" value={setting.key} />
                <textarea
                  name="value"
                  rows={3}
                  defaultValue={
                    typeof setting.value === "string"
                      ? setting.value
                      : JSON.stringify(setting.value, null, 2)
                  }
                  className="w-full rounded-soft border border-canvas-border px-3 py-2 font-mono text-xs text-ink"
                />
                <Button type="submit" size="sm">
                  Enregistrer
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
