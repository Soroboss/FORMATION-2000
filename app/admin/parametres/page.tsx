import { updateSettingAction } from "@/server/actions/admin-ops";
import { listSettings } from "@/server/repositories/admin-settings";
import { Button } from "@/components/ui/button";

export default async function AdminParametresPage() {
  const settings = await listSettings();

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-600">Configuration applicative (`app_settings`).</p>
      </div>
      <ul className="space-y-4">
        {settings.map((setting) => (
          <li key={setting.key} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-sm font-semibold text-slate-900">{setting.key}</p>
              <span className="text-xs text-slate-500">
                {setting.isPublic ? "public" : "privé"}
              </span>
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
                className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs"
              />
              <Button type="submit" size="sm">
                Enregistrer
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
