type WriteResult = { error: { code?: string; message?: string } | null };

/** Some imported tables have a numeric primary key without an identity default. */
export async function insertFactoryWithLegacyId<T extends WriteResult>(
  data: Record<string, unknown>,
  insert: (row: Record<string, unknown>) => Promise<T>,
  nextId: () => Promise<number>,
): Promise<T> {
  let result = await insert(data);
  if (result.error?.code !== "23502" || !/column "id"/.test(result.error.message || "")) return result;

  // ponytail: low-volume admin inserts; use a DB identity if concurrent imports become common.
  // The primary key rejects collisions; retry only those, never unrelated constraint failures.
  for (let attempt = 0; attempt < 3; attempt++) {
    const id = await nextId();
    if (!Number.isSafeInteger(id) || id < 1) throw new Error("업장 번호를 생성하지 못했습니다.");
    result = await insert({ ...data, id });
    if (result.error?.code !== "23505" || !/donggori_pkey/.test(result.error.message || "")) return result;
  }
  return result;
}
