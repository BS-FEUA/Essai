'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAppStore, ACCESS_LABELS, apiFetch } from '@/lib/store';
import { relativeTime } from './view-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  MessageSquare, Users, Mail, Send, Info, Check,
} from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

export function MessagesView() {
  const { member } = useAppStore();
  const [scope, setScope] = useState<'PLENIARY' | 'PRIVATE'>('PLENIARY');
  const [messages, setMessages] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sentFlash, setSentFlash] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [recipientId, setRecipientId] = useState('');

  useEffect(() => {
    if (scope === 'PRIVATE') {
      apiFetch<{ members: any[] }>('/api/members?page=1&limit=999')
        .then(d => setMembers(d.members))
        .catch(() => {});
    }
  }, [scope]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ scope, limit: '50' });
      if (scope === 'PRIVATE' && recipientId) params.set('recipientId', recipientId);
      const data = await apiFetch<{ messages: any[]; total: number }>(`/api/messages?${params}`);
      setMessages(data.messages);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [scope, recipientId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadMessages();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ content, scope, ...(scope === 'PRIVATE' ? { recipientId } : {}) }),
      });
      setContent('');
      setSentFlash(true);
      setTimeout(() => setSentFlash(false), 600);
      await loadMessages();
      setTimeout(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }, 50);
    } catch { /* ignore */ }
  };

  const senderInitials = (m: any) => `${m.sender?.firstName?.[0] || ''}${m.sender?.lastName?.[0] || ''}`.toUpperCase();

  return (
    <motion.div {...pageVariants} className="space-y-4 flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
      <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6 text-[var(--feua-green)]" />Messagerie</h1>

      <Tabs value={scope} onValueChange={(v) => setScope(v as 'PLENIARY' | 'PRIVATE')}>
        <TabsList>
          <TabsTrigger value="PLENIARY"><Users className="h-4 w-4 mr-1" />Plénière</TabsTrigger>
          <TabsTrigger value="PRIVATE"><Mail className="h-4 w-4 mr-1" />Privé</TabsTrigger>
        </TabsList>
      </Tabs>

      {scope === 'PRIVATE' && (
        <div className="flex items-center gap-3">
          <Label className="text-sm whitespace-nowrap">Destinataire :</Label>
          <Select value={recipientId} onValueChange={setRecipientId}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Sélectionner un membre" /></SelectTrigger>
            <SelectContent>
              {members.filter(m => m.id !== member?.id).map(m => (
                <SelectItem key={m.id} value={m.id}>{m.firstName} {m.lastName} — {ACCESS_LABELS[m.accessLevel]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages list */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-[var(--feua-gold)]/40 animate-fade-in-up">
              <p>Aucun message. Soyez le premier à écrire !</p>
            </div>
          ) : messages.map((m) => {
            const isOwn = m.senderId === member?.id;
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className={`text-xs ${isOwn ? 'bg-[var(--feua-green)] text-white' : 'bg-gray-200 text-gray-700'}`}>{senderInitials(m)}</AvatarFallback>
                </Avatar>
                <div className={`max-w-[75%] ${isOwn ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isOwn ? 'order-last' : ''}`}>{m.sender?.firstName} {m.sender?.lastName}</span>
                    <Badge variant="outline" className="text-[10px]">{ACCESS_LABELS[m.sender?.accessLevel] || m.sender?.accessLevel}</Badge>
                  </div>
                  <div className={`inline-block px-4 py-2.5 rounded-2xl text-sm ${isOwn ? 'bg-gradient-to-br from-[var(--feua-green)] to-emerald-700 text-white rounded-tr-sm shadow-md' : 'bg-muted border border-border/50 rounded-tl-sm shadow-sm'}`}>
                    {m.content}
                  </div>
                  <p className={`text-[10px] text-muted-foreground mt-1 ${isOwn ? 'text-right' : ''}`}>{relativeTime(m.createdAt)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hierarchical rules */}
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Info className="h-3 w-3" />Règles hiérarchiques : MIN ne peut pas envoyer en privé à MIN, MIX ne peut pas envoyer à MIX.</p>
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="flex gap-2 p-4 border-t bg-muted/40">
          <div className="relative flex-1">
            {sentFlash && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-msg-sent">
                <Check className="h-4 w-4 text-[var(--feua-green)]" />
              </div>
            )}
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={scope === 'PLENIARY' ? "Message à la plénière..." : "Message privé..."}
              className="flex-1 bg-background"
            />
          </div>
          <Button type="submit" className="bg-[var(--feua-green)] hover:bg-[var(--feua-green)]/90 text-white">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </Card>
    </motion.div>
  );
}
