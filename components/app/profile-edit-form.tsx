"use client";

import { useState, useTransition } from "react";
import { updateProfileAction } from "@/server/actions/profile";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function ProfileEditForm({
  firstName,
  lastName,
  displayName,
  phone,
}: {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  return (
    <form
      className="space-y-4"
      action={(formData) => {
        startTransition(async () => {
          const result = await updateProfileAction(formData);
          setMessage(
            result.success
              ? { type: "ok", text: "Profil mis à jour." }
              : { type: "error", text: result.error ?? "Erreur" },
          );
        });
      }}
    >
      {message ? (
        <Alert variant={message.type === "ok" ? "success" : "error"}>{message.text}</Alert>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Prénom</span>
          <input
            name="firstName"
            required
            defaultValue={firstName === "—" ? "" : firstName}
            className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Nom</span>
          <input
            name="lastName"
            required
            defaultValue={lastName === "—" ? "" : lastName}
            className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-ink">Nom affiché</span>
        <input
          name="displayName"
          defaultValue={displayName}
          className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-ink">WhatsApp</span>
        <input
          name="whatsapp"
          required
          defaultValue={phone === "—" ? "" : phone}
          placeholder="+225…"
          className="mt-1 w-full rounded-soft border border-canvas-border px-3 py-2"
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le profil"}
      </Button>
    </form>
  );
}
