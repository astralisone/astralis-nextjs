'use client';
import { createContext, useContext } from 'react';

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface OrgContextValue {
  org: Organization;
  orgId: string;
}

const OrgContext = createContext<OrgContextValue | null>(null);

export function OrgProvider({
  org,
  children
}: {
  org: Organization;
  children: React.ReactNode;
}) {
  return (
    <OrgContext.Provider value={{ org, orgId: org.id }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within OrgProvider');
  }
  return context;
}

export function useOrgId() {
  return useOrg().orgId;
}
