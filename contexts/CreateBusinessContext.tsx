"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from "react";

import type { BusinessFormData } from "@/lib/schemas/businessFormSchema";
import { UploadImage } from "@/components/business/BusinessImagesUpload";

export type BusinessDraft = {
  form: BusinessFormData;
  logo: File | null;
  images: UploadImage[];
};

type CreateBusinessContextType = {
  draft: BusinessDraft | null;
  setDraft: (draft: BusinessDraft) => void;
  clearDraft: () => void;
};

const CreateBusinessContext = createContext<
  CreateBusinessContextType | undefined
>(undefined);

export function CreateBusinessProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<BusinessDraft | null>(null);

  const value = useMemo(
    () => ({
      draft,

      setDraft: (draft: BusinessDraft) => {
        setDraftState(draft);
      },

      clearDraft: () => {
        setDraftState(null);
      }
    }),
    [draft]
  );

  return (
    <CreateBusinessContext.Provider value={value}>
      {children}
    </CreateBusinessContext.Provider>
  );
}

export function useCreateBusiness() {
  const context = useContext(CreateBusinessContext);

  if (!context) {
    throw new Error(
      "useCreateBusiness must be used inside CreateBusinessProvider."
    );
  }

  return context;
}
