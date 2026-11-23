import * as v from "valibot";

import { DateTimeSchema } from "./DateTime";

export const CreatedAtSchema = DateTimeSchema;
export type CreatedAt = v.InferOutput<typeof CreatedAtSchema>;
