import * as v from "valibot";

// 返すのは不正だったフィールドの名前だけ（入力がまるごと違うときは空の文字）。検査のライブラリが作る文言には、送られた値が入る
const BadRequestDataSchema = v.object({
  errors: v.array(v.object({ field: v.string() })),
});
export type BadRequestData = v.InferOutput<typeof BadRequestDataSchema>;

export const BadRequestError = {
  message: "入力が正しくありません",
  data: BadRequestDataSchema,
} as const;
