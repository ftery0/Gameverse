"use client";

import { useSession } from "next-auth/react";

export const useProfileSession = () => {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const isError = status === "unauthenticated"; 

  return { session, isLoading, isError };
};
