import { ADMIN_ROLE_ID } from "@/lib/rbac/constants";
import type { RoleEnum } from "@captable/db/schema/enums";
import { invariant } from "@/lib/error";

interface getRoleIdOption {
  role: RoleEnum | null;
  customRoleId: string | null;
}

export const getRoleId = ({ role, customRoleId }: getRoleIdOption) => {
  if (role === "ADMIN") {
    return ADMIN_ROLE_ID;
  }

  if (!role) {
    return undefined;
  }

  invariant(customRoleId, "custom role id not found");

  return customRoleId;
};
