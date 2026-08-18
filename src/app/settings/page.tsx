"use client";

import { useEffect, useState } from "react";
import { Match, SlotId, Team } from "@/lib/types";
import { MIN_TEAMS, MAX_TEAMS, SEPTEMBER_DAYS } from "@/lib/constants";
import { getSlotIds, matchGroupId } from "@/lib/groups";
import { reconcileMatches, reconcileSlots } from "@/lib/reconcile";
import { groupMatchesByDay } from "@/lib/matches";
import { useFullscreen } from "@/lib/useFullscreen";
import MatchRow from "@/components/MatchRow";
import MatchGroup from "@/components/MatchGroup";
import {
  loadMatches,
  loadSlots,
  loadTeams,
  saveMatches,
  saveSlots,
  saveTeams,
} from "@/lib/storage";
import { DEFAULT_MATCHES } from "@/lib/schedule";

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

// Converts a native <input type="time"> value ("HH:MM", 24h) to the
// "h:mm AM/PM" format used across the schedule (e.g. "6:00 PM").
function formatTime(time24: string): string {
  const [hoursStr, minutes] = time24.split(":");
  const hours24 = Number(hoursStr);
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes} ${period}`;
}

// Converts a "h:mm AM/PM" string back to the "HH:MM" (24h) value a native
// <input type="time"> expects, so the edit form can prefill it.
function toTimeInputValue(time: string | null): string {
  if (!time) return "";
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return "";
  const [, hoursStr, minutes, period] = match;
  let hours = Number(hoursStr) % 12;
  if (period.toUpperCase() === "PM") hours += 12;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

type Loaded = { teams: Team[]; matches: Match[] };

export default function SettingsPage() {
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const teams = loaded?.teams ?? [];
  const matches = loaded?.matches ?? [];
  const [newTeamName, setNewTeamName] = useState("");
  const [homeAlias, setHomeAlias] = useState<SlotId | "">("");
  const [awayAlias, setAwayAlias] = useState<SlotId | "">("");
  const [dayInput, setDayInput] = useState("");
  const [stageInput, setStageInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [teamError, setTeamError] = useState<string | null>(null);
  const [matchError, setMatchError] = useState<string | null>(null);
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [editHome, setEditHome] = useState("");
  const [editAway, setEditAway] = useState("");
  const [editDay, setEditDay] = useState("");
  const [editStage, setEditStage] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editNumber, setEditNumber] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR, so state must be hydrated
    // after mount to avoid a server/client markup mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded({ teams: loadTeams(), matches: loadMatches() });
  }, []);

  function setTeams(next: Team[]) {
    setLoaded((prev) => (prev ? { ...prev, teams: next } : prev));
  }

  function setMatches(next: Match[]) {
    setLoaded((prev) => (prev ? { ...prev, matches: next } : prev));
  }

  // Slot options for the match forms are based on the schedule's fixed
  // capacity (MAX_TEAMS), not how many teams have been named so far —
  // matches reference slot positions (A1, B3, ...) independent of whether
  // every team name has been entered yet.
  const slotIds = getSlotIds(MAX_TEAMS);

  function applyTeamsChange(nextTeams: Team[]) {
    setTeams(nextTeams);
    saveTeams(nextTeams);

    const nextSlots = reconcileSlots(nextTeams, loadSlots());
    saveSlots(nextSlots);

    // Only prune matches when the roster shrinks. Pruning on every add would
    // strip group-stage matches referencing slots (e.g. A5, B5) the admin
    // hasn't reached yet while still building up to the full team count.
    if (nextTeams.length < teams.length) {
      const nextMatches = reconcileMatches(nextTeams, matches);
      setMatches(nextMatches);
      saveMatches(nextMatches);
    }
  }

  function handleAddTeam(e: React.FormEvent) {
    e.preventDefault();
    const name = newTeamName.trim();
    if (!name) return;
    if (teams.length >= MAX_TEAMS) {
      setTeamError(`الحد الأقصى ${MAX_TEAMS} فرق.`);
      return;
    }
    if (teams.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      setTeamError("يجب أن تكون أسماء الفرق فريدة.");
      return;
    }
    setTeamError(null);
    applyTeamsChange([...teams, { id: makeId(), name }]);
    setNewTeamName("");
  }

  function handleRenameTeam(id: string, name: string) {
    const next = teams.map((t) => (t.id === id ? { ...t, name } : t));
    setTeams(next);
    saveTeams(next);
  }

  function handleRemoveTeam(id: string) {
    applyTeamsChange(teams.filter((t) => t.id !== id));
  }

  function handleAddMatch(e: React.FormEvent) {
    e.preventDefault();
    if (
      !homeAlias ||
      !awayAlias ||
      !dayInput ||
      !stageInput ||
      !timeInput ||
      !numberInput
    ) {
      setMatchError("جميع الحقول مطلوبة.");
      return;
    }
    if (homeAlias === awayAlias) {
      setMatchError("يجب أن يكون المضيف والضيف خانتين مختلفتين.");
      return;
    }
    const duplicate = matches.some(
      (m) =>
        (m.home === homeAlias && m.away === awayAlias) ||
        (m.home === awayAlias && m.away === homeAlias)
    );
    if (duplicate) {
      setMatchError("هذه المباراة موجودة بالفعل.");
      return;
    }

    const number = Number(numberInput);
    if (!Number.isInteger(number) || number <= 0) {
      setMatchError("رقم المباراة يجب أن يكون عددًا صحيحًا موجبًا.");
      return;
    }
    if (matches.some((m) => m.number === number)) {
      setMatchError("رقم المباراة هذا مستخدم بالفعل.");
      return;
    }

    setMatchError(null);
    const day = Number(dayInput);
    const stage = stageInput;
    const time = formatTime(timeInput);
    const next = [
      ...matches,
      {
        id: makeId(),
        number,
        home: homeAlias,
        away: awayAlias,
        day,
        time,
        stage,
      },
    ];
    setMatches(next);
    saveMatches(next);
    setHomeAlias("");
    setAwayAlias("");
    setDayInput("");
    setStageInput("");
    setTimeInput("");
    setNumberInput("");
  }

  function handleRemoveMatch(id: string) {
    const next = matches.filter((m) => m.id !== id);
    setMatches(next);
    saveMatches(next);
    if (editingMatchId === id) handleCancelEdit();
  }

  function handleStartEdit(m: Match) {
    setEditingMatchId(m.id);
    setEditHome(m.home);
    setEditAway(m.away);
    setEditDay(m.day ? String(m.day) : "");
    setEditStage(m.stage);
    setEditTime(toTimeInputValue(m.time));
    setEditNumber(String(m.number));
    setEditError(null);
  }

  function handleCancelEdit() {
    setEditingMatchId(null);
    setEditError(null);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingMatchId) return;
    if (
      !editHome ||
      !editAway ||
      !editDay ||
      !editStage ||
      !editTime ||
      !editNumber
    ) {
      setEditError("جميع الحقول مطلوبة.");
      return;
    }
    if (editHome === editAway) {
      setEditError("يجب أن يكون المضيف والضيف خانتين مختلفتين.");
      return;
    }
    const duplicate = matches.some(
      (m) =>
        m.id !== editingMatchId &&
        ((m.home === editHome && m.away === editAway) ||
          (m.home === editAway && m.away === editHome))
    );
    if (duplicate) {
      setEditError("هذه المباراة موجودة بالفعل.");
      return;
    }

    const number = Number(editNumber);
    if (!Number.isInteger(number) || number <= 0) {
      setEditError("رقم المباراة يجب أن يكون عددًا صحيحًا موجبًا.");
      return;
    }
    if (matches.some((m) => m.id !== editingMatchId && m.number === number)) {
      setEditError("رقم المباراة هذا مستخدم بالفعل.");
      return;
    }

    const next = matches.map((m) =>
      m.id === editingMatchId
        ? {
            ...m,
            home: editHome,
            away: editAway,
            day: Number(editDay),
            stage: editStage,
            time: formatTime(editTime),
            number,
          }
        : m
    );
    setMatches(next);
    saveMatches(next);
    handleCancelEdit();
  }

  function handleResetSchedule() {
    setMatches(DEFAULT_MATCHES);
    saveMatches(DEFAULT_MATCHES);
  }

  if (!loaded) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">الإعدادات</h1>
        <button
          type="button"
          onClick={toggleFullscreen}
          className="flex items-center gap-2 rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/70 hover:border-sky-400 hover:text-white transition-colors"
        >
          {isFullscreen ? "الخروج من ملء الشاشة" : "ملء الشاشة"}
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-1">الفرق</h2>
        <p className="text-sm text-white/60 mb-6">
          إدارة الفرق ({MIN_TEAMS}-{MAX_TEAMS}) المتاحة للقرعة.
        </p>

        {teams.length < MIN_TEAMS && (
          <p className="mb-4 rounded-md border border-amber-400/30 bg-amber-400/10 px-3 py-2 text-sm text-amber-300">
            أضف {MIN_TEAMS} فرق على الأقل لإجراء قرعة صحيحة.
          </p>
        )}

        <div className="space-y-2 mb-4">
          {teams.map((team, index) => (
            <div key={team.id} className="flex items-center gap-2">
              <span className="w-6 text-right text-sm text-white/40">
                {index + 1}.
              </span>
              <input
                type="text"
                value={team.name}
                onChange={(e) => handleRenameTeam(team.id, e.target.value)}
                className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={() => handleRemoveTeam(team.id)}
                className="text-white/40 hover:text-red-400 px-2"
                aria-label="إزالة الفريق"
              >
                ✕
              </button>
            </div>
          ))}
          {teams.length === 0 && (
            <p className="text-sm text-white/40 italic">لا يوجد فرق بعد.</p>
          )}
        </div>

        <form onSubmit={handleAddTeam} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="اسم الفريق الجديد"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            disabled={teams.length >= MAX_TEAMS}
            className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-40"
          />
          <button
            type="submit"
            disabled={teams.length >= MAX_TEAMS}
            className="rounded-md bg-[#0353a4] hover:bg-[#03468a] disabled:opacity-40 disabled:hover:bg-[#0353a4] text-white text-sm font-medium px-4 py-2 transition-colors"
          >
            إضافة
          </button>
        </form>
        {teamError && <p className="mt-2 text-sm text-red-400">{teamError}</p>}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-2xl font-bold text-white">المباريات</h2>
          <button
            type="button"
            onClick={handleResetSchedule}
            className="rounded-md border border-white/20 px-3 py-1.5 text-sm font-medium text-white/70 hover:border-sky-400 hover:text-white transition-colors"
          >
            إعادة تعيين الجدول الرسمي
          </button>
        </div>
        <p className="text-sm text-white/60 mb-6">
          قم بإقران خانات المجموعات (مثل A1 مقابل A2)، وحدد اليوم والوقت
          واسم المجموعة ورقم المباراة — جميع الحقول مطلوبة (يمكنك إدخال رقم
          مباراة محذوفة لإعادة استخدامه). بمجرد توزيع الفرق على هذه الخانات،
          ستعرض الصفحة الرئيسية أسماء الفرق الحقيقية والتاريخ.
        </p>

        <div className="space-y-4 mb-4">
          {groupMatchesByDay(matches).map((group) => {
            const isKnockoutDay = group.matches.every((m) => m.number >= 21);
            return (
              <MatchGroup
                key={group.day ?? "none"}
                day={group.day}
                stage={isKnockoutDay ? group.matches[0]?.stage : undefined}
              >
                {group.matches.map((m) =>
                  editingMatchId === m.id ? (
                    <form
                      key={m.id}
                      onSubmit={handleSaveEdit}
                      className="space-y-2 px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <select
                          value={editHome}
                          onChange={(e) => setEditHome(e.target.value)}
                          required
                          className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          <option value="" className="bg-[#123246]">
                            الفريق المضيف
                          </option>
                          {slotIds.map((id) => (
                            <option key={id} value={id} className="bg-[#123246]">
                              {id}
                            </option>
                          ))}
                        </select>
                        <span className="text-xs text-white/40">ضد</span>
                        <select
                          value={editAway}
                          onChange={(e) => setEditAway(e.target.value)}
                          required
                          className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          <option value="" className="bg-[#123246]">
                            الفريق الضيف
                          </option>
                          {slotIds.map((id) => (
                            <option key={id} value={id} className="bg-[#123246]">
                              {id}
                            </option>
                          ))}
                        </select>
                        <select
                          value={editDay}
                          onChange={(e) => setEditDay(e.target.value)}
                          required
                          className="w-28 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          <option value="" className="bg-[#123246]">
                            اليوم
                          </option>
                          {Array.from(
                            { length: SEPTEMBER_DAYS },
                            (_, i) => i + 1
                          ).map((day) => (
                            <option key={day} value={day} className="bg-[#123246]">
                              {day} سبتمبر
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={editStage}
                          onChange={(e) => setEditStage(e.target.value)}
                          required
                          className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        >
                          <option value="" className="bg-[#123246]">
                            اسم المجموعة
                          </option>
                          <option value="المجموعة الأولى" className="bg-[#123246]">
                            المجموعة الأولى
                          </option>
                          <option value="المجموعة الثانية" className="bg-[#123246]">
                            المجموعة الثانية
                          </option>
                        </select>
                        <input
                          type="time"
                          value={editTime}
                          onChange={(e) => setEditTime(e.target.value)}
                          required
                          className="w-32 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                        <input
                          type="number"
                          min={1}
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          required
                          className="w-24 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                        />
                        <button
                          type="submit"
                          className="rounded-md bg-[#0353a4] hover:bg-[#03468a] text-white text-sm font-medium px-3 py-2 transition-colors"
                        >
                          حفظ
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="rounded-md border border-white/20 px-3 py-2 text-sm font-medium text-white/70 hover:border-red-400 hover:text-red-400 transition-colors"
                        >
                          إلغاء
                        </button>
                      </div>
                      {editError && (
                        <p className="text-sm text-red-400">{editError}</p>
                      )}
                    </form>
                  ) : (
                    <MatchRow
                      key={m.id}
                      number={m.number}
                      home={m.home}
                      away={m.away}
                      time={m.time}
                      groupId={isKnockoutDay ? null : matchGroupId(m.home)}
                      action={
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(m)}
                            className="text-white/40 hover:text-sky-400 px-2"
                            aria-label="تعديل المباراة"
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMatch(m.id)}
                            className="text-white/40 hover:text-red-400 px-2"
                            aria-label="إزالة المباراة"
                          >
                            ✕
                          </button>
                        </div>
                      }
                    />
                  )
                )}
              </MatchGroup>
            );
          })}
          {matches.length === 0 && (
            <p className="text-sm text-white/40 italic">لا توجد مباريات بعد.</p>
          )}
        </div>

        <form onSubmit={handleAddMatch} className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={homeAlias}
              onChange={(e) => setHomeAlias(e.target.value as SlotId)}
              required
              className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="" className="bg-[#123246]">
                الفريق المضيف
              </option>
              {slotIds.map((id) => (
                <option key={id} value={id} className="bg-[#123246]">
                  {id}
                </option>
              ))}
            </select>
            <span className="text-xs text-white/40">ضد</span>
            <select
              value={awayAlias}
              onChange={(e) => setAwayAlias(e.target.value as SlotId)}
              required
              className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="" className="bg-[#123246]">
                الفريق الضيف
              </option>
              {slotIds.map((id) => (
                <option key={id} value={id} className="bg-[#123246]">
                  {id}
                </option>
              ))}
            </select>
            <select
              value={dayInput}
              onChange={(e) => setDayInput(e.target.value)}
              required
              className="w-28 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="" className="bg-[#123246]">
                اليوم
              </option>
              {Array.from({ length: SEPTEMBER_DAYS }, (_, i) => i + 1).map(
                (day) => (
                  <option key={day} value={day} className="bg-[#123246]">
                    {day} سبتمبر
                  </option>
                )
              )}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={stageInput}
              onChange={(e) => setStageInput(e.target.value)}
              required
              className="flex-1 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="" className="bg-[#123246]">
                اسم المجموعة
              </option>
              <option value="المجموعة الأولى" className="bg-[#123246]">
                المجموعة الأولى
              </option>
              <option value="المجموعة الثانية" className="bg-[#123246]">
                المجموعة الثانية
              </option>
            </select>
            <input
              type="time"
              value={timeInput}
              onChange={(e) => setTimeInput(e.target.value)}
              required
              className="w-32 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="number"
              min={1}
              placeholder={`رقم المباراة (${
                matches.reduce((max, m) => Math.max(max, m.number), 0) + 1
              })`}
              value={numberInput}
              required
              onChange={(e) => setNumberInput(e.target.value)}
              className="w-40 rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="submit"
              className="rounded-md bg-[#0353a4] hover:bg-[#03468a] text-white text-sm font-medium px-4 py-2 transition-colors"
            >
              إضافة
            </button>
          </div>
        </form>
        {matchError && (
          <p className="mt-2 text-sm text-red-400">{matchError}</p>
        )}
      </div>
    </div>
  );
}
