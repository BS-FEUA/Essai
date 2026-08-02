"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  PlusCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  BookmarkCheck,
} from "lucide-react";
import { UnionEvent, UserRole } from "@/types";
import { ROLE_INFOS } from "@/lib/data";
import { formatDate } from "@/lib/utils";

interface EventsSectionProps {
  events: UnionEvent[];
  isAdminMode: boolean;
  onOpenNewEvent: () => void;
  onRegisterEvent: (eventId: string) => void;
}

export const EventsSection: React.FC<EventsSectionProps> = ({
  events,
  isAdminMode,
  onOpenNewEvent,
  onRegisterEvent,
}) => {
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);

  const handleToggleRegistration = (eventId: string) => {
    if (!registeredEvents.includes(eventId)) {
      setRegisteredEvents([...registeredEvents, eventId]);
      onRegisterEvent(eventId);
    }
  };

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl ring-1 ring-slate-200/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-feua" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Agenda des Assemblées Générales & Activités Syndicales
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Participez activement aux prises de décisions collectives et aux séances d&apos;accompagnement académique sur le campus.
          </p>
        </div>

        {isAdminMode && (
          <button
            onClick={onOpenNewEvent}
            className="bg-feua hover:bg-feua-dark text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>Programmer un événement</span>
          </button>
        )}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {events.map((evt) => {
          const isUserRegistered = registeredEvents.includes(evt.id);
          const roleInfo = ROLE_INFOS[evt.organizerRole];

          return (
            <div
              key={evt.id}
              className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                    {evt.type}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {evt.status}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">
                  {evt.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {evt.description}
                </p>

                {/* Event Metadata */}
                <div className="space-y-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-feua flex-shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {formatDate(evt.date)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>{evt.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span className="font-medium text-slate-700">
                      {evt.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>
                      {evt.registeredCount}{" "}
                      {evt.maxParticipants ? `/ ${evt.maxParticipants}` : ""}{" "}
                      participants inscrits
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleToggleRegistration(evt.id)}
                  disabled={isUserRegistered}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                    isUserRegistered
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default"
                      : "bg-feua hover:bg-feua-dark text-white shadow-sm"
                  }`}
                >
                  {isUserRegistered ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-700" />
                      <span>Inscription Confirmée</span>
                    </>
                  ) : (
                    <>
                      <Users className="w-4 h-4 text-amber-300" />
                      <span>S&apos;inscrire à cet événement</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
