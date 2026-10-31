import { Avatar } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, HelpCircle, Trophy, Flame } from 'lucide-react';

type Summary = {
  groups: { id: string; name: string; emoji: string; members: number; questions: number }[];
  answerers: { username: string; emoji: string; answered: number; points: number }[];
  totals: { users: number; groups: number; questions: number };
};

export function PublicSummary({ summary }: { summary: Summary }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Stat label="Grupos" value={summary.totals.groups} />
        <Stat label="Perguntas" value={summary.totals.questions} />
        <Stat label="Valentes" value={summary.totals.users} />
      </div>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Users className="h-5 w-5 text-neon-cyan" />
          <CardTitle>Ultimos grupos</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {summary.groups.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum grupo ainda. Crie o primeiro!</p>
          )}
          {summary.groups.map((g) => (
            <div key={g.id} className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2">
              <span className="text-2xl">{g.emoji}</span>
              <span className="min-w-0 flex-1 truncate font-semibold">{g.name}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Users className="h-3.5 w-3.5" />{g.members}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><HelpCircle className="h-3.5 w-3.5" />{g.questions}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Flame className="h-5 w-5 text-neon-pink" />
          <CardTitle>Ultimos que responderam</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {summary.answerers.length === 0 && (
            <p className="text-sm text-muted-foreground">Ninguem respondeu ainda. Seja o primeiro!</p>
          )}
          {summary.answerers.map((a, i) => (
            <div key={a.username + i} className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2">
              <Avatar seed={a.username} emoji={a.emoji} size={32} />
              <span className="min-w-0 flex-1 truncate font-semibold">{a.username}</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><HelpCircle className="h-3.5 w-3.5" />{a.answered}</span>
              <span className="inline-flex items-center gap-1 font-display text-xs font-bold text-gradient"><Trophy className="h-3.5 w-3.5" />{a.points}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border glass p-3 sm:p-4">
      <span className="font-display text-2xl font-extrabold text-gradient">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
