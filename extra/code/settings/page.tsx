import {
  ChangeEmailCard,
  ChangePasswordCard,
  DeleteAccountCard,
  ProvidersCard,
  SessionsCard,
  UpdateAvatarCard,
  UpdateNameCard,
  UpdateUsernameCard,
} from "@daveyplate/better-auth-ui";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4 justify-center py-12 px-4 max-w-3xl mx-auto">
      <UpdateAvatarCard />
      <UpdateNameCard />
      <UpdateUsernameCard />
      <ChangeEmailCard />
      <ChangePasswordCard />
      <ProvidersCard />
      <SessionsCard />
      <DeleteAccountCard />
    </div>
  );
}
