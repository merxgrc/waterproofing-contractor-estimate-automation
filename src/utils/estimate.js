// src/utils/estimate.js
import { supabase } from "@/supabaseClient";

export const Estimate = {
  async create(data) {
    const { data: inserted, error } = await supabase
      .from("estimates")
      .insert([data])
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error:", error);
      throw new Error(`Failed to save estimate: ${error.message}`);
    }
    
    return inserted;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from("estimates")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async list() {
    const { data, error } = await supabase
      .from("estimates")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from("estimates")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}; 