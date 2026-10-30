import { requireUser } from '@/lib/guards';
import { listJoinableGroups } from '@/actions/groups';
import { GroupList } from '@/components/groups/group-list';
import { CreateGroupDialog } from '@/components/groups/create-group-dialog';

export default async function GroupsPage() {
  const user = await requireUser();
  const groups = await listJoinableGroups(user.id);
  const mine = groups.filter((g) => g.isMember);
  const others = groups.filter((g) => !g.isMember);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Grupos</h1>
          <p className="text-sm text-muted-foreground">Entre em um grupo ou crie o seu.</p>
        </div>
        <CreateGroupDialog />
      </div>

      {mine.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold">Meus grupos</h2>
          <GroupList groups={mine} />
        </section>
      )}

      {(others.length > 0 || mine.length === 0) && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold">Explorar</h2>
          <GroupList
            groups={others}
            emptyMessage="Nenhum grupo ainda. Crie o primeiro!"
          />
        </section>
      )}
    </div>
  );
}
