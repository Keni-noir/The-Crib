'use client'

import { useState } from 'react'
import {
  markComplete,
  requestSwap,
  respondToSwap,
  confirmCompletion,
  rejectCompletion
} from '@/app/actions/chores'
import { toggleAway, reassignAwayChores, reclaimChores } from '@/app/actions/house'

import NotificationBell from '@/components/ui/NotificationBell'

type Profile = { id: string; name: string; room: string | null }

type Chore = {
  id: string
  title: string
  frequency: string
  scope: string
  room: string | null
}

type Assignment = {
  id: string
  completed: boolean
  completed_at: string | null
  status: string
  week_start: string
  assigned_to: string
  chores: Chore
  profiles: Profile
}

type SwapRequest = {
  id: string
  status: string
  assignment_id: string
  requester_id: string
  target_id: string
  profiles: { name: string }
}

type Notification = {
  id: string
  type: string
  message: string
  is_read: boolean
  created_at: string
}

type Props = {
  currentUser: {
    id: string
    name: string
    house_id: string
    role: string
    room: string | null
    is_away: boolean
  }
  assignments: Assignment[]
  members: Profile[]
  swapRequests: SwapRequest[]
  notifications: Notification[]
  house: { name: string; invite_code: string } | null
  weekStart: string
}

export default function DashboardClient({
  currentUser,
  assignments,
  members,
  swapRequests,
  house,
  weekStart,
  notifications,
}: Props) {
  const [swapTarget, setSwapTarget] = useState<string | null>(null)
  const [activeAssignment, setActiveAssignment] = useState<string | null>(null)
  const [isAway, setIsAway] = useState(currentUser.is_away)
  const [awayLoading, setAwayLoading] = useState(false)

  const myAssignments = assignments.filter(a => a.assigned_to === currentUser.id)
  const houseAssignments = assignments.filter(a => a.assigned_to !== currentUser.id)
  const incomingSwaps = swapRequests.filter(s => s.target_id === currentUser.id)
  const pendingConfirmations = assignments.filter(a => a.status === 'pending_confirmation')

  async function handleComplete(assignmentId: string) {
    await markComplete(assignmentId)
  }

  async function handleSwapRequest(assignmentId: string) {
    if (!swapTarget) return
    await requestSwap(assignmentId, swapTarget)
    setActiveAssignment(null)
    setSwapTarget(null)
  }

  async function handleSwapResponse(
    swapId: string,
    action: 'accepted' | 'rejected',
    assignmentId: string,
    requesterId: string
  ) {
    await respondToSwap(swapId, action, assignmentId, requesterId)
  }

  async function handleAwayToggle() {
    setAwayLoading(true)
    const newAwayState = !isAway
    await toggleAway(newAwayState)
    if (newAwayState) {
      await reassignAwayChores(currentUser.id)
    } else {
      await reclaimChores(currentUser.id)
    }
    setIsAway(newAwayState)
    setAwayLoading(false)
  }

  return (
    <div className="relative min-h-screen bg-[#FAF9F7] text-[#0D0B08]" style={{ fontFamily: "Geist, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial" }}>

      <div className="absolute top-6 right-6 z-20 flex gap-2">
        <NotificationBell userId={currentUser.id} initialNotifications={notifications} />
        <button
          type="button"
          className="h-8 w-8 rounded-[5px] border border-[#D4CFC6] bg-white text-[#0D0B08] flex items-center justify-center"
          aria-label="Toggle theme"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3v2M12 19v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M3 12h2M19 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 100 10 5 5 0 000-10z" />
          </svg>
        </button>
      </div>

      <div className="mx-auto w-full max-w-[680px] px-6 py-0">
        <div className="w-full space-y-6">

          {/* Header */}
          <div className="space-y-2">
            <div className="min-w-0">
              <h1 className="text-[18px] font-medium leading-tight">{house?.name ?? "AJ's Crib"}</h1>
              <p className="mt-2 text-[12px] text-[#8A8478]">
                Week of {new Date(weekStart + 'T00:00:00').toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long'
                })}
              </p>
              {currentUser.role === 'admin' && house?.invite_code && (
                <p className="mt-1 text-[12px] text-[#8A8478]">
                  Invite code:{' '}
                  <span className="font-mono font-medium text-[#0D0B08]">{house.invite_code}</span>
                </p>
              )}
            </div>
          </div>

          {/* Away mode toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: isAway ? '#FAEEDA' : '#FFFFFF',
              border: `1px solid ${isAway ? '#FAC775' : '#D4CFC6'}`,
              borderRadius: '5px',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: '#0D0B08' }}>
                {isAway ? "You're marked as away" : 'Going away?'}
              </p>
              <p style={{ fontSize: '11px', color: '#8A8478', marginTop: '2px' }}>
                {isAway
                  ? 'Your chores have been reassigned this week'
                  : 'Your chores will be reassigned to others'}
              </p>
            </div>
            <button
              onClick={handleAwayToggle}
              disabled={awayLoading}
              style={{
                padding: '6px 12px',
                borderRadius: '5px',
                border: `1px solid ${isAway ? '#FAC775' : '#D4CFC6'}`,
                background: 'transparent',
                fontSize: '12px',
                fontWeight: 500,
                color: isAway ? '#854F0B' : '#8A8478',
                cursor: awayLoading ? 'not-allowed' : 'pointer',
                opacity: awayLoading ? 0.5 : 1,
                transition: 'opacity 0.15s',
              }}
            >
              {awayLoading ? '...' : isAway ? 'I am back' : 'Mark away'}
            </button>
          </div>

          {/* Pending chores banner */}
          {myAssignments.filter(a => a.status === 'incomplete').length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'flex-start',
                padding: '12px 14px',
                background: '#FFF4D6',
                border: '1px solid #FAC775',
                borderRadius: '5px',
              }}
            >
              <p style={{ fontSize: '12px', color: '#0D0B08', lineHeight: 1.5 }}>
                <strong>{myAssignments.filter(a => a.status === 'incomplete').length} chore(s) still pending.</strong>{' '}
                {myAssignments
                  .filter(a => a.status === 'incomplete')
                  .map(a => a.chores.title)
                  .join(', ')}{' '}
                {myAssignments.filter(a => a.status === 'incomplete').length === 1 ? "hasn't" : "haven't"} been marked done yet.
              </p>
            </div>
          )}

          {/* Admin confirmation section */}
          {currentUser.role === 'admin' && pendingConfirmations.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8478]">Awaiting confirmation</p>
              <div className="space-y-3">
                {pendingConfirmations.map(assignment => (
                  <div key={assignment.id} className="rounded-[5px] border border-[#D4CFC6] bg-white p-4">
                    <div className="space-y-1">
                      <p className="text-[13px] font-medium text-[#0D0B08]">{assignment.chores.title}</p>
                      <p className="text-[11px] text-[#8A8478]">Marked done by {assignment.profiles.name}</p>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => confirmCompletion(assignment.id)}
                        className="flex-1 h-[34px] rounded-[5px] bg-[#0D0B08] text-[12px] font-medium text-[#FAF9F7]"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectCompletion(assignment.id)}
                        className="flex-1 h-[34px] rounded-[5px] border border-[#D4CFC6] bg-white text-[12px] font-medium text-[#0D0B08]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Swap requests */}
          {incomingSwaps.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8478]">Swap requests</p>
              <div className="space-y-3">
                {incomingSwaps.map(swap => {
                  const assignment = assignments.find(a => a.id === swap.assignment_id)
                  return (
                    <div key={swap.id} className="rounded-[5px] border border-[#D4CFC6] bg-white p-4">
                      <p className="text-[13px] text-[#0D0B08]">
                        <span className="font-medium">{swap.profiles.name}</span>{' '}
                        wants to swap{' '}
                        <span className="font-medium">{assignment?.chores.title ?? 'a chore'}</span>
                        {' '}with you
                      </p>
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleSwapResponse(swap.id, 'accepted', swap.assignment_id, swap.requester_id)}
                          className="flex-1 h-[34px] rounded-[5px] bg-[#0D0B08] text-[12px] font-medium text-[#FAF9F7]"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleSwapResponse(swap.id, 'rejected', swap.assignment_id, swap.requester_id)}
                          className="flex-1 h-[34px] rounded-[5px] border border-[#D4CFC6] bg-white text-[12px] font-medium text-[#0D0B08]"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* My chores */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8478]">Your chores this week</p>
            <div className="space-y-3">
              {myAssignments.length === 0 ? (
                <p className="text-[13px] text-[#8A8478] text-center py-8">
                  {isAway ? 'You are away this week.' : 'No chores assigned yet.'}
                </p>
              ) : (
                myAssignments.map(assignment => {
                  const isCompleted = assignment.status === 'completed'
                  const isPending = assignment.status === 'pending_confirmation'
                  const isRejected = assignment.status === 'rejected'
                  const isIncomplete = assignment.status === 'incomplete'

                  let badge = null
                  if (isCompleted) {
                    badge = (
                      <span className="inline-flex items-center rounded-full bg-[#E6F5EA] px-2 py-1 text-[11px] font-medium text-[#1A6A2C]">
                        Confirmed
                      </span>
                    )
                  } else if (isPending) {
                    badge = (
                      <span className="inline-flex items-center rounded-full bg-[#FFF4D6] px-2 py-1 text-[11px] font-medium text-[#8A5B00]">
                        Awaiting approval
                      </span>
                    )
                  } else if (isRejected) {
                    badge = (
                      <span className="inline-flex items-center rounded-full bg-[#FDE7E7] px-2 py-1 text-[11px] font-medium text-[#9F1F1F]">
                        Rejected — redo
                      </span>
                    )
                  }

                  return (
                    <div key={assignment.id} className="rounded-[5px] border border-[#D4CFC6] bg-white p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-[13px] font-medium ${isCompleted ? 'line-through text-[#8A8478]' : 'text-[#0D0B08]'}`}>
                            {assignment.chores.title}
                          </p>
                          <p className="mt-1 text-[11px] text-[#8A8478] capitalize">{assignment.chores.frequency}</p>
                        </div>
                        {badge}
                        {isIncomplete && (
                          <button
                            onClick={() => handleComplete(assignment.id)}
                            className="h-[30px] rounded-[5px] border border-[#D4CFC6] bg-white px-3 text-[12px] font-medium text-[#0D0B08]"
                          >
                            Mark done
                          </button>
                        )}
                      </div>

                      {isIncomplete && (
                        <div>
                          {activeAssignment === assignment.id ? (
                            <div className="space-y-3">
                              <select
                                value={swapTarget ?? ''}
                                onChange={e => setSwapTarget(e.target.value)}
                                className="w-full rounded-[5px] border border-[#D4CFC6] bg-white px-3 py-2 text-sm text-[#0D0B08] outline-none"
                              >
                                <option value="">Select someone to swap with</option>
                                {members
                                  .filter(m => m.id !== currentUser.id)
                                  .map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                  ))}
                              </select>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSwapRequest(assignment.id)}
                                  disabled={!swapTarget}
                                  className="flex-1 h-[34px] rounded-[5px] bg-[#0D0B08] text-[12px] font-medium text-[#FAF9F7] disabled:opacity-50"
                                >
                                  Send request
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveAssignment(null)
                                    setSwapTarget(null)
                                  }}
                                  className="flex-1 h-[34px] rounded-[5px] border border-[#D4CFC6] bg-white text-[12px] font-medium text-[#0D0B08]"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setActiveAssignment(assignment.id)}
                              className="text-[13px] text-[#8A8478] underline"
                            >
                              Request swap
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Rest of the house */}
          {houseAssignments.length > 0 && (
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#8A8478]">Rest of the house</p>
              <div className="space-y-2">
                {houseAssignments.map(assignment => {
                  let statusIcon = null
                  let statusTextClasses = 'text-[11px] font-medium'
                  if (assignment.status === 'completed') {
                    statusIcon = <span className="text-[#1A6A2C]">✓</span>
                    statusTextClasses += ' text-[#1A6A2C]'
                  } else if (assignment.status === 'pending_confirmation') {
                    statusIcon = <span className="text-[#8A5B00]">⏳</span>
                    statusTextClasses += ' text-[#8A5B00]'
                  } else if (assignment.status === 'rejected') {
                    statusIcon = <span className="text-[#9F1F1F]">✗</span>
                    statusTextClasses += ' text-[#9F1F1F]'
                  } else {
                    statusIcon = <span className="text-[#8A8478]">Pending</span>
                    statusTextClasses += ' text-[#8A8478]'
                  }

                  return (
                    <div key={assignment.id} className="rounded-[5px] border border-[#D4CFC6] bg-white p-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[#0D0B08] truncate">{assignment.chores.title}</p>
                        <p className="mt-1 text-[11px] text-[#8A8478] truncate">{assignment.profiles.name}</p>
                      </div>
                      <div className={statusTextClasses}>{statusIcon}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t border-[#D4CFC6] bg-[#FAF9F7]">
        <div className="mx-auto flex max-w-[680px] justify-between px-6 py-3">
          <a href="/dashboard" className="flex flex-col items-center gap-1 text-[#0D0B08] text-[11px] font-medium">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12L12 3l9 9v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z" />
            </svg>
            Home
          </a>
          <a href="/chores" className="flex flex-col items-center gap-1 text-[#8A8478] text-[11px] font-medium">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Chores
          </a>
          <a href="/chat" className="flex flex-col items-center gap-1 text-[#8A8478] text-[11px] font-medium">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
            Chat
          </a>
        </div>
      </nav>

      <div className="h-20" />
    </div>
  )
}