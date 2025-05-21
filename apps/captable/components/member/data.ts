import { MemberStatusEnum } from "@captable/db/schema/enums";
import { capitalize } from "lodash-es";

export const statusValues = Object.keys(MemberStatusEnum).map((item) => ({
  label: capitalize(item),
  value: item,
}));
