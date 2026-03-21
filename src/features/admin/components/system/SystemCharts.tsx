import { useIsDark } from '@/hooks/useIsDark';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export interface SystemStats {
  database: {
    totalUsers: number;
    totalMasters: number;
    totalLeads: number;
    totalReviews: number;
    totalPayments: number;
  };
  system: {
    memory: {
      total: string;
      used: string;
      free: string;
      usage: string;
    };
    cpu: {
      load: number[];
      cores: number;
    };
    uptime: string;
    platform: string;
  };
  redis: {
    connectedClients: number;
    usedMemory: string;
    totalCommands: number;
  };
  daily: {
    newUsers: number;
    newLeads: number;
    newReviews: number;
  };
}

function parseBytes(bytesStr: string): number {
  if (!bytesStr) return 0;
  const match = bytesStr.match(/^(\d+\.?\d*)\s*([KMGT]?B)$/);
  if (!match) return 0;
  const [, value, unit] = match;
  const multipliers: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
  };
  return parseFloat(value) * (multipliers[unit] || 1);
}

export function MemoryUsageChart({ data }: { data: SystemStats['system']['memory'] }) {
  const isDark = useIsDark();
  const used = parseBytes(data.used);
  const free = parseBytes(data.free);
  const chartData = [
    { name: 'Used', value: used, fill: isDark ? '#9e9e9e' : '#4A90E2' },
    { name: 'Free', value: free, fill: isDark ? '#424242' : '#e0e0e0' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={200}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) =>
            `${name}: ${(((percent ?? 0) as number) * 100).toFixed(1)}%`
          }
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          formatter={(value) => {
            const n = typeof value === 'number' ? value : Number(value ?? 0);
            return `${(n / 1024 ** 2).toFixed(2)} MB`;
          }}
        />
        <Legend wrapperStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function DailyMetricsChart({ data }: { data: SystemStats['daily'] }) {
  const isDark = useIsDark();
  const chartData = [
    { name: 'Users', value: data.newUsers, color: isDark ? '#9e9e9e' : '#4A90E2' },
    { name: 'Requests', value: data.newLeads, color: isDark ? '#757575' : '#6BA3E8' },
    { name: 'Reviews', value: data.newReviews, color: isDark ? '#616161' : '#357ABD' },
  ];

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
        <XAxis dataKey="name" stroke={isDark ? '#b0b0b0' : '#666666'} style={{ fontSize: '12px' }} />
        <YAxis stroke={isDark ? '#b0b0b0' : '#666666'} style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          labelStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }}
        />
        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DatabaseMetricsChart({ data }: { data: SystemStats['database'] }) {
  const isDark = useIsDark();
  const chartData = [
    { name: 'Users', value: data.totalUsers },
    { name: 'Masters', value: data.totalMasters },
    { name: 'Requests', value: data.totalLeads },
    { name: 'Reviews', value: data.totalReviews },
    { name: 'Payments', value: data.totalPayments },
  ];

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={200}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
        <XAxis dataKey="name" stroke={isDark ? '#b0b0b0' : '#666666'} style={{ fontSize: '12px' }} />
        <YAxis stroke={isDark ? '#b0b0b0' : '#666666'} style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          labelStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={isDark ? '#9e9e9e' : '#4A90E2'}
          fill={isDark ? 'rgba(158, 158, 158, 0.2)' : 'rgba(74, 144, 226, 0.2)'}
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CpuLoadChart({ load }: { load: number[] }) {
  const isDark = useIsDark();
  const chartData = load.map((value, index) => ({
    name: `Core ${index + 1}`,
    load: value,
  }));

  return (
    <ResponsiveContainer width="100%" height={300} minWidth={0} minHeight={200}>
      <BarChart data={chartData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} />
        <XAxis
          type="number"
          domain={[0, 100]}
          stroke={isDark ? '#b0b0b0' : '#666666'}
          style={{ fontSize: '12px' }}
        />
        <YAxis type="category" dataKey="name" stroke={isDark ? '#b0b0b0' : '#666666'} style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? '#252525' : '#ffffff',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : '#e0e0e0'}`,
            borderRadius: 8,
          }}
          labelStyle={{ color: isDark ? '#e8e8e8' : '#1a1a1a' }}
          formatter={(value) => {
            const n = typeof value === 'number' ? value : Number(value ?? 0);
            return `${n.toFixed(1)}%`;
          }}
        />
        <Bar dataKey="load" radius={[0, 8, 8, 0]}>
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                entry.load > 80
                  ? isDark ? '#f44336' : '#e57373'
                  : entry.load > 50
                    ? isDark ? '#ff9800' : '#ffb74d'
                    : isDark ? '#4caf50' : '#81c784'
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
