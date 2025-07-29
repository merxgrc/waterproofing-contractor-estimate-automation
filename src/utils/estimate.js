// src/utils/estimate.js
import { supabase } from "@/supabaseClient";

export const Estimate = {
  async create(data) {
    try {
      // Get current authenticated user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated. Please log in first.");
      }

      // Include user_id in the data
      const estimateData = {
        ...data,
        user_id: user.id // Add user_id for RLS
      };

      const { data: inserted, error } = await supabase
        .from("estimates")
        .insert([estimateData])
        .select()
        .single();
      
      if (error) {
        console.error("Supabase error:", error);
        
        // Provide better error messages for common issues
        if (error.code === "42501") {
          throw new Error("Permission denied. Please check your Supabase Row Level Security policies or ensure you're logged in.");
        } else if (error.code === "23505") {
          throw new Error("Duplicate estimate detected. Please try again.");
        } else {
          throw new Error(`Failed to save estimate: ${error.message}`);
        }
      }
      
      return inserted;
    } catch (error) {
      console.error("Error in Estimate.create:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      // Get current authenticated user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated. Please log in first.");
      }

      const { data, error } = await supabase
        .from("estimates")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id) // Only get user's own estimates
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Estimate not found or you don't have permission to view it.");
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in Estimate.getById:", error);
      throw error;
    }
  },

  async list(orderBy = "created_at", ascending = false, limit = null) {
    try {
      // Get current authenticated user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated. Please log in first.");
      }

      let query = supabase
        .from("estimates")
        .select("*")
        .eq("user_id", user.id) // Only get user's own estimates
        .order(orderBy, { ascending });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching estimates:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in Estimate.list:", error);
      throw error;
    }
  },

  async update(id, updates) {
    try {
      // Get current authenticated user
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("User not authenticated. Please log in first.");
      }

      const { data, error } = await supabase
        .from("estimates")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id) // Only update user's own estimates
        .select()
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error("Estimate not found or you don't have permission to update it.");
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in Estimate.update:", error);
      throw error;
    }
  }
};
