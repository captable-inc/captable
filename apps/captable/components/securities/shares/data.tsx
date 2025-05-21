import { SecuritiesStatusEnum } from "@captable/db/schema/enums";
import { capitalize } from "lodash-es";

export const statusValues = Object.keys(SecuritiesStatusEnum).map((item) => ({
  label: capitalize(item),
  value: item,
}));
