"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  inviteCollaboratorAction,
  type InviteCollaboratorState,
} from "@/server/actions/admin-ops";
import { Button } from "@/components/ui/button";
import type { RoleKey } from "@/lib/permissions/roles";
import { ROLE_DESCRIPTIONS } from "@/lib/permissions/roles";
import { roleLabel } from "@/lib/admin/labels";

const initialState: InviteCollaboratorState = {
  ok: false,
  message: "",
};

export function InviteCollaboratorForm({
  assignableRoles,
}: {
  assignableRoles: RoleKey[];
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(inviteCollaboratorAction, initialState);

  useEffect(() => {
    if (state.ok && state.memberId) {
      router.push(`/admin/membres/${state.memberId}?created=1`);
    }
  }, [state, router]);

  if (assignableRoles.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Votre compte ne peut pas créer de collaborateurs. Demandez à un administrateur.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Prénom</span>
          <input
            name="firstName"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Nom</span>
          <input
            name="lastName"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-ink">E-mail de connexion</span>
        <input
          name="email"
          type="email"
          required
          placeholder="collaborateur@exemple.com"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">Mot de passe temporaire</span>
        <input
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="À communiquer au collaborateur"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">WhatsApp (optionnel)</span>
        <input
          name="whatsapp"
          placeholder="+225…"
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">Rôle & permissions</span>
        <select
          name="roleKey"
          required
          defaultValue={assignableRoles.includes("support") ? "support" : assignableRoles[0]}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          {assignableRoles.map((role) => (
            <option key={role} value={role}>
              {roleLabel(role)}
            </option>
          ))}
        </select>
        <ul className="mt-2 space-y-1 text-xs text-ink-muted">
          {assignableRoles.map((role) => (
            <li key={role}>
              <span className="font-semibold text-ink">{roleLabel(role)}</span> —{" "}
              {ROLE_DESCRIPTIONS[role]}
            </li>
          ))}
        </ul>
      </label>

      {state.message && !state.ok ? (
        <p className="text-sm font-medium text-red-700" role="alert">
          {state.message}
        </p>
      ) : null}
      {state.message && state.ok ? (
        <p className="text-sm font-medium text-emerald-700">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer le collaborateur"}
      </Button>
    </form>
  );
}
