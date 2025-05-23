import type { FieldTypesEnum } from "@captable/db/schema/enums";
import {
  RiCalendar2Line,
  RiListCheck3,
  RiSketching,
  RiText,
} from "@remixicon/react";

interface OptionsItems {
  label: string;
  icon: typeof RiSketching;
  value: FieldTypesEnum;
}

export const FieldTypeData: OptionsItems[] = [
  {
    label: "Signature",
    icon: RiSketching,
    value: "SIGNATURE",
  },
  {
    label: "Text",
    icon: RiText,
    value: "TEXT",
  },
  {
    label: "Date",
    icon: RiCalendar2Line,
    value: "DATE",
  },
  {
    label: "Select",
    icon: RiListCheck3,
    value: "SELECT",
  },
];
