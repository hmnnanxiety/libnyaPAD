// import { createClient, SupabaseClient } from "@supabase/supabase-js";

// let supabaseAdmin: SupabaseClient | null = null;

// export function getSupabaseAdmin(): SupabaseClient {
//   if (!supabaseAdmin) {
//     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
//     const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

//     if (!supabaseUrl || !supabaseServiceKey) {
//       throw new Error("Missing Supabase environment variables");
//     }

//     supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
//   }
//   return supabaseAdmin;
// }

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
