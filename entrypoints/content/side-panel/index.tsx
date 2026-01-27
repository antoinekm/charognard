import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTab, TabsPanel } from '@/components/ui/tabs';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { XIcon, BarChart3Icon, UsersIcon, HeartIcon, SettingsIcon, LogInIcon, RefreshCwIcon, HistoryIcon } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import APP from '@/constants/app';
import { SuggestionsTab } from './suggestions';
import { FollowedTab } from './followed';
import { SettingsTab } from './settings';
import { HistoryTab } from './history';
import { OverviewTab } from './overview';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  container: HTMLElement;
}

export function SidePanel({ isOpen, onClose, container }: SidePanelProps) {
  const [activeTab, setActiveTab] = useState<string | null>('overview');
  const { isLoggedIn, checkAuth } = useAuth();

  const isNotLoggedIn = isLoggedIn === false;

  useEffect(() => {
    const handleResetTab = () => setActiveTab('overview');
    document.addEventListener('charognard:reset-tab', handleResetTab);
    return () => document.removeEventListener('charognard:reset-tab', handleResetTab);
  }, []);

  return (
    <div
      className={`fixed top-0 right-0 h-full w-[60vw] bg-background border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-9999 flex flex-col ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Header */}
      <div id="onboarding-panel-header" className="flex items-center justify-between p-4 border-b border-border shrink-0">
        <h2 className="font-heading font-semibold text-lg">
          {APP.NAME}
          <span className="ml-1.5 text-xs font-normal text-muted-foreground">
            v{browser.runtime.getManifest().version}
          </span>
        </h2>
        <Button variant="ghost" size="icon-sm" onClick={onClose}>
          <XIcon />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="px-4 pt-2 shrink-0">
          <TabsList>
            <TabsTab id="onboarding-tab-overview" value="overview">
              <BarChart3Icon className="size-4" />
              Overview
            </TabsTab>
            <TabsTab id="onboarding-tab-suggestions" value="suggestions">
              <UsersIcon className="size-4" />
              Suggestions
            </TabsTab>
            <TabsTab id="onboarding-tab-followed" value="followed">
              <HeartIcon className="size-4" />
              Followed
            </TabsTab>
            <TabsTab id="onboarding-tab-settings" value="settings">
              <SettingsIcon className="size-4" />
              Settings
            </TabsTab>
            <TabsTab id="onboarding-tab-history" value="history">
              <HistoryIcon className="size-4" />
              History
            </TabsTab>
          </TabsList>
        </div>

        <TabsPanel value="overview" className="flex-1 flex flex-col min-h-0">
          {isNotLoggedIn ? (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LogInIcon />
                </EmptyMedia>
                <EmptyTitle>Not logged in</EmptyTitle>
                <EmptyDescription>
                  Please log in to Instagram to see your overview.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => (window.location.href = 'https://www.instagram.com/accounts/login/')}>
                    <LogInIcon />
                    Log in
                  </Button>
                  <Button size="sm" variant="outline" onClick={checkAuth}>
                    <RefreshCwIcon />
                    Refresh
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            <OverviewTab onNavigate={setActiveTab} />
          )}
        </TabsPanel>

        <TabsPanel value="suggestions" className="flex-1 flex flex-col min-h-0">
          {isNotLoggedIn ? (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LogInIcon />
                </EmptyMedia>
                <EmptyTitle>Not logged in</EmptyTitle>
                <EmptyDescription>
                  Please log in to Instagram to see suggestions.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => (window.location.href = 'https://www.instagram.com/accounts/login/')}>
                    <LogInIcon />
                    Log in
                  </Button>
                  <Button size="sm" variant="outline" onClick={checkAuth}>
                    <RefreshCwIcon />
                    Refresh
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            <SuggestionsTab container={container} />
          )}
        </TabsPanel>

        <TabsPanel value="followed" className="flex-1 flex flex-col min-h-0">
          {isNotLoggedIn ? (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LogInIcon />
                </EmptyMedia>
                <EmptyTitle>Not logged in</EmptyTitle>
                <EmptyDescription>
                  Please log in to Instagram to manage followed profiles.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => (window.location.href = 'https://www.instagram.com/accounts/login/')}>
                    <LogInIcon />
                    Log in
                  </Button>
                  <Button size="sm" variant="outline" onClick={checkAuth}>
                    <RefreshCwIcon />
                    Refresh
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            <FollowedTab container={container} />
          )}
        </TabsPanel>

        <TabsPanel value="settings" className="flex-1 flex flex-col min-h-0">
          {isNotLoggedIn ? (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LogInIcon />
                </EmptyMedia>
                <EmptyTitle>Not logged in</EmptyTitle>
                <EmptyDescription>
                  Please log in to Instagram to access settings.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => (window.location.href = 'https://www.instagram.com/accounts/login/')}>
                    <LogInIcon />
                    Log in
                  </Button>
                  <Button size="sm" variant="outline" onClick={checkAuth}>
                    <RefreshCwIcon />
                    Refresh
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            <SettingsTab container={container} />
          )}
        </TabsPanel>

        <TabsPanel value="history" className="flex-1 flex flex-col min-h-0">
          {isNotLoggedIn ? (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <LogInIcon />
                </EmptyMedia>
                <EmptyTitle>Not logged in</EmptyTitle>
                <EmptyDescription>
                  Please log in to Instagram to view history.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => (window.location.href = 'https://www.instagram.com/accounts/login/')}>
                    <LogInIcon />
                    Log in
                  </Button>
                  <Button size="sm" variant="outline" onClick={checkAuth}>
                    <RefreshCwIcon />
                    Refresh
                  </Button>
                </div>
              </EmptyContent>
            </Empty>
          ) : (
            <HistoryTab />
          )}
        </TabsPanel>
      </Tabs>
    </div>
  );
}
