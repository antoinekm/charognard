import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';
import {
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  UsersIcon,
  HeartIcon,
  SettingsIcon,
  HistoryIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { getSnapshots, addSnapshot } from '@/lib/storage/snapshots';
import { fetchUserInfo, getCurrentUserId } from '@/lib/instagram';
import type { ProfileSnapshot } from '@/types/storage';

interface TooltipPayloadEntry {
  dataKey?: string;
  value?: number;
  color?: string;
  name?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-6 text-xs">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.name}
          </span>
          <span className="font-medium tabular-nums text-foreground">
            {entry.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

interface OverviewTabProps {
  onNavigate: (tab: string) => void;
}

const shortcuts = [
  {
    tab: 'suggestions',
    icon: UsersIcon,
    label: 'Suggestions',
    description: 'Discover new accounts to follow',
  },
  {
    tab: 'followed',
    icon: HeartIcon,
    label: 'Followed',
    description: 'Manage who you follow',
  },
  {
    tab: 'settings',
    icon: SettingsIcon,
    label: 'Settings',
    description: 'Limits & automation',
  },
  {
    tab: 'history',
    icon: HistoryIcon,
    label: 'History',
    description: 'View your action logs',
  },
];

export function OverviewTab({ onNavigate }: OverviewTabProps) {
  const [snapshots, setSnapshots] = useState<ProfileSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFollowers, setCurrentFollowers] = useState<number | null>(null);
  const [currentFollowing, setCurrentFollowing] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (userId) {
        const userInfo = await fetchUserInfo(userId);
        const { follower_count, following_count } = userInfo.user;
        setCurrentFollowers(follower_count);
        setCurrentFollowing(following_count);
        await addSnapshot(follower_count, following_count);
      }

      const data = await getSnapshots();
      setSnapshots(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const chartData = snapshots.map((s) => ({
    date: new Date(s.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    Followers: s.followerCount,
    Following: s.followingCount,
  }));

  const getTrend = (key: 'followerCount' | 'followingCount') => {
    if (snapshots.length < 2) return null;
    const current = snapshots[snapshots.length - 1][key];
    const previous = snapshots[snapshots.length - 2][key];
    return current - previous;
  };

  const followerTrend = getTrend('followerCount');
  const followingTrend = getTrend('followingCount');

  const formatTrend = (value: number | null) => {
    if (value === null) return null;
    const label = value > 0 ? `+${value}` : `${value}`;
    const Icon = value > 0 ? TrendingUpIcon : value < 0 ? TrendingDownIcon : MinusIcon;
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Icon className="size-3" />
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Stat cards skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border p-3.5 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
            <div className="rounded-lg border border-border p-3.5 space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          </div>

          {/* Chart skeleton */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-55 w-full rounded-lg" />
          </div>

          {/* Quick access skeleton */}
          <div>
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border border-border p-3 flex items-center gap-3">
                  <Skeleton className="size-4 rounded" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    );
  }

  // Y-axis domain with padding
  const allValues = chartData.flatMap((d) => [d.Followers, d.Following]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const yPadding = Math.max(Math.round((maxVal - minVal) * 0.15), 5);

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-3.5">
            <p className="text-xs text-muted-foreground mb-1">Followers</p>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-heading text-2xl tracking-tight">
                {currentFollowers?.toLocaleString() ?? '—'}
              </span>
              {formatTrend(followerTrend)}
            </div>
          </div>

          <div className="rounded-lg border border-border p-3.5">
            <p className="text-xs text-muted-foreground mb-1">Following</p>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-heading text-2xl tracking-tight">
                {currentFollowing?.toLocaleString() ?? '—'}
              </span>
              {formatTrend(followingTrend)}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div>
          <div className="flex items-baseline justify-between mb-4">
            <h3 className="font-heading font-semibold text-base">Growth</h3>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 border-t-2 border-foreground" />
                Followers
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3 border-t-2 border-dashed border-foreground" />
                Following
              </span>
            </div>
          </div>

          {snapshots.length === 0 ? (
            <Empty className="h-48 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BarChart3Icon />
                </EmptyMedia>
                <EmptyTitle>No data yet</EmptyTitle>
                <EmptyDescription>
                  Your growth chart will appear shortly. Snapshots are recorded automatically every
                  day.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="-ml-2">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={{ stroke: 'var(--border)' }}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    width={42}
                    domain={[minVal - yPadding, maxVal + yPadding]}
                    tickFormatter={(v: number) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                    }
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border)' }} />
                  <Line
                    type="monotone"
                    dataKey="Followers"
                    stroke="var(--foreground)"
                    strokeWidth={1.5}
                    dot={{ r: 2.5, fill: 'var(--foreground)', strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: 'var(--background)', stroke: 'var(--foreground)', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Following"
                    stroke="var(--foreground)"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                    dot={{ r: 2.5, fill: 'var(--foreground)', strokeWidth: 0 }}
                    activeDot={{ r: 4, fill: 'var(--background)', stroke: 'var(--foreground)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick access */}
        <div>
          <h3 className="font-heading font-semibold text-base mb-3">Quick access</h3>
          <div className="grid grid-cols-2 gap-2">
            {shortcuts.map(({ tab, icon: Icon, label, description }) => (
              <button
                key={tab}
                type="button"
                onClick={() => onNavigate(tab)}
                className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-accent cursor-pointer"
              >
                <Icon className="size-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{description}</p>
                </div>
                <ChevronRightIcon className="size-3.5 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
