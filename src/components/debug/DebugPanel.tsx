'use client';

import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useSession } from 'next-auth/react';
import { User, Database, Bot, Settings, RefreshCw, Bug, Key, Shield } from 'lucide-react';

export function useDebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  return { isOpen, setIsOpen };
}

export function DebugPanel() {
  const { isOpen, setIsOpen } = useDebugPanel();
  const { data: session, status } = useSession();
  const [dbInfo, setDbInfo] = useState<any>(null);
  const [secrets, setSecrets] = useState<any>(null);
  const [oauthSettings, setOauthSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDebugData = async () => {
    setIsLoading(true);
    try {
      // Fetch database info
      const dbResponse = await fetch('/api/debug/database');
      if (dbResponse.ok) {
        const dbData = await dbResponse.json();
        setDbInfo(dbData);
      }

      // Fetch secrets (admin only)
      const secretsResponse = await fetch('/api/debug/secrets');
      if (secretsResponse.ok) {
        const secretsData = await secretsResponse.json();
        setSecrets(secretsData);
      }

      // Fetch OAuth settings
      const oauthResponse = await fetch('/api/debug/oauth');
      if (oauthResponse.ok) {
        const oauthData = await oauthResponse.json();
        setOauthSettings(oauthData);
      }
    } catch (error) {
      console.error('Failed to fetch debug data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchDebugData();
  }, [isOpen]);

  return (
    <>
      {/* Floating Debug Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-astralis-blue hover:bg-astralis-navy text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group"
        title="Open Debug Panel (Option+Shift+D)"
        aria-label="Open Debug Panel"
      >
        <Bug className="h-5 w-5" />
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Debug Panel
        </div>
      </button>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[600px] flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Debug Panel
              <Badge variant="outline" className="text-xs">Option+Shift+D</Badge>
            </SheetTitle>
          </SheetHeader>

        <div className="mt-6 space-y-6 flex-1 overflow-y-auto">
          <Button variant="outline" size="sm" onClick={fetchDebugData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                User Session
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant={status === 'authenticated' ? 'default' : 'secondary'}>
                  {status}
                </Badge>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs max-h-40 overflow-auto">
                  <pre>{JSON.stringify(session, null, 2)}</pre>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dbInfo ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={dbInfo.connected ? 'default' : 'destructive'}>
                      {dbInfo.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                    <span className="text-sm">Database: {dbInfo.database || 'Unknown'}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Tables:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {dbInfo.tables?.map((table: any) => (
                        <div key={table.name} className="bg-slate-50 p-2 rounded text-sm">
                          {table.name}: {table.count} records
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4">No database info available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-500 text-center py-4">Agent debugging coming soon...</p>
            </CardContent>
          </Card>

          {/* Collapsible Sections */}
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="secrets">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Environment Secrets
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {secrets ? (
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs max-h-60 overflow-auto">
                      <pre>{JSON.stringify(secrets, null, 2)}</pre>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No secrets data available or insufficient permissions</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="oauth">
              <AccordionTrigger className="text-left">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  OAuth Settings
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {oauthSettings ? (
                    <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded text-xs max-h-60 overflow-auto">
                      <pre>{JSON.stringify(oauthSettings, null, 2)}</pre>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-center py-4">No OAuth settings available</p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
}