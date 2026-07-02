export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)

  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day

  d.setDate(d.getDate() + diff)

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const dayOfMonth = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${dayOfMonth}`
}
console.log("Now:", new Date())

export function getWeekNumber(weekStart: string): number {
  const start = new Date(weekStart)
  const epoch = new Date('2024-01-01')
  const diff = start.getTime() - epoch.getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}

type Member = {
  id: string
  name: string
  room: string | null
  is_away: boolean
}

type Chore = {
  id: string
  title: string
  scope: string
  room: string | null
  people_required: number
  house_id: string
}

type Assignment = {
  house_id: string
  chore_id: string
  assigned_to: string
  week_start: string
}

export function generateAssignments(
  chores: Chore[],
  members: Member[],
  weekStart: string
): Assignment[] {
  const weekNumber = getWeekNumber(weekStart)
  const assignments: Assignment[] = []

  // Only available members
  const availableMembers = members.filter(m => !m.is_away)

  // Track how many chores each member has been assigned this week
  // Key: member id, Value: count
  const choreCount: Record<string, number> = {}
  availableMembers.forEach(m => { choreCount[m.id] = 0 })

  for (const chore of chores) {
    const eligibleMembers = chore.scope === 'room'
      ? availableMembers.filter(m => m.room === chore.room)
      : availableMembers

    if (eligibleMembers.length === 0) continue

    // Rotate the starting point based on week number for fairness across weeks
    const rotated = [
      ...eligibleMembers.slice(weekNumber % eligibleMembers.length),
      ...eligibleMembers.slice(0, weekNumber % eligibleMembers.length)
    ]

    // Sort by who has the fewest chores so far this week
    const sorted = [...rotated].sort(
      (a, b) => (choreCount[a.id] ?? 0) - (choreCount[b.id] ?? 0)
    )

    // Assign as many people as the chore requires
    const assignees = sorted.slice(0, chore.people_required)

    for (const member of assignees) {
      assignments.push({
        house_id: chore.house_id,
        chore_id: chore.id,
        assigned_to: member.id,
        week_start: weekStart
      })
      choreCount[member.id] = (choreCount[member.id] ?? 0) + 1
    }
  }

  return assignments
}