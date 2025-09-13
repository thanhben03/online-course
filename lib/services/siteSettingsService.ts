import sql from "@/lib/db";

export interface SiteSettingRecord {
  id: number;
  setting_key: string;
  setting_value: string | null;
  setting_type: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export class SiteSettingsService {
  async getAll(): Promise<Record<string, string>> {
    const rows = await sql`SELECT * FROM site_settings`;
    const map: Record<string, string> = {};
    for (const row of (rows as unknown as SiteSettingRecord[])) {
      if (row.setting_key) {
        map[row.setting_key] = row.setting_value ?? "";
      }
    }
    return map;
  }

  async getByKeys(keys: string[]): Promise<Record<string, string>> {
    if (!keys || keys.length === 0) return {};
    // Add cache-busting to prevent stale data
    const rows = await sql`SELECT * FROM site_settings WHERE setting_key = ANY(${keys}) ORDER BY updated_at DESC`;
    const map: Record<string, string> = {};
    for (const row of (rows as unknown as SiteSettingRecord[])) {
      map[row.setting_key] = row.setting_value ?? "";
    }
    // Ensure all requested keys exist
    for (const key of keys) {
      if (!(key in map)) map[key] = "";
    }
    return map;
  }

  async upsert(key: string, value: string, type: string = "text", description?: string) {
    const rows = await sql`
      INSERT INTO site_settings (setting_key, setting_value, setting_type, description)
      VALUES (${key}, ${value}, ${type}, ${description ?? null})
      ON CONFLICT (setting_key)
      DO UPDATE SET
        setting_value = EXCLUDED.setting_value,
        setting_type = EXCLUDED.setting_type,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    return (rows as unknown as SiteSettingRecord[])[0];
  }
}

export const siteSettingsService = new SiteSettingsService();


