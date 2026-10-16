"use client";

import React from "react";
import {
  Users,
  Phone,
  Mail,
  Clock,
  GraduationCap,
  ShieldCheck,
  Building,
} from "lucide-react";
import { BureauMember } from "@/types";
import { ROLE_INFOS } from "@/lib/data";

interface BureauMembersSectionProps {
  members: BureauMember[];
  isAdminMode: boolean;
}

export const BureauMembersSection: React.FC<BureauMembersSectionProps> = ({
  members,
}) => {
  return (
    <section className="space-y-6">
      <div className="bg-gradient-to-r from-feua-dark via-slate-900 to-feua-dark text-white p-6 rounded-2xl shadow-md border border-emerald-800/40">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Membres du Bureau Sectoriel Exécutif (BS-Lokossa)
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Élus par les étudiants pour la défense de vos droits et la médiation auprès de la Direction Générale du Centre Universitaire.
            </p>
          </div>
        </div>
      </div>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-600">
          Aucun membre du Bureau n&apos;a encore été officiellement ajouté.
        </p>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {members.map((member) => {
          const roleMeta = ROLE_INFOS[member.role];
          return (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-600/30 shadow-sm"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1 rounded-full text-[10px]">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                  </div>

                  <div className="space-y-1 flex-1">
                    <span
                      className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full ${roleMeta.badgeColor}`}
                    >
                      {roleMeta.title}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">
                      {member.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <GraduationCap className="w-3.5 h-3.5 text-feua" />
                      <span>{member.filiere}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed italic">
                  &quot;{roleMeta.description}&quot;
                </p>

                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                    <span className="font-medium text-slate-800">
                      Permanence: {member.officeHours}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span className="text-slate-600">Niveau: {member.niveau}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${member.phone}`}
                  className="bg-emerald-50 hover:bg-emerald-100 text-feua font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-center border border-emerald-200"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Appeler</span>
                </a>

                <a
                  href={`mailto:${member.email}`}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 text-center border border-slate-200"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Courriel</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </section>
  );
};
