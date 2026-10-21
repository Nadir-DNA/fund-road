import pg from "pg";
export const db = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});
export async function transaction<T>(fn: (c: pg.PoolClient) => Promise<T>) {
  const c = await db.connect();
  try {
    await c.query("BEGIN");
    const r = await fn(c);
    await c.query("COMMIT");
    return r;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
export const audit = async (
  user: string,
  org: string,
  action: string,
  id: string,
) => {
  await db.query(
    "INSERT INTO audit(user_id,organization_id,action,resource_id) VALUES($1,$2,$3,$4)",
    [user, org, action, id],
  );
};
