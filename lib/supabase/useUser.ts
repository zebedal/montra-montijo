"use client";

import { useEffect } from "react";
import useSWR from "swr";
import type { User } from "@supabase/supabase-js";

import { supabase } from "./client";

const AUTH_USER_KEY = "supabase-auth-user";

async function getAuthenticatedUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return data.user;
}

export function useUser() {
  const { data: user, isLoading, mutate } = useSWR(
    AUTH_USER_KEY,
    getAuthenticatedUser,
    {
      dedupingInterval: 60_000,
      revalidateOnFocus: false
    }
  );

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        void mutate(session?.user ?? null, { revalidate: false });
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [mutate]);

  return { user: user ?? null, loading: isLoading };
}
