import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

export const injectCreatedAtAndUpdatedAt = () =>
  ({
    createdAt: timestamp("created_at")
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp("updated_at")
      .notNull()
      .default(sql`now()`)
      .$onUpdate(() => new Date()),
  }) as const;
