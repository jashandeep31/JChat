"use client";

import { createContext, useState } from "react";

export const SearchDialogContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

export const SearchDialogContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <SearchDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </SearchDialogContext.Provider>
  );
};
